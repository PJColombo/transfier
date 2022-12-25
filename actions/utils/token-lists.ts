export const UNISWAP_TOKEN_LIST =
  "https://gateway.ipfs.io/ipns/tokens.uniswap.org";

export const HONEYSWAP_TOKEN_LIST = "https://tokens.honeyswap.org/";

export const getTokenListByNetwork = (networkId: number): string => {
  switch (networkId) {
    case 1:
    case 5:
    case 137:
      return UNISWAP_TOKEN_LIST;
    case 100:
      return HONEYSWAP_TOKEN_LIST;
    default:
      throw new Error(`No token list found for given network id ${networkId}`);
  }
};
