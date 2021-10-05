import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress, isAddress } from "ethers/lib/utils";
import { paramCase } from "param-case";
import { CONTENT_DELIVERY_NETWORK_URI, NETWORK } from "../../../../utils";
import { getModel } from "../../../../utils/mongo";
import { Attribute, Collection, Token } from "../../../../utils/types";
import forEach from "lodash/forEach";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const address = req.query.address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    try {
      const collectionModel = await getModel("Collection");
      const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();
      if (!collection) {
        return res.status(404).json({ error: { message: "Entity not found." } });
      }

      const filterQuery: { trait_type: string; value: string }[] = [];
      forEach(req.query, (value, key) => {
        // Note: With URL rewrite enabled, 'address' is part of the parameters, so excluding when building the filter.
        if (["address", "page", "size"].includes(key)) return;

        const search = {
          trait_type: key.toLowerCase(),
          value: (value as string).toLowerCase(),
        };

        filterQuery.push(search);
      });

      if (filterQuery.length === 0) {
        return res.status(400).json({ error: { message: "Missing parameter(s)." } });
      }

      const attributeModel = await getModel("Attribute");
      const attributes: Attribute[] = await attributeModel
        .find({
          parent_collection: collection,
          $or: filterQuery,
        })
        .exec();

      const tokenModel = await getModel("Token");
      const tokens: Token[] = await tokenModel
        .find({ parent_collection: collection, attributes: { $all: attributes.map((obj) => obj._id) } })
        .populate(["metadata", "attributes"])
        .exec();

      let data = {};
      tokens.forEach((token: Token) => {
        const metaName = paramCase(token.metadata.name);
        data = {
          ...data,
          [token.token_id]: {
            tokenId: token.token_id,
            name: token.metadata.name,
            description: token.metadata.description,
            image: {
              original: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${metaName}.png`,
              thumbnail: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(
                collection.address
              )}/${metaName}-1000.png`,
              mp4: token.metadata.mp4
                ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${metaName}.mp4`
                : null,
              webm: token.metadata.webm
                ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${metaName}.webm`
                : null,
              gif: token.metadata.gif
                ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(collection.address)}/${metaName}.gif`
                : null,
            },
            attributes: token.attributes
              ? token.attributes.map((attribute: Attribute) => ({
                  traitType: attribute.trait_type,
                  value: attribute.value,
                  displayType: attribute.display_type,
                }))
              : [],
            collection: {
              name: collection.name,
            },
          },
        };
      });

      return res.status(200).json({ total: Object.keys(data).length, data });
    } catch (error) {
      return res.status(500).json({ error: { message: "Unknown error." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
