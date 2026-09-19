import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adam Fay — Portfolio",
  description: "Adam Fay - Art Direction and Illustration",
  icons: {
    icon: [
      { url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/favicon.ico`, sizes: "any" },
      {
        url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing-pages/meng-to-sketchbook/assets/logo-adam.png`,
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
        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing-pages/meng-to-sketchbook/bg-wash.webp`}
      />
      <link
        rel="preload"
        as="image"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing-pages/meng-to-sketchbook/assets/1.webp`}
      />
      <link
        rel="preload"
        as="image"
        href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/landing-pages/meng-to-sketchbook/assets/2.webp`}
      />
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
