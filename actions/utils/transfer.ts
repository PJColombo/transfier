import { TransactionEvent } from "@tenderly/actions";
import { Interface } from "ethers/lib/utils";
import { addressesEqual } from "./address";
import erc20Abi from "../abis/ERC20.json";
import {
  DecodedTransferEvent,
  Network,
  TokenTransferInfo,
  TxTransfersInfo,
} from "../types";
import { BigNumber, Contract, providers } from "ethers";
import { ERC20_INTERFACE } from "./interfaces";

export const getTxTokenTransfers = async (
  tx: TransactionEvent,
  provider: providers.Provider,
  network: Network
): Promise<TokenTransferInfo[]> => {
  let transfers: TokenTransferInfo[] = [];

  if (tx.value && tx.value !== "0x0") {
    const token = network.nativeToken;
    const balance = await provider.getBalance(tx.from);

    transfers.push({
      token,
      amount: tx.value,
      currentBalance: balance.toString(),
    });
  }

  const decodedTransferEvents = getSenderTransferEvents(tx);
  const tokenTransfers = await Promise.all(
    decodedTransferEvents.map((e) => getTokenTransfer(e, provider))
  );

  transfers.push(...tokenTransfers);

  return transfers;
};

export const getTxTransfersInfo = async (
  tx: TransactionEvent,
  provider: providers.Provider,
  network: Network
): Promise<TxTransfersInfo> => {
  const transfers = await getTxTokenTransfers(tx, provider, network);

  return {
    from: tx.from,
    transfers,
    receiptUrl: buildTxReceiptUrl(tx, network),
    network,
  };
};

export const getSenderTransferEvents = (
  tx: TransactionEvent
): DecodedTransferEvent[] => {
  const erc20Interface = new Interface(erc20Abi);
  let transferEvents = tx.logs.reduce<DecodedTransferEvent[]>(
    (decodedEvents, log) => {
      try {
        const res = erc20Interface.decodeEventLog(
          "Transfer",
          log.data,
          log.topics
        );
        const decodedEvent: DecodedTransferEvent = {
          token: log.address,
          from: res[0],
          to: res[1],
          amount: res[2],
        };

        return [...decodedEvents, decodedEvent];
      } catch (err) {
        return decodedEvents;
      }
    },
    []
  );

  return transferEvents.filter(
    (e) => !addressesEqual(e.from, e.to) && addressesEqual(e.from, tx.from)
  );
};

export const buildTxReceiptUrl = (
  tx: TransactionEvent,
  network: Network
): string => {
  switch (tx.network) {
    case "1":
    case "5":
    case "100":
    case "137":
    default:
      return `${network.explorerBaseUrl}tx/${tx.hash}`;
  }
};

const getTokenTransfer = async (
  transferEvent: DecodedTransferEvent,
  provider: providers.Provider
): Promise<TokenTransferInfo> => {
  const { amount, from, token: tokenAddress } = transferEvent;
  const tokenContract = new Contract(tokenAddress, ERC20_INTERFACE, provider);
  let tokenBalance = (await tokenContract.balanceOf(from)) as BigNumber;

  let [decimals, name, symbol] = await Promise.all([
    tokenContract.decimals(),
    tokenContract.name(),
    tokenContract.symbol(),
  ]);
  decimals = decimals as number;
  name = name as string;
  symbol = symbol as string;

  return {
    amount: amount.toString(),
    token: {
      decimals,
      name,
      symbol,
    },
    currentBalance: tokenBalance.toString(),
  };
};
