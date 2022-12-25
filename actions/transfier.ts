import { providers } from "ethers";
import TelegramBot from "node-telegram-bot-api";
import { ActionFn, TransactionEvent } from "@tenderly/actions";
import { sendTelegramMessage } from "./telegram-bot";
import { NETWORKS, getSenderTransferEvents } from "./utils";

const isTransferTx = (tx: TransactionEvent): boolean => {
  if (tx.value) {
    return true;
  }

  return !!getSenderTransferEvents(tx).length;
};

export const transfierFn: ActionFn = async (context, event) => {
  const txEvent = event as TransactionEvent;

  if (!isTransferTx(txEvent)) {
    return;
  }

  const botToken = await context.secrets.get("TELEGRAM_BOT_TOKEN");
  const chatId = await context.secrets.get("TELEGRAM_CHAT_ID");
  const bot = new TelegramBot(botToken, { polling: false });

  const network = NETWORKS[txEvent.network];

  if (!network) {
    throw new Error(`Network ${txEvent.network} not supported`);
  }

  const rpcEndpoint = await context.secrets.get(
    `${network.name.toUpperCase()}_RPC_ENDPOINT`
  );

  const provider = new providers.StaticJsonRpcProvider(rpcEndpoint, network.id);

  await sendTelegramMessage(bot, chatId, txEvent, provider, network);
};
