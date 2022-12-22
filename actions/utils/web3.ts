import type { Address } from "../types";

export const shortenAddress = (address: Address): string =>
  `${address.slice(0, 6)}...${address.slice(-4)}`;
