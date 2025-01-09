import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
  {
    parent_collection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Collection",
    },
    trait_type: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    display_type: {
      type: String,
      required: false,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "attributes",
  },
);

export default attributeSchema;
