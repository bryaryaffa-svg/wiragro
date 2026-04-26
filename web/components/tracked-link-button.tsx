"use client";

import type { ReactNode } from "react";

import { trackUiEvent, type AnalyticsPayload } from "@/lib/analytics";
import { PrimaryButton, SecondaryButton } from "@/components/ui/button";

type TrackedLinkButtonProps = {
  children: ReactNode;
  event: string;
  href: string;
  payload?: AnalyticsPayload;
  variant?: "primary" | "secondary";
};

export function TrackedLinkButton({
  children,
  event,
  href,
  payload,
  variant = "primary",
}: TrackedLinkButtonProps) {
  const ButtonComponent = variant === "primary" ? PrimaryButton : SecondaryButton;

  return (
    <ButtonComponent
      href={href}
      onClick={() => {
        trackUiEvent(event, payload);
      }}
    >
      {children}
    </ButtonComponent>
  );
}
