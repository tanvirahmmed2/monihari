import ContextProvider from "@/components/helper/Context";
import "./globals.css";
import ToastProvider from "@/components/helper/ToastProvider";
import { headers } from "next/headers";

export async function generateMetadata() {
  const title = "Razers";
  const description = "Premium Shopping Experience";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description: description,
    icons: {
      icon: "/icon.png",
      apple: "/icon.png",
    }
  };
}

export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="w-full overflow-x-hidden relative bg-white">
        <ContextProvider initialSiteData={null}>
          <ToastProvider>
              <main>{children}</main>
          </ToastProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
