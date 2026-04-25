"use client";

import Link from "next/link";
import { useEffect, type ReactNode } from "react";

import type { CommerceTrackingPayload } from "@/lib/growth-commerce";
import {
  trackCommerceIntentClick,
  trackCommerceIntentImpression,
} from "@/lib/commerce-tracking";

export function CommerceIntentLink({
  href,
  className,
  children,
  tracking,
  leadRef,
  leadSummary,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  tracking?: CommerceTrackingPayload | null;
  leadRef?: string | null;
  leadSummary?: string | null;
}) {
  const isExternal = href.startsWith("http");

  useEffect(() => {
    if (tracking) {
      trackCommerceIntentImpression(tracking);
    }
  }, [
    tracking?.intent,
    tracking?.surface,
    tracking?.funnelStage,
    tracking?.leadRef,
    tracking?.targetUrl,
  ]);

  const handleClick = () => {
    if (tracking) {
      trackCommerceIntentClick(tracking);
    }
  };

  if (isExternal) {
    return (
      <a
        className={className}
        data-commerce-intent={tracking?.intent}
        data-commerce-code={tracking?.leadCode}
        data-commerce-ref={leadRef ?? undefined}
        data-commerce-stage={tracking?.funnelStage}
        data-commerce-surface={tracking?.surface}
        data-commerce-lead={tracking?.leadLabel}
        data-commerce-summary={leadSummary ?? undefined}
        href={href}
        onClick={handleClick}
        rel="noreferrer"
        target="_blank"
      >
        {children}
      </a>
    );
  }

  return (
    <Link
      className={className}
      data-commerce-intent={tracking?.intent}
      data-commerce-code={tracking?.leadCode}
      data-commerce-ref={leadRef ?? undefined}
      data-commerce-stage={tracking?.funnelStage}
      data-commerce-surface={tracking?.surface}
      data-commerce-lead={tracking?.leadLabel}
      data-commerce-summary={leadSummary ?? undefined}
      href={href}
      onClick={handleClick}
    >
      {children}
    </Link>
  );
}
