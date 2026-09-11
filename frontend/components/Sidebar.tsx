"use client";

import { useEffect, useState, type SVGProps } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

function DashboardIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

function GuideIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function ConfigIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/setup-guide", label: "Setup Guide", Icon: GuideIcon },
  { href: "/configuration", label: "Configuration", Icon: ConfigIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    api
      .getConfig()
      .then((config) => {
        if (!ignore) setOwnerEmail(config.ownerEmail);
      })
      .catch(() => {
        // Cosmetic only - a failed fetch just means the label doesn't show.
      });
    return () => {
      ignore = true;
    };
  }, []);

  return (
    <aside className="flex flex-col border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 sm:min-h-screen sm:w-56 sm:border-b-0 sm:border-r">
      <div className="px-5 py-4">
        <Link href="/dashboard" className="font-semibold text-zinc-900 dark:text-zinc-50">
          Claude Usage Monitor
        </Link>
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 pb-3 sm:flex-1 sm:flex-col sm:overflow-visible">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname?.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={
                "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50")
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      {ownerEmail && (
        <div className="hidden truncate px-5 py-4 text-xs text-zinc-400 dark:text-zinc-500 sm:block" title={ownerEmail}>
          {ownerEmail}
        </div>
      )}
    </aside>
  );
}
