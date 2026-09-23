import type { Metadata } from "next";
import { BASE_PATH } from "../config/base-path";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam Fay — Portfolio",
  description: "Adam Fay - Art Direction and Illustration",
  icons: {
    icon: [
      { url: `${BASE_PATH}/favicon.ico`, sizes: "any" },
      {
        url: `${BASE_PATH}/landing-pages/meng-to-sketchbook/assets/logo-adam.png`,
        type: "image/png",
      },
    ],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <link
        rel="preload"
        as="image"
        href={`${BASE_PATH}/landing-pages/meng-to-sketchbook/BCN.webp`}
      />
      <link
        rel="preload"
        as="image"
        href={`${BASE_PATH}/landing-pages/meng-to-sketchbook/assets/1.webp`}
      />
      <link
        rel="preload"
        as="image"
        href={`${BASE_PATH}/landing-pages/meng-to-sketchbook/assets/2.webp`}
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
