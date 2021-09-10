import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { CONTENT_DELIVERY_NETWORK_URI } from "../../../utils";
import { getModel } from "../../../utils/mongo";
import { Collection } from "../../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address } = req.query;
  address = address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    try {
      const collectionModel = await getModel("Collection");
      const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();
      if (!collection) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      address = getAddress(address);

      return res.status(200).json({
        address: address,
        owner: getAddress(collection.owner),
        name: collection.name,
        description: collection?.description,
        symbol: collection.symbol,
        totalSupply: collection.total_supply,
        verified: collection.verified,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
        avatar: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${address}/avatar.png`,
        banner: {
          large: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${address}/banner-lg.png`,
          small: `${CONTENT_DELIVERY_NETWORK_URI}/testnet/${address}/banner-sm.png`,
        },
      });
    } catch (error) {
      return res.status(500).json({ error: { message: "Invalid address." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
