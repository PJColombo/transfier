import { Interface } from "ethers/lib/utils";
import erc20Abi from "../abis/ERC20.json";

export const ERC20_INTERFACE = new Interface(erc20Abi);
