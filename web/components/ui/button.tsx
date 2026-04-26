import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import Link from "next/link";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

type LinkButtonProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  prefetch?: boolean;
  rel?: string;
  target?: string;
  title?: string;
};

type NativeButtonProps = {
  ariaLabel?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

function ActionButton({
  variant,
  ...props
}: ({ variant: "primary" | "secondary" } & LinkButtonProps) | ({ variant: "primary" | "secondary" } & NativeButtonProps)) {
  const buttonClassName = joinClassNames(
    "btn",
    variant === "primary" ? "btn-primary" : "btn-secondary",
    props.className,
  );

  if ("href" in props) {
    return (
      <Link
        aria-label={props.ariaLabel}
        className={buttonClassName}
        href={props.href}
        onClick={props.onClick}
        prefetch={props.prefetch}
        rel={props.target === "_blank" ? props.rel ?? "noreferrer" : props.rel}
        target={props.target}
        title={props.title}
      >
        {props.children}
      </Link>
    );
  }

  return (
    <button
      {...props}
      aria-label={props.ariaLabel}
      className={buttonClassName}
      type={props.type ?? "button"}
    >
      {props.children}
    </button>
  );
}

export function PrimaryButton(
  props: LinkButtonProps | NativeButtonProps,
) {
  return <ActionButton variant="primary" {...props} />;
}

export function SecondaryButton(
  props: LinkButtonProps | NativeButtonProps,
) {
  return <ActionButton variant="secondary" {...props} />;
}
