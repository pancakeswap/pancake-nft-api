import mongoose from "mongoose";
import paginatePlugin from "mongoose-paginate-v2";

const tokenSchema = new mongoose.Schema(
  {
    parent_collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    token_id: {
      type: String,
      required: true,
    },
    metadata: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Metadata",
    },
    attributes: [
      {
        type: mongoose.Schema.Types.ObjectId,
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
  },
).plugin(paginatePlugin);

export default tokenSchema;
