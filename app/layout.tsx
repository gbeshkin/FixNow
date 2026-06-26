import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HandyGo | Reliable help near you",
  description: "HandyGo connects customers with nearby approved handymen for small home repair tasks."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIINfQO3ZxjJdt1j0zQh3pY0rF0Icc0hZjc="
          crossOrigin=""
        />
      </head>
      <body className="min-h-screen overflow-x-hidden font-sans antialiased">{children}</body>
    </html>
  );
}
