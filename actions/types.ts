import TokenAmount from "token-amount";

export type Address = string;

export type TokenData = {
  name: string;
  symbol: string;
  decimals: number;
};

export type Network = {
  name: string;
  explorerBaseUrl: string;
  nativeToken: TokenData;
};

export type TxMessage = {
  from: Address;
  to: Address;
  tokenSymbol: string;
  amount: TokenAmount;
  currentBalance: TokenAmount;
  receiptUrl: string;
};
