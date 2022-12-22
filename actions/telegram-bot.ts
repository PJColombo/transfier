import type { TransactionEvent } from "@tenderly/actions";
import TelegramBot from "node-telegram-bot-api";
import TokenAmount from "token-amount";
import type { Network, TokenData, TxMessage } from "./types";
import { shortenAddress } from "./utils/web3";

const getTokenData = (
  tx: TransactionEvent,
  network: Network
): TokenData | undefined => {
  if (tx.value) {
    const networkData = network;

    return networkData.nativeToken;
  }

  return;
};

const buildTxReceiptUrl = (tx: TransactionEvent, network: Network): string => {
  switch (tx.network) {
    case "1":
    case "5":
    case "100":
    case "137":
    default:
      return `${network.explorerBaseUrl}/tx/${tx.hash}`;
  }
};

const buildTxMessage = (tx: TransactionEvent, network: Network): TxMessage => {
  const { symbol = "UNKNOWN", decimals = 0 } = getTokenData(tx, network) ?? {};

  return {
    from: tx.from,
    to: tx.to ?? "",
    amount: new TokenAmount(tx.value, decimals, { symbol }),
    tokenSymbol: symbol,
    currentBalance: new TokenAmount(0, 18),
    receiptUrl: buildTxReceiptUrl(tx, network),
  };
};

export const sendMessage = (
  bot: TelegramBot,
  chatId: TelegramBot.ChatId,
  tx: TransactionEvent,
  network: Network
): Promise<TelegramBot.Message> => {
  const { from, receiptUrl, amount, currentBalance } = buildTxMessage(
    tx,
    network
  );
  const formattedAmount = amount.format({ commify: true, digits: 3 });
  const formattedCurrentBalance = currentBalance.format({
    commify: true,
    digits: 3,
  });

  return bot.sendMessage(
    chatId,
    `Hey, the account ${shortenAddress(
      from
    )} just [transferred](${receiptUrl}) ${formattedAmount} on ${
      network.name
    } (id: ${tx.network}). The new token balance is: ${formattedCurrentBalance}
    `,
    {
      parse_mode: "Markdown",
    }
  );
};
