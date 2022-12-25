import { Network } from "../types";

export const NETWORKS: Record<string, Network> = {
  "1": {
    id: 1,
    name: "Mainnet",
    nativeToken: {
      name: "ether",
      symbol: "ETH",
      decimals: 18,
    },
    explorerBaseUrl: "https://etherscan.io/",
  },
  "5": {
    id: 5,
    name: "Goerli",
    nativeToken: {
      name: "Goerli ether",
      symbol: "GoerliETH",
      decimals: 18,
    },
    explorerBaseUrl: "https://goerli.etherscan.io/",
  },
  "100": {
    id: 100,
    name: "Gnosis",
    nativeToken: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    explorerBaseUrl: "https://blockscout.com/xdai/mainnet/",
  },
  "137": {
    id: 137,
    name: "Polygon",
    nativeToken: {
      name: "Matic",
      symbol: "MATIC",
      decimals: 18,
    },
    explorerBaseUrl: "https://polygonscan.com/",
  },
};
