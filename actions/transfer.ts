import TelegramBot from "node-telegram-bot-api";
import { ActionFn, Context, Event, TransactionEvent } from "@tenderly/actions";
import { sendMessage } from "./telegram-bot";
import { NETWORKS } from "./networks";

export const transferNotifierFn: ActionFn = async (
  context: Context,
  event: Event
) => {
  try {
    const botToken = await context.secrets.get("TELEGRAM_BOT_TOKEN");
    const chatId = await context.secrets.get("TELEGRAM_CHAT_ID");
    const bot = new TelegramBot(botToken, { polling: false });

    const txEvent = event as TransactionEvent;
    const network = NETWORKS[txEvent.network];

    await sendMessage(bot, chatId, txEvent, network);
  } catch (err) {
    console.error(err);
  }
};
