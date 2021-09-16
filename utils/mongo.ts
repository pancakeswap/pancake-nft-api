import mongoose, { Connection, Model } from "mongoose";
import attributeSchema from "./schemas/attribute.schema";
import collectionSchema from "./schemas/collection.schema";
import metadataSchema from "./schemas/metadata.schema";
import tokenSchema from "./schemas/token.schema";

let connection: Connection | null = null;

/**
 * @see https://vercel.com/guides/deploying-a-mongodb-powered-api-with-node-and-vercel
 * @see https://mongoosejs.com/docs/lambda.html
 */
export const getConnection = async (): Promise<Connection> => {
  if (connection === null) {
    /* istanbul ignore next */
    const uri = process.env.MONGO_URI ?? "mongodb://localhost:27017/marketplace";
    connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
    });

    await connection;
    connection.model("Collection", collectionSchema);
    connection.model("Token", tokenSchema);
    connection.model("Metadata", metadataSchema);
    connection.model("Attribute", attributeSchema);
  }

  return connection;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getModel = async (name: string): Promise<Model<any>> => {
  connection = await getConnection();

  return connection.model(name);
};
