import type { TransactionEvent } from "@tenderly/actions";
import { providers } from "ethers";
import TelegramBot from "node-telegram-bot-api";
import type { Network, TxTransfersInfo, FormatOpts } from "./types";
import { formatAmount, getTxTransfersInfo, shortenAddress } from "./utils";

export const buildTelegramMessage = (txInfo: TxTransfersInfo): string => {
  const { from, transfers, receiptUrl, network } = txInfo;
  const formattedFrom = shortenAddress(from);
  const transferMessages = transfers.map(
    ({ amount, currentBalance, token }) => {
      const formatOpts: FormatOpts = {
        digits: 3,
        commify: true,
        tokenSymbol: token.symbol,
      };
      const formattedAmount = formatAmount(amount, token.decimals, formatOpts);
      const formattedBalance = formatAmount(
        currentBalance,
        token.decimals,
        formatOpts
      );

      return `  - ${formattedAmount}. The current balance is: ${formattedBalance}`;
    }
  );

  return `Hey, the account ${formattedFrom} [transferred](${receiptUrl}) the following tokens on ${
    network.name
  }:
    ${transferMessages.join("\n")}
  `;
};

export const sendTelegramMessage = async (
  bot: TelegramBot,
  chatId: TelegramBot.ChatId,
  tx: TransactionEvent,
  provider: providers.Provider,
  network: Network
): Promise<TelegramBot.Message> => {
  const txInfo = await getTxTransfersInfo(tx, provider, network);
  const message = buildTelegramMessage(txInfo);

  return bot.sendMessage(chatId, message, {
    parse_mode: "Markdown",
  });
};
