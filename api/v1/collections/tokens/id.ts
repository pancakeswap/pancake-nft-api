import { Contract } from "@ethersproject/contracts";
import { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress } from "ethers/lib/utils";
import axios from "axios";
import provider from "../../../../utils/provider";
import ercABI from "../../../../utils/abis/ERC721.json";
import { getTokenURI } from "../../../../utils";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address, id } = req.query;
  address = address as string;
  id = id as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (id && address && isAddress(address)) {
    try {
      const contract = new Contract(address, ercABI, provider);
      const tokenURI = await getTokenURI(await contract.tokenURI(id));

      const { data } = await axios(tokenURI);

      const response = {
        tokenId: id,
        name: `${data?.name}`,
        description: data?.description,
        image: {
          original: getTokenURI(data?.image) ?? null,
          thumbnail: getTokenURI(data?.image) ?? null,
          mp4: getTokenURI(data?.mp4_url) ?? null,
          webm: getTokenURI(data?.webm_url) ?? null,
          gif: getTokenURI(data?.gif_url) ?? null,
        },
        attributes: [
          {
            traitType: "bunnyId",
            value: data?.attributes?.bunnyId,
          },
        ],
      };

      return res.status(200).json({ data: response });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: { message: "Unknown error." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
