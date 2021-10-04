import { Document } from "mongoose";

export interface Collection extends Document {
  address: string;
  owner: string;
  name: string;
  description?: string;
  symbol: string;
  total_supply: number;
  verified: boolean;
  visible: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Token extends Document {
  parent_collection: Collection;
  token_id: string;
  metadata: Metadata;
  attributes: Attribute[];
  burned: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Metadata extends Document {
  parent_collection: Collection;
  name: string;
  description: string;
  mp4: boolean;
  webm: boolean;
  gif: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Attribute extends Document {
  parent_collection: Collection;
  trait_type: string;
  value: string;
  display_type: string;
  created_at: Date;
  updated_at: Date;
}
