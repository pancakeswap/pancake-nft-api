import { Schema } from "mongoose";

const tokenSchema: Schema = new Schema(
  {
    parent_collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
    // Note: Temporary workaround (true)
    address: {
      type: String,
      required: true,
    },
    token_id: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.ObjectId,
      ref: "Metadata",
    },
    attributes: [
      {
        type: Schema.Types.ObjectId,
        ref: "Attribute",
      },
    ],
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: null,
    },
  },
  {
    collection: "tokens",
  }
);

export default tokenSchema;
