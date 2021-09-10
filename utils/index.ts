export const CONTENT_DELIVERY_NETWORK_URI = "https://static-nft.pancakeswap.com";

export const getTokenURI = (tokenUri: string): string => {
  if (tokenUri.startsWith("ipfs://")) {
    return `https://cloudflare-ipfs.com/ipfs/${tokenUri.slice(7)}`;
  }

  return tokenUri;
};
