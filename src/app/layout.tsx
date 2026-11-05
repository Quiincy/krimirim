import type { Metadata, Viewport } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["cyrillic", "latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700", "800"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["cyrillic", "latin"],
  variable: "--font-serif",
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
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
    <html lang="uk" className={`${montserrat.variable} ${cormorant.variable}`}>
      <body className="font-sans antialiased selection:bg-amber-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}

