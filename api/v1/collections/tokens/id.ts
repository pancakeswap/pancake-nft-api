import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { Attribute, Token } from "../../../../utils/types";
import { getModel } from "../../../../utils/mongo";
import { CONTENT_DELIVERY_NETWORK_URI, NETWORK } from "../../../../utils";
import { Collection } from "mongoose";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address, id } = req.query;
  address = address as string;
  id = id as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address) && id) {
    try {
      const collectionModel = await getModel("Collection");
      const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();
      if (!collection) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      const tokenModel = await getModel("Token");
      const token: Token = await tokenModel
        .findOne({ parent_collection: collection, token_id: id.toLowerCase() })
        .populate(["parent_collection", "metadata", "attributes"])
        .exec();
      if (!token) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      const data = {
        tokenId: id,
        name: token.metadata.name,
        description: token.metadata.description,
        image: {
          original: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(
            address
          )}/${token.metadata.name.toLowerCase()}.png`,
          thumbnail: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(
            address
          )}/${token.metadata.name.toLowerCase()}.png`,
          mp4: null,
          webm: null,
          gif: null,
        },
        attributes: token.attributes
          ? token.attributes.map((attribute: Attribute) => ({
              traitType: attribute.trait_type,
              value: attribute.value,
              displayType: attribute.display_type,
            }))
          : [],
        collection: {
          name: token.parent_collection.name,
        },
      };

      return res.status(200).json({ data });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: { message: "Unknown error." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
