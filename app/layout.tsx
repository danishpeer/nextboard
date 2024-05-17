import "@/app/ui/global.css";
import {inter} from "@/app/ui/fonts"
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <Toaster position="top-center"/>
        {children}
      </body>
    </html>
  );
}
