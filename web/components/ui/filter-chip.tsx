import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

function joinClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ");
}

type LinkChipProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
  href: string;
};

type ButtonChipProps = {
  active?: boolean;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function FilterChip(
  props: LinkChipProps | ButtonChipProps,
) {
  const className = joinClassNames(
    "filter-chip",
    props.active ? "is-active" : undefined,
    props.className,
  );

  if ("href" in props) {
    return (
      <Link aria-current={props.active ? "page" : undefined} className={className} href={props.href}>
        {props.children}
      </Link>
    );
  }

  return (
    <button
      {...props}
      aria-pressed={props.active}
      className={className}
      type={props.type ?? "button"}
    >
      {props.children}
    </button>
  );
}
