import {
  RadioGroupItem,
  RadioGroupRoot,
} from "./RadioGroup";

export const RadioGroup = Object.assign(
  RadioGroupRoot,
  {
    Item: RadioGroupItem,
  },
);

export type {
  RadioGroupItemProps,
  RadioGroupProps,
} from "./RadioGroup";
