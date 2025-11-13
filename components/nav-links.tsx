"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const routes = [
  { href: "/", label: "기업마당 공고 검색" },
  { href: "/nara", label: "나라장터 입찰공고" },
];

export function HeaderNav() {
  const pathname = usePathname() ?? "/";
  return (
    <nav className="mt-3 flex flex-wrap gap-2 text-sm">
      {routes.map((route) => {
        const active = pathname === route.href || (route.href !== "/" && pathname.startsWith(route.href));
        return (
          <Link
            key={route.href}
            href={route.href}
            className={[
              "rounded-full border px-3 py-1 transition",
              active
                ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-400/20 dark:text-blue-200"
                : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600 dark:border-neutral-700 dark:text-gray-300 dark:hover:border-blue-500",
            ].join(" ")}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}
