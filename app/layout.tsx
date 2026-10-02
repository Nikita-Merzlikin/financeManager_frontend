import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { AuthProvider } from "@/lib/auth/context";
import "./globals.css";

const display = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
});

const sans = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: "Ledgerly",
  description: "Personal finance manager",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="uk"
      className={`${display.variable} ${sans.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
