import { Address } from "../types";

export type TokenListToken = {
  name: string;
  address: Address;
  symbol: string;
  decimals: number;
  chainId: number;
  logoURI: string;
};

export type TokenList = {
  name: string;
  timestamp: string;
  version: {
    major: string;
    minor: string;
    patch: string;
  };
  logoURI: string;
  keywords: string[];
  tokens: TokenListToken[];
};
