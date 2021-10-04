import { Schema } from "mongoose";
import paginatePlugin from "mongoose-paginate-v2";

const tokenSchema: Schema = new Schema(
  {
    parent_collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
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
    burned: {
      type: Boolean,
      default: false,
    },
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
).plugin(paginatePlugin);

export default tokenSchema;
