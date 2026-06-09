import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "InsurTech AI Platform -- Policy Management & Claims Automation",
  description: "Portfolio demo: AI-powered insurance agency dashboard for policy management, claims processing, customer portal, and risk analytics."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
