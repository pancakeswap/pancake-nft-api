import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "ethers/lib/utils";
import { getCDN } from "../../../utils";
import { getModel } from "../../../utils/mongo";
import { Collection } from "../../../utils/types";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    const collectionModel = await getModel("Collection");
    const collections: Collection[] = await collectionModel.find({ visible: true }).sort({ updated_at: "desc" }).exec();

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
      avatar: getCDN(collection.address, "avatar"),
      banner: {
        large: getCDN(collection.address, "banner-lg"),
        small: getCDN(collection.address, "banner-sm"),
      },
    }));

    return res.status(200).json({ total: data.length, data });
  } catch (error) {
    console.log({ error });
    return res.status(500).json({ error: { message: "Unknown error." } });
  }
};
