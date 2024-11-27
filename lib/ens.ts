import {
  http,
  createConfig,
  getEnsAddress,
  Config,
  getEnsName,
  getEnsAvatar,
} from "@wagmi/core";
import { mainnet } from "@wagmi/core/chains";
import { normalize } from "viem/ens";

export class ENSResolver {
  private config: Config;

  constructor() {
    this.config = createConfig({
      chains: [mainnet],
      transports: {
        [mainnet.id]: http(),
      },
    });
  }

  async resolveENSAvatar(name: string) {
    const ensAvatar = await getEnsAvatar(this.config, {
      assetGatewayUrls: {
        ipfs: "https://ipfs.io/",
      },
      name: normalize(name),
    });
    return ensAvatar;
  }

  async resolveName(address: string): Promise<string | null> {
    if (!address) {
      return null;
    }

    try {
      return await getEnsAddress(this.config, {
        name: normalize(address),
      });
    } catch (error) {
      console.error(`Error resolving address for name ${address}:`, error);
      return null;
    }
  }

  async resolveAddress(address: string): Promise<string | null> {
    if (!address) {
      return null;
    }

    try {
      return await getEnsName(this.config, {
        address: address as `0x${string}`,
      });
    } catch (error) {
      console.error(`Error resolving ENS name for address ${address}:`, error);
      return null;
    }
  }
}
