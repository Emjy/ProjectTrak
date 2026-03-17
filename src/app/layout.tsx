import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "ProjectTrak",
  description: "Modern project tracking application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">
        <AppProvider>
          <div className="flex h-screen overflow-hidden">
            {/* Fixed Sidebar */}
            <Sidebar />

            {/* Main content area */}
            <div className="flex-1 flex flex-col ml-60 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto p-8">
                {children}
              </main>
            </div>
          </div>
        </AppProvider>
      </body>
    </html>
  );
}
