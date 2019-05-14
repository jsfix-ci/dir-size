import { add, reduce } from "ramda";

export const sum = reduce<number, number>(add, 0);
