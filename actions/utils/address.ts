import type { Address } from "../types";

export function addressesEqual(first: Address, second: Address): boolean {
  first = first && first.toLowerCase();
  second = second && second.toLowerCase();
  return first === second;
}
