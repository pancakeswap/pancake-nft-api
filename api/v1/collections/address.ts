import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { getCDN } from "../../../utils";
import { getModel } from "../../../utils/mongo";
import { Attribute, Collection } from "../../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const address = req.query.address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    try {
      const collectionModel = await getModel("Collection");
      const collection: Collection = await collectionModel
        .findOne({
          address: address.toLowerCase(),
          visible: true,
        })
        .exec();
      if (!collection) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      const attributeModel = await getModel("Attribute");
      const attributes: Attribute[] = await attributeModel
        .find({ parent_collection: collection })
        .sort({ trait_type: "asc", value: "asc" })
        .exec();

      const data = {
        address: getAddress(collection.address),
        owner: getAddress(collection.owner),
        name: collection.name,
        description: collection?.description,
        symbol: collection.symbol,
        totalSupply: collection.total_supply,
        verified: collection.verified,
        createdAt: collection.created_at,
        updatedAt: collection.updated_at,
        avatar: getCDN(collection.address, "avatar"),
        banner: {
          large: getCDN(collection.address, "banner-lg"),
          small: getCDN(collection.address, "banner-sm"),
        },
        attributes: attributes
          ? attributes.map((attribute: Attribute) => ({
              traitType: attribute.trait_type,
              value: attribute.value,
              displayType: attribute.display_type,
            }))
          : [],
      };

      return res.status(200).json({ data });
    } catch (error) {
      return res.status(500).json({ error: { message: "Unknown error." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
