import { Schema } from "mongoose";

const metadataSchema: Schema = new Schema(
  {
    parent_collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    mp4: {
      type: Boolean,
      default: false,
    },
    webm: {
      type: Boolean,
      default: false,
    },
    gif: {
      type: Boolean,
      default: false,
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
    collection: "metadata",
  }
);

export default metadataSchema;
