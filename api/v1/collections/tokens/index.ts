import { VercelRequest, VercelResponse } from "@vercel/node";
import { isAddress } from "ethers/lib/utils";

export default async (req: VercelRequest, res: VercelResponse): Promise<VercelResponse | void> => {
  if (req.method?.toUpperCase() === "OPTIONS") {
    return res.status(204).end();
  }

  let { address } = req.query;
  address = address as string;

  // Sanity check for address; to avoid any SQL-like injections, ...
  if (address && isAddress(address)) {
    const data = {
      "0": {
        name: "Swapsies",
        description: "These bunnies love nothing more than swapping pancakes. Especially on BSC.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/swapsies-blur.png",
          thumbnail:
            "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/swapsies-blur.png",
          mp4: null,
          webm: null,
          gif: null,
        },
        tokens: [3],
      },
      "1": {
        name: "Drizzle",
        description: "It's raining syrup on this bunny, but he doesn't seem to mind. Can you blame him?",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/drizzle-blur.png",
          thumbnail: "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/drizzle-blur.png",
          mp4: null,
          webm: null,
          gif: null,
        },
        tokens: [2],
      },
      "2": {
        name: "Blueberries",
        description: "These bunnies like their pancakes with blueberries. What's your favorite topping?",
        image: {
          original:
            "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/blueberries-blur.png",
          thumbnail:
            "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/blueberries-blur.png",
          mp4: null,
          webm: null,
          gif: null,
        },
        tokens: [4],
      },
      "3": {
        name: "Circular",
        description: "Love makes the world go ‘round... but so do pancakes. And these bunnies know it.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/circular-blur.png",
          thumbnail:
            "https://cloudflare-ipfs.com/ipfs/QmaTV3X9SV6ZrDNVCTkQUs3JQRew8iFFyJCTBoaGAFHDL9/circular-blur.png",
          mp4: null,
          webm: null,
          gif: null,
        },
        tokens: [0],
      },
      "10": {
        name: "Hiccup",
        description: "Oopsie daisy! Hiccup's had a bit of an accident. Poor little fella.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmQ6EE6gkVzAQUdQLLM7CyrnME6LZHCoy92ZERW8HXmyjw/hiccup.png",
          thumbnail: "https://cloudflare-ipfs.com/ipfs/QmQ6EE6gkVzAQUdQLLM7CyrnME6LZHCoy92ZERW8HXmyjw/hiccup.png",
          mp4: null,
          webm: null,
          gif: null,
        },
        tokens: [80],
      },
      "11": {
        name: "Hiccup",
        description: "Oopsie daisy! Hiccup's had a bit of an accident. Poor little fella.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmNS1A5HsRW1JvFWtGkm4o9TgZVe2P7kA8TB4yxvS6A7ms/bullish.png",
          thumbnail: "https://cloudflare-ipfs.com/ipfs/QmNS1A5HsRW1JvFWtGkm4o9TgZVe2P7kA8TB4yxvS6A7ms/bullish.png",
          mp4: "https://ipfs.io/ipfs/QmNS1A5HsRW1JvFWtGkm4o9TgZVe2P7kA8TB4yxvS6A7ms/bullish.mp4",
          webm: "https://ipfs.io/ipfs/QmNS1A5HsRW1JvFWtGkm4o9TgZVe2P7kA8TB4yxvS6A7ms/bullish.webm",
          gif: "https://ipfs.io/ipfs/QmNS1A5HsRW1JvFWtGkm4o9TgZVe2P7kA8TB4yxvS6A7ms/bullish.gif",
        },
        tokens: [79],
      },
      "18": {
        name: "Baller",
        description: "Absolute (lottery) baller.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmWnhyxSrD8v9bx5tE9mDkwW853bpjoCXGd7o2fe1BtQJ8/lottie.png",
          thumbnail: "https://cloudflare-ipfs.com/ipfs/QmWnhyxSrD8v9bx5tE9mDkwW853bpjoCXGd7o2fe1BtQJ8/lottie.png",
          mp4: "https://ipfs.io/ipfs/QmWnhyxSrD8v9bx5tE9mDkwW853bpjoCXGd7o2fe1BtQJ8/lottie.mp4",
          webm: "https://ipfs.io/ipfs/QmWnhyxSrD8v9bx5tE9mDkwW853bpjoCXGd7o2fe1BtQJ8/lottie.webm",
          gif: "https://ipfs.io/ipfs/QmWnhyxSrD8v9bx5tE9mDkwW853bpjoCXGd7o2fe1BtQJ8/lottie.gif",
        },
        tokens: [121],
      },
      "20": {
        name: "Baller",
        description: "Absolute (lottery) baller.",
        image: {
          original: "https://cloudflare-ipfs.com/ipfs/QmeMfJk6yxYmMd41ThDpqcdEJmKXZTF9EmFeP49D15NvsF/baller.png",
          thumbnail: "https://cloudflare-ipfs.com/ipfs/QmeMfJk6yxYmMd41ThDpqcdEJmKXZTF9EmFeP49D15NvsF/baller.png",
          mp4: "https://ipfs.io/ipfs/QmeMfJk6yxYmMd41ThDpqcdEJmKXZTF9EmFeP49D15NvsF/baller.mp4",
          webm: "https://ipfs.io/ipfs/QmeMfJk6yxYmMd41ThDpqcdEJmKXZTF9EmFeP49D15NvsF/baller.webm",
          gif: "https://ipfs.io/ipfs/QmeMfJk6yxYmMd41ThDpqcdEJmKXZTF9EmFeP49D15NvsF/baller.gif",
        },
        tokens: [122],
      },
    };
    return res.status(200).json({ total: 8, data });
  }

  return res.status(400).json({ error: { message: "Invalid address." } });
};
