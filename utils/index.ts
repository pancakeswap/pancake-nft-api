export const CONTENT_DELIVERY_NETWORK_URI =
  process.env.CONTENT_DELIVERY_NETWORK_URI ?? "https://static-nft.pancakeswap.com";

export const getTokenURI = (tokenURI: string): string => {
  if (tokenURI && tokenURI.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${tokenURI.slice(7)}`;
  }

  return tokenURI;
};
