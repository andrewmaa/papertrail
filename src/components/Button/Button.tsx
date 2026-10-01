import type { ComponentPropsWithoutRef } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "outline" | "inverse" | "inverseOutline";

type ButtonProps = {
  variant?: ButtonVariant;
  href?: string;
} & ComponentPropsWithoutRef<"button">;

export default function Button({
  variant = "primary",
  href,
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  if (href) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
