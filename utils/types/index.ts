import { Document } from "mongoose";

export interface Collection extends Document {
  address: string;
  owner: string;
  name: string;
  description?: string;
  symbol: string;
  total_supply: number;
  verified: boolean;
  created_at: Date;
  updated_at: Date;
}
