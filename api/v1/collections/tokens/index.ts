import { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress, getAddress } from "ethers/lib/utils";
import get from "lodash/get";
import { CONTENT_DELIVERY_NETWORK_URI, NETWORK } from "../../../../utils";
import { Attribute, Token, Collection } from "../../../../utils/types";
import { getModel } from "../../../../utils/mongo";
import { paramCase } from "param-case";

const PANCAKE_BUNNY_ADDRESS = process.env.PANCAKE_BUNNY_ADDRESS as string;

/**
 * Fetch tokens from a generic collection
 * @param collection
 * @returns
 */
const fetchGeneric = async (collection: Collection) => {
  // Fetch
  const tokenModel = await getModel("Token");
  const tokens: Token[] = await tokenModel
    .find({ parent_collection: collection })
    .populate(["parent_collection", "metadata", "attributes"])
    .exec();

  // Format
  let data = {};
  const attributesDistribution: { [key: string]: { [key: string]: number } } = {};
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
      if (!get(attributesDistribution, traitType)) {
        attributesDistribution[traitType] = {};
      }
      if (!get(attributesDistribution, [traitType, traitValue])) {
        attributesDistribution[traitType][traitValue] = 0;
      }

      attributesDistribution[traitType][traitValue] += 1;
    });
  }); // End forEach

  return { data, attributesDistribution };
};

/**
 * Fetch tokens from the pancake bunnies collection
 * @param collection
 * @returns
 */
const fetchPancakeBunnies = async (collection: Collection) => {
  // Fetch
  const tokenModel = await getModel("Token");
  const attributeModel = await getModel("Attribute");
  const attributes: Attribute[] = await attributeModel.find({ parent_collection: collection });

  const promisesAttributesDistribution = attributes.map(async (attribute) => {
    return await tokenModel
      .aggregate([
        {
          $match: {
            parent_collection: collection._id,
            attributes: attribute._id,
          },
        },
        {
          $count: "token_id",
        },
      ])
      .exec();
  });

  const promisesTokens = attributes.map(async (attribute) => {
    const res = await tokenModel
      .findOne({ parent_collection: collection, attributes: attribute })
      .populate(["metadata", "attributes"])
      .exec();

    if (!res) {
      return null;
    }

    const metaName = paramCase(res.metadata.name);
    return {
      name: res.metadata.name,
      description: res.metadata.description,
      image: {
        original: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(PANCAKE_BUNNY_ADDRESS)}/${metaName}.png`,
        thumbnail: `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(
          PANCAKE_BUNNY_ADDRESS
        )}/${metaName}-1000.png`,
        mp4: null,
        webm: null,
        gif: null,
      },
      collection: {
        name: collection.name,
      },
    };
  });
  const tokens = await Promise.all(promisesTokens);

  // Format
  const data: { [key: string]: Token } = attributes.reduce((acc, attribute: Attribute) => {
    const bunnyId = parseInt(attribute.value, 10);
    const token = tokens[bunnyId];
    return {
      ...acc,
      [bunnyId]: token,
    };
  }, {});

  const attributesDistribution = await Promise.all(promisesAttributesDistribution);

  return {
    data,
    attributesDistribution: attributesDistribution.reduce(
      (acc, value, index) => ({ ...acc, [index]: value[0] ? value[0].token_id : null }),
      {}
    ),
  };
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

    const { data, attributesDistribution } =
      address.toLowerCase() === PANCAKE_BUNNY_ADDRESS?.toLowerCase()
        ? await fetchPancakeBunnies(collection)
        : await fetchGeneric(collection);

    const total = Object.keys(data).length;
    if (total === 0) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }
    return res.status(200).json({ attributesDistribution, data, total });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
