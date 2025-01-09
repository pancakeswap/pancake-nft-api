import { getAddress } from "ethers";
import dotenv from "dotenv";
dotenv.config();

export const NETWORK = process.env.NETWORK ?? "mainnet";
export const CONTENT_DELIVERY_NETWORK_URI =
  process.env.CONTENT_DELIVERY_NETWORK_URI ?? "https://static-nft.pancakeswap.com";

export const getTokenURI = (tokenURI: string): string => {
  if (tokenURI && tokenURI.startsWith("ipfs://")) {
    return `https://ipfs.io/ipfs/${tokenURI.split("ipfs://").join("").trim()}`;
  }

  return tokenURI.trim();
};

export const getCDN = (address: string, type: "avatar" | "banner-lg" | "banner-sm"): string => {
  switch (type) {
    case "avatar":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/avatar.png`;
    case "banner-lg":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/banner-lg.png`;
    case "banner-sm":
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(address)}/banner-sm.png`;
    default:
      return `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/unknown.png`;
  }
};
