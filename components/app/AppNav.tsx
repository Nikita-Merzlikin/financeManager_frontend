"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/context";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
  { href: "/accounts", label: "Accounts" },
  { href: "/banks", label: "Banks" },
  { href: "/plans", label: "Plans" },
  { href: "/ai", label: "AI" },
  { href: "/settings", label: "Settings" },
];

export function AppNav() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <header className="app-nav">
      <div className="app-nav-brand">
        <p className="brand-mark">Ledgerly</p>
      </div>
      <nav className="app-nav-links" aria-label="Main">
        {links.map((link) => {
          const active =
            pathname === link.href ||
            pathname.startsWith(`${link.href}/`);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={active ? "nav-link active" : "nav-link"}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
      <button type="button" className="btn btn-ghost" onClick={() => void logout()}>
        Log out
      </button>
    </header>
  );
}
