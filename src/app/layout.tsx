import type { Metadata } from "next";
import { Nunito, DM_Sans } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"], 
  variable: "--font-nunito",
  weight: ["700", "800", "900"] 
});

const dmSans = DM_Sans({ 
  subsets: ["latin"], 
  variable: "--font-dm-sans",
  weight: ["400", "500", "700"] 
});

export const metadata: Metadata = {
  title: "ChartFlow — Visual Data Studio",
  description:
    "Upload any JSON data and instantly visualize it with 30+ beautiful chart types. The modern Excel replacement for presentations.",
  keywords: ["charts", "data visualization", "JSON", "Excel alternative"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('cf-theme') || 'dark';
                document.documentElement.classList.add(t);
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className={`${dmSans.variable} ${nunito.variable} font-sans`}>
        <TooltipProvider>
          {children}
          <Toaster richColors position="bottom-right" />
        </TooltipProvider>
      </body>
    </html>
  );
}
