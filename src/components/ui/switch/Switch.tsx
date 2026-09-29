import {
  Switch as BaseSwitch,
  type SwitchRootProps as BaseSwitchRootProps,
} from "@base-ui/react/switch";

import { cn } from "../../../lib/cn";
import styles from "./Switch.module.css";

export interface SwitchProps extends Omit<BaseSwitchRootProps, "className"> {
  className?: string;
}

export function Switch({ className, ...props }: SwitchProps) {
  return (
    <BaseSwitch.Root {...props} className={cn(styles.root, className)}>
      <BaseSwitch.Thumb className={styles.thumb} />
    </BaseSwitch.Root>
  );
}
