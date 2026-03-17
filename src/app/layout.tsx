import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { MobileMenuProvider } from "@/context/MobileMenuContext";
import RootLayoutClient from "@/components/layout/RootLayoutClient";

export const metadata: Metadata = {
  title: "ProjectTrak",
  description: "Modern project tracking application",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#f5f6f8] text-slate-900">
        <AppProvider>
          <MobileMenuProvider>
            <RootLayoutClient>
              {children}
            </RootLayoutClient>
          </MobileMenuProvider>
        </AppProvider>
      </body>
    </html>
  );
}
