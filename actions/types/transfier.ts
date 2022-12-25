import { BigNumber } from "ethers";
import { Address } from "./web3";

export type FormatOpts = {
  digits: number;
  commify: boolean;
  tokenSymbol: string;
};

export type DecodedTransferEvent = {
  token: Address;
  from: Address;
  to: Address;
  amount: BigNumber;
};

export type TokenTransferInfo = {
  token: Token;
  amount: string;
  currentBalance: string;
};

export type Token = {
  name: string;
  symbol: string;
  decimals: number;
};

export type Network = {
  id: number;
  name: string;
  explorerBaseUrl: string;
  nativeToken: Token;
};

export type TxTransfersInfo = {
  from: Address;
  transfers: TokenTransferInfo[];
  receiptUrl: string;
  network: Network;
};
