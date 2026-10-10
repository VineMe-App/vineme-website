"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAdmin } from "@/lib/dashboard/admin-context";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/follow-ups", label: "Follow-ups", exact: false },
  { href: "/dashboard/groups", label: "My groups", exact: false },
  { href: "/dashboard/members", label: "Members", exact: false },
  { href: "/dashboard/settings", label: "Settings", exact: false },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { firstName } = useAdmin();

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <nav
        aria-label="Dashboard"
        className="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 sm:gap-8 sm:px-6"
      >
        <Link
          href="/dashboard"
          className="flex shrink-0 items-center py-2"
          aria-label="VineMe dashboard home"
        >
          <Image
            src="/images/vineme-assets/LOGO/vineme_svg-04.svg"
            alt=""
            width={90}
            height={90}
            className="h-10 w-auto"
            priority
          />
          <Image
            src="/images/vineme-assets/LOGO/vineme_svg-05.svg"
            alt="VineMe"
            width={111}
            height={30}
            className="-ml-2 hidden h-5 w-auto translate-y-1.5 sm:block"
            priority
          />
        </Link>

        <ul className="-mb-px flex min-w-0 flex-1 gap-1 overflow-x-auto sm:gap-2">
          {navItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "block whitespace-nowrap border-b-2 px-3 py-4 font-medium text-sm transition-colors",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <Avatar className="size-9" aria-label={firstName}>
          <AvatarFallback>{firstName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </nav>
    </header>
  );
}
