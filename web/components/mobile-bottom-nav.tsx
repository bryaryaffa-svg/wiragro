"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { isHybridNavActive } from "@/lib/hybrid-navigation";
import { WIRAGRO_ICON_ASSETS } from "@/lib/wiragro-assets";

type MobileNavIconKind = "home" | "solve" | "shop" | "learn" | "account";

type MobileNavLink = {
  href: string;
  label: string;
  badge?: string | null;
  icon: MobileNavIconKind;
  hybrid?: boolean;
  aliases?: string[];
};

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

const MOBILE_NAV_ICON_SRC: Record<MobileNavIconKind, string> = {
  account: WIRAGRO_ICON_ASSETS.account,
  home: WIRAGRO_ICON_ASSETS.home,
  learn: WIRAGRO_ICON_ASSETS.education,
  shop: WIRAGRO_ICON_ASSETS.product,
  solve: WIRAGRO_ICON_ASSETS.solution,
};

function MobileNavIcon({ kind }: { kind: MobileNavIconKind }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      src={MOBILE_NAV_ICON_SRC[kind]}
    />
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { session } = useAuth();
  const accountHref = session ? "/akun" : "/masuk";
  const mobileLinks: MobileNavLink[] = [
    {
      href: "/",
      label: "Beranda",
      badge: null,
      icon: "home" as const,
      hybrid: false,
    },
    {
      href: "/solusi",
      label: "Solusi",
      badge: null,
      icon: "solve" as const,
      hybrid: true,
    },
    {
      href: "/produk",
      label: "Produk",
      badge: null,
      icon: "shop" as const,
      hybrid: true,
    },
    {
      href: "/artikel",
      label: "Edukasi",
      badge: null,
      icon: "learn" as const,
      hybrid: true,
    },
    {
      href: accountHref,
      label: "Akun",
      badge: null,
      icon: "account" as const,
      hybrid: false,
      aliases: ["/akun", "/masuk", "/login"],
    },
  ];

  return (
    <nav className="mobile-nav" aria-label="Navigasi mobile">
      {mobileLinks.map((link) => {
        const isActive = link.hybrid
          ? isHybridNavActive(pathname, link.href)
          : isActivePath(pathname, link.href) ||
            Boolean(link.aliases?.some((href) => isActivePath(pathname, href)));
        return (
          <Link className={isActive ? "is-active" : undefined} href={link.href} key={link.href}>
            <span className="mobile-nav__icon">
              <MobileNavIcon kind={link.icon} />
            </span>
            <span className="mobile-nav__label">{link.label}</span>
            {link.badge ? <strong>{link.badge}</strong> : null}
          </Link>
        );
      })}
    </nav>
  );
}
