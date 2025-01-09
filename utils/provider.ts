import { JsonRpcProvider } from "ethers";
import lodash from "lodash";
import { NETWORK } from "./index.js";

const MAINNET_RPC = [
  "https://bsc-dataseed1.binance.org/",
  "https://bsc-dataseed1.defibit.io/",
  "https://bsc-dataseed1.ninicoin.io/",
];

const TESTNET_RPC = [
  "https://data-seed-prebsc-1-s1.binance.org:8545/",
  "https://data-seed-prebsc-1-s2.binance.org:8545/",
  "https://data-seed-prebsc-2-s1.binance.org:8545/",
  "https://data-seed-prebsc-2-s2.binance.org:8545/",
];

const provider = new JsonRpcProvider(NETWORK === "testnet" ? lodash.sample(TESTNET_RPC) : lodash.sample(MAINNET_RPC));

export default provider;
