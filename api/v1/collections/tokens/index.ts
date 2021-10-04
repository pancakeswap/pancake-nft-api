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
const fetchGeneric = async (collection: Collection, page: number, size: number) => {
  const tokenModel = await getModel("Token");
  const tokens = await tokenModel.paginate(
    { parent_collection: collection },
    {
      page: page,
      limit: size,
      sort: { token_id: "asc" },
      populate: ["metadata", "attributes"],
      collation: { locale: "en_US", numericOrdering: true },
    }
  );

  let data = {};
  const attributesDistribution: { [key: string]: { [key: string]: number } } = {};
  tokens.docs.forEach((token: Token) => {
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
  });

  return { data, attributesDistribution };
};

/**
 * Fetch tokens from the pancake bunnies collection
 * @param collection
 * @returns
 */
const fetchPancakeBunnies = async (collection: Collection) => {
  const attributeModel = await getModel("Attribute");
  const attributes: Attribute[] = await attributeModel
    .find({ parent_collection: collection })
    .sort({ value: "asc" })
    .collation({ locale: "en_US", numericOrdering: true })
    .exec();

  const tokenModel = await getModel("Token");
  const promisesTokens = attributes.map(async (attribute) => {
    const res: Token = await tokenModel
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
        mp4: res.metadata.mp4
          ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(PANCAKE_BUNNY_ADDRESS)}/${metaName}.mp4`
          : null,
        webm: res.metadata.webm
          ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(PANCAKE_BUNNY_ADDRESS)}/${metaName}.webm`
          : null,
        gif: res.metadata.gif
          ? `${CONTENT_DELIVERY_NETWORK_URI}/${NETWORK}/${getAddress(PANCAKE_BUNNY_ADDRESS)}/${metaName}.gif`
          : null,
      },
      collection: {
        name: collection.name,
      },
    };
  });
  const tokens = await Promise.all(promisesTokens);

  const data: { [key: string]: Token } = attributes.reduce((acc, attribute: Attribute) => {
    const bunnyId = parseInt(attribute.value, 10);
    const token = tokens[bunnyId];
    return {
      ...acc,
      [bunnyId]: token,
    };
  }, {});

  const promisesAttributesDistribution = attributes.map(async (attribute: Attribute) => {
    return await tokenModel
      .aggregate([
        {
          $match: {
            parent_collection: collection._id,
            attributes: attribute._id,
            burned: false,
          },
        },
      ])
      .count("token_id")
      .exec();
  });
  const attributesDistribution = await Promise.all(promisesAttributesDistribution);

  return {
    data,
    attributesDistribution: attributesDistribution.reduce(
      (acc, value, index) => ({ ...acc, [index]: value[0] ? value[0].token_id : 0 }),
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
        : await fetchGeneric(
            collection,
            req.query.page ? parseInt(req.query.page as string, 10) : 1,
            req.query.size ? parseInt(req.query.size as string, 10) : 10000
          );

    const total = Object.keys(data).length;
    if (total === 0) {
      return res.status(404).json({ error: { message: "Entity not found." } });
    }
    return res.status(200).json({ attributesDistribution, total, data });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
