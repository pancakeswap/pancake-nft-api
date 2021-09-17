import { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress, getAddress } from "ethers/lib/utils";
import _ from "lodash";
import { Collection } from "mongoose";
import { CONTENT_DELIVERY_NETWORK_URI, NETWORK } from "../../../../utils";
import { Attribute, Token } from "../../../../utils/types";
import { getModel } from "../../../../utils/mongo";

const formatGenericList = (tokens: Token[], address: string) => {
  let data = {};
  const attributesDistribution: { [key: string]: { [key: string]: number } } = {};
  tokens.forEach((token) => {
    data = {
      ...data,
      [token.token_id]: {
        tokenId: token.token_id,
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
      },
    };

    // update the attributesDistribution distribution according to this token attributes
    token.attributes.forEach((attribute) => {
      const traitType = attribute.trait_type;
      const traitValue = attribute.value;
      // Safe checks on the object structure
      if (!_.get(attributesDistribution, traitType)) {
        attributesDistribution[traitType] = {};
      }
      if (!_.get(attributesDistribution, [traitType, traitValue])) {
        attributesDistribution[traitType][traitValue] = 0;
      }

      attributesDistribution[traitType][traitValue] += 1;
    });
  }); // End forEach
  return { data, attributesDistribution };
};

const formatPb = (tokens: Token[], address: string) => {
  let data: { [key: string]: any } = {};
  tokens.forEach((token) => {
    const bunnyId = token.attributes[0].value;
    const exist = !!data[bunnyId];

    if (exist) {
      data[bunnyId].tokens.push(bunnyId);
    } else {
      data = {
        ...data,
        [bunnyId]: {
          tokenId: token.token_id,
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
          collection: {
            name: token.parent_collection.name,
          },
          tokens: [token.token_id],
        },
      };
    }
  }); // End forEach
  const attributesDistribution = _.reduce(data, (acc, value, index) => ({ ...acc, [index]: value.tokens.length }), {});
  return { data, attributesDistribution: attributesDistribution };
};

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  const address = req.query.address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const collectionModel = await getModel("Collection");
    const collection: Collection = await collectionModel.findOne({ address: address.toLowerCase() }).exec();
    if (!collection) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    const tokenModel = await getModel("Token");
    const tokens: Token[] = await tokenModel
      .find({ parent_collection: collection })
      .populate(["parent_collection", "metadata", "attributes"])
      .exec();
    if (tokens.length === 0) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }

    const { data, attributesDistribution } =
      address.toLowerCase() === process.env.PANCAKE_BUNNY_ADDRESS?.toLowerCase()
        ? formatPb(tokens, address)
        : formatGenericList(tokens, address);

    const total = tokens.length;
    return res.status(200).json({ total, attributesDistribution, data });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
