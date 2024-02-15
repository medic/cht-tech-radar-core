import {
  CSSProperties,
  ComponentPropsWithoutRef,
  ReactNode,
  useMemo,
} from "react";

import styles from "./Badge.module.css";

import { getFlag, getRing } from "@/lib/data";
import { formatRelease } from "@/lib/format";
import { Flag } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BadgeProps extends ComponentPropsWithoutRef<"span"> {
  children?: ReactNode;
  color?: string;
  size?: "small" | "medium" | "large";
}

export function Badge({
  children,
  color,
  size = "medium",
  ...props
}: BadgeProps) {
  const style = useMemo(
    () => (color ? ({ "--badge": color } as CSSProperties) : undefined),
    [color],
  );
  return (
    <button
      {...props}
      style={style}
      className={cn(
        props.className,
        styles.badge,
        styles[`size-${size}`],
        color && styles.colored,
      )}
    >
      {children}
    </button>
  );
}

interface RingBadgeProps extends Omit<BadgeProps, "color" | "children"> {
  ring: string;
  release?: string;
}
export function RingBadge({
  ring: ringName,
  release,
  ...props
}: RingBadgeProps) {
  const ring = getRing(ringName);
  if (!ring) return null;

  const label = release
    ? `${ring.title} | ${formatRelease(release)}`
    : ring.title;

  return (
    <Badge color={ring.color} {...props}>
      {label}
    </Badge>
  );
}

interface FlagBadgeProps
  extends Omit<BadgeProps, "color" | "children" | "size"> {
  flag: Flag;
  short?: boolean;
}
export function FlagBadge({ flag: flagName, short, ...props }: FlagBadgeProps) {
  if (flagName === Flag.Default) return null;
  const flag = getFlag(flagName);

  return (
    <Badge color={flag.color} size="small" {...props}>
      {short ? flag.titleShort : flag.title}
    </Badge>
  );
}
