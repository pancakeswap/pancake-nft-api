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
        id: "123",
        tokenId: id,
        name: `${data?.name}`,
        description: data?.description,
        image: {
          original: data?.image ?? null,
          thumbnail: data?.image ?? null,
          mp4: data?.mp4_url ?? null,
          webm: data?.webm_url ?? null,
          gif: data?.gif_url ?? null,
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
      return res.status(400).json({ error: { message: "Invalid address." } });
    }
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
