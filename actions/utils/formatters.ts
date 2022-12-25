import { BigNumber } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { Address, FormatOpts } from "../types";

export const shortenAddress = (address: Address): string =>
  `${address.slice(0, 6)}…${address.slice(-4)}`;

export const formatAmount = (
  amount: BigNumber | number | string,
  decimals = 18,
  { digits, commify, tokenSymbol }: FormatOpts = {
    digits: 2,
    commify: true,
    tokenSymbol: "",
  }
): string => {
  let amount_ = Number(formatUnits(amount, decimals)).toFixed(digits);

  if (commify) {
    const [integerPart, decimalsPart] = amount_.split(".");

    amount_ = integerPart
      .split("")
      .reverse()
      .reduce(
        (commifiedAmount, digit, index) =>
          `${digit}${
            index > 0 && index % 3 === 0 ? "," : ""
          }${commifiedAmount}`,
        `.${decimalsPart}`
      );
  }

  return `${amount_}${tokenSymbol ? ` ${tokenSymbol}` : ""}`;
};
