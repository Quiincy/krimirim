import type { Metadata, Viewport } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["cyrillic", "latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Ресторан «Крим & Рим» у Києві | Меню, Піца з дров'яної печі, Мангал",
  description:
    "Ресторан кримськотатарської та італійської кухні у Києві (вул. Братства Тарасівців, 3, м. Харківська). Чебуреки, янтики, шурпа, лагман, шашлик на вугіллі, піца з дров'яної печі та домашня паста.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Ресторан «Крим & Рим» — Кримськотатарська та Італійська кухня",
    description:
      "Дві кулінарні традиції під одним дахом: чебуреки, шурпа, мангал, неаполітанська піца з печі та домашня паста. м. Київ, вул. Братства Тарасівців, 3.",
    images: ["/images/interior_panorama.jpg"],
    locale: "uk_UA",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased selection:bg-amber-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

