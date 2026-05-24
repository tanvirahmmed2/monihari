import ContextProvider from "@/components/helper/Context";
import "./globals.css";
import ToastProvider from "@/components/helper/ToastProvider";
import siteConfig from "@/lib/siteConfig";

export async function generateMetadata() {
  return {
    title: {
      default: siteConfig.meta_title || siteConfig.name,
      template: `%s | ${siteConfig.name}`,
    },
    description: siteConfig.meta_description,
    icons: {
      icon: siteConfig.favicon || "/icon.png",
      apple: siteConfig.favicon || "/icon.png",
    },
  };
}

export default function RootLayout({ children }) {
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
