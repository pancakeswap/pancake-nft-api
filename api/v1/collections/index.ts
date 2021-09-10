import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "ethers/lib/utils";
import { CONTENT_DELIVERY_NETWORK_URI } from "../../../utils";
import { getModel } from "../../../utils/mongo";
import { Collection } from "../../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const collectionModel = await getModel("Collection");
    const collections: Collection[] = await collectionModel.find().sort({ updated_at: "desc" }).exec();

    const data = collections.map((collection: Collection) => ({
      address: getAddress(collection.address),
      owner: getAddress(collection.owner),
      name: collection.name,
      description: collection?.description,
      symbol: collection.symbol,
      totalSupply: collection.total_supply,
      verified: collection.verified,
      createdAt: collection.created_at,
      updatedAt: collection.updated_at,
      avatar: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${getAddress(collection.address)}/avatar.png`,
      banner: {
        large: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${getAddress(collection.address)}/banner-lg.png`,
        small: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${getAddress(collection.address)}/banner-sm.png`,
      },
    }));

    return res.status(200).json({ total: data.length, data });
  } catch (error) {
    return res.status(500).json({ error: { message: "Unknown error." } });
  }
};
