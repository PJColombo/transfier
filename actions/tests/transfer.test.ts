import { TestRuntime, TestTransactionEvent } from "@tenderly/actions-test";
import TelegramBot from "node-telegram-bot-api";
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { transferNotifierFn } from "../transfer";
import unknownNetworkErc20Tx from "./fixtures/UnknownNetworkTxPayload.json";
import nativeTokenTx from "./fixtures/NativeTokenTransferTxPayload.json";
import erc20TokenTx from "./fixtures/ERC20TransferTxPayload.json";
import { NETWORKS } from "../utils/networks";
import { buildTxReceiptUrl, ERC20_INTERFACE } from "../utils";
import { Contract, providers } from "ethers";
import { TxTransfersInfo } from "../types";
import { buildTelegramMessage } from "../telegram-bot";

const RPC_ENDPOINT = "http://localhost:8545";

const setRPCEndpointSecret = (
  runtime: TestRuntime,
  networkId: string,
  rpcEndpoint = RPC_ENDPOINT
) =>
  runtime.context.secrets.put(
    `${NETWORKS[networkId].name.toUpperCase()}_RPC_ENDPOINT`,
    rpcEndpoint
  );

vi.mock("node-telegram-bot-api", () => {
  const TelegramBot = vi.fn();

  TelegramBot.prototype.sendMessage = vi
    .fn()
    .mockImplementation((chatId, message) => {
      return {
        chat: {
          id: chatId,
        },
        message,
      };
    });

  return { default: TelegramBot };
});

describe("Transfier", () => {
  const CHAT_ID = "1";
  const BOT_TOKEN = "telegram-token";
  let runtime: TestRuntime;
  let telegramBot: TelegramBot;
  let provider: providers.Provider;

  beforeAll(() => {
    provider = new providers.JsonRpcProvider();
  });

  beforeEach(() => {
    runtime = new TestRuntime();
    runtime.context.secrets.put("TELEGRAM_BOT_TOKEN", BOT_TOKEN);
    runtime.context.secrets.put("TELEGRAM_CHAT_ID", CHAT_ID);

    telegramBot = new TelegramBot(BOT_TOKEN);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });

  it("notifies an incoming native token transfer tx correctly", async () => {
    const nativeTokenTransferEvent = nativeTokenTx as TestTransactionEvent;

    setRPCEndpointSecret(runtime, nativeTokenTransferEvent.network);

    await runtime.execute(transferNotifierFn, nativeTokenTransferEvent);

    const { from, network: networkId, value } = nativeTokenTransferEvent;
    const network = NETWORKS[networkId];
    const currentBalance = await provider.getBalance(from);
    const expectedTxInfo: TxTransfersInfo = {
      from,
      network,
      receiptUrl: buildTxReceiptUrl(nativeTokenTransferEvent, network),
      transfers: [
        {
          amount: value,
          currentBalance: currentBalance.toString(),
          token: network.nativeToken,
        },
      ],
    };
    const expectedMessage = buildTelegramMessage(expectedTxInfo);

    expect(telegramBot.sendMessage).to.be.toBeCalledWith(
      CHAT_ID,
      expectedMessage,
      {
        parse_mode: "Markdown",
      }
    );
  });

  it("notifies an incoming erc20 token transfer correctly", async () => {
    const erc20TokenTransferEvent = erc20TokenTx as TestTransactionEvent;

    setRPCEndpointSecret(runtime, erc20TokenTransferEvent.network);

    await runtime.execute(transferNotifierFn, erc20TokenTransferEvent);

    const { from, network: networkId, to } = erc20TokenTransferEvent;
    const network = NETWORKS[networkId];
    const eventLog = erc20TokenTransferEvent.logs[0];
    const decodedEvent = ERC20_INTERFACE.decodeEventLog(
      "Transfer",
      eventLog.data,
      eventLog.topics
    );
    const tokenContract = new Contract(to!, ERC20_INTERFACE, provider);
    const currentBalance = await tokenContract.balanceOf(from);
    const [decimals, name, symbol] = await Promise.all([
      tokenContract.decimals(),
      tokenContract.name(),
      tokenContract.symbol(),
    ]);
    const expectedTxInfo: TxTransfersInfo = {
      from,
      network,
      receiptUrl: buildTxReceiptUrl(erc20TokenTransferEvent, network),
      transfers: [
        {
          amount: decodedEvent.value,
          currentBalance,
          token: {
            decimals,
            name,
            symbol,
          },
        },
      ],
    };
    const expectedMessage = buildTelegramMessage(expectedTxInfo);

    expect(telegramBot.sendMessage).to.be.toBeCalledWith(
      CHAT_ID,
      expectedMessage,
      {
        parse_mode: "Markdown",
      }
    );
  });

  it("fails when receiving a transfer from an unknown network", async () => {
    const erc20TransferEvent = unknownNetworkErc20Tx as TestTransactionEvent;

    await expect(() =>
      runtime.execute(transferNotifierFn, erc20TransferEvent)
    ).rejects.toThrowErrorMatchingInlineSnapshot('"Network 4 not supported"');
  });
});
