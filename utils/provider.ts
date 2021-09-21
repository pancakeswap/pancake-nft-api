import { providers } from "ethers";
import sample from "lodash/sample";
import { NETWORK } from ".";

const MAINNET_RPC = [
  "https://bsc-dataseed.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];

const TESTNET_RPC = [
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://data-seed-prebsc-1-s2.binance.org:8545/",
  "https://data-seed-prebsc-2-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s2.binance.org:8545/",
];

const provider = new providers.JsonRpcProvider(NETWORK === "testnet" ? sample(TESTNET_RPC) : sample(MAINNET_RPC));

export default provider;
