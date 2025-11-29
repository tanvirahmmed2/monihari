
import Navbar from "@/components/UI/Navbar";
import "./globals.css";
import Footer from "@/components/UI/Footer";


export const metadata = {
  title: "Shop",
  description: "E-commerce shop for local business",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className="w-full overflow-x-hidden relative"
      >
        <Navbar/>
        <div className="mt-14">{children}</div>
        <Footer/>
      </body>
    </html>
  );
}
