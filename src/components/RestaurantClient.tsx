"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  Phone,
  Clock,
  Wifi,
  Flame,
  Star,
  Search,
  Calendar,
  ExternalLink,
  Instagram,
  Sparkles,
  Utensils,
  Wine,
  PawPrint,
  Zap,
  FileText,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Settings,
  Menu as MenuIcon,
  Eye,
} from "lucide-react";
import { LogoDiamond, KidsMenuCatIllustration } from "./LogoDiamond";

export interface Category {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  culinary_group: "crimea" | "rome" | "grill" | "kids" | "bar";
  banner_image: string;
  sort_order: number;
  is_visible: boolean;
}

export interface MenuItem {
  id: number;
  category_slug: string;
  name: string;
  quote_badge: string;
  badge_color: string;
  description: string;
  weight: string;
  price: string;
  image_url: string;
  is_spicy: boolean;
  is_popular: boolean;
  is_available: boolean;
  sort_order: number;
}

export interface GalleryPhoto {
  id: number;
  title: string;
  category: string;
  image_url: string;
  sort_order: number;
}

export interface Review {
  id: number;
  author_name: string;
  author_avatar: string;
  rating: number;
  relative_time: string;
  text: string;
  source: string;
}

interface Props {
  initialData: {
    categories: Category[];
    menuItems: MenuItem[];
    gallery: GalleryPhoto[];
    reviews: Review[];
    settings: Record<string, string>;
  };
}

export default function RestaurantClient({ initialData }: Props) {
  const { categories, menuItems, gallery, reviews, settings } = initialData;

  // Menu filtering state
  const [activeGroup, setActiveGroup] = useState<string>("all");
  const [activeCategorySlug, setActiveCategorySlug] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [onlyPopular, setOnlyPopular] = useState<boolean>(false);
  const [onlyWithPhoto, setOnlyWithPhoto] = useState<boolean>(false);

  // Gallery filtering & Lightbox
  const [galleryTab, setGalleryTab] = useState<string>("all");
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    title: string;
    subtitle?: string;
  } | null>(null);

  // Mobile nav & Reservation modal
  const [mobileNavOpen, setMobileNavOpen] = useState<boolean>(false);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [wifiCopied, setWifiCopied] = useState<boolean>(false);

  // Reservation form state
  const [bookingForm, setBookingForm] = useState({
    customer_name: "",
    customer_phone: "",
    guests_count: 2,
    reservation_date: new Date().toISOString().split("T")[0],
    reservation_time: "19:00",
    hall_preference: "crimea",
    comment: "",
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Filter categories based on macro group
  const visibleCategories = useMemo(() => {
    return categories.filter((c) => {
      if (activeGroup === "all") return true;
      return c.culinary_group === activeGroup;
    });
  }, [categories, activeGroup]);

  // Group menu items by category
  const filteredCategoriesWithItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return visibleCategories
      .filter((c) => activeCategorySlug === "all" || c.slug === activeCategorySlug)
      .map((cat) => {
        const items = menuItems.filter((item) => {
          if (item.category_slug !== cat.slug) return false;
          if (onlyPopular && !item.is_popular) return false;
          if (onlyWithPhoto && !item.image_url) return false;
          if (q) {
            const matchName = item.name.toLowerCase().includes(q);
            const matchDesc = (item.description || "").toLowerCase().includes(q);
            const matchQuote = (item.quote_badge || "").toLowerCase().includes(q);
            return matchName || matchDesc || matchQuote;
          }
          return true;
        });

        return {
          category: cat,
          items,
        };
      })
      .filter((group) => group.items.length > 0);
  }, [
    visibleCategories,
    activeCategorySlug,
    menuItems,
    onlyPopular,
    onlyWithPhoto,
    searchQuery,
  ]);

  const filteredGallery = useMemo(() => {
    if (galleryTab === "all") return gallery;
    return gallery.filter((g) => g.category === galleryTab);
  }, [gallery, galleryTab]);

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(settings.wifi_password || "krymirome");
    setWifiCopied(true);
    setTimeout(() => setWifiCopied(false), 2500);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSubmitting(true);
    setBookingError("");

    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingForm),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Помилка бронювання");
      }
      setBookingSuccess(true);
    } catch (err: unknown) {
      setBookingError(
        err instanceof Error ? err.message : "Помилка відправки заявки"
      );
    } finally {
      setBookingSubmitting(false);
    }
  };

  const reviewsScrollRef = React.useRef<HTMLDivElement>(null);
  const scrollReviews = (direction: "left" | "right") => {
    if (reviewsScrollRef.current) {
      const amount = reviewsScrollRef.current.clientWidth * 0.85;
      reviewsScrollRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  const googleMapsUrl =
    settings.google_maps_url ||
    "https://maps.app.goo.gl/GR3u8QYa7ntYbPoa9";

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-zinc-900 flex flex-col pb-16 md:pb-0 overflow-x-hidden w-full max-w-full">
      {/* ================= TOP PROMO & INFO STRIP ================= */}
      <div className="bg-zinc-950 text-stone-200 text-xs border-b border-zinc-800 overflow-hidden select-none">
        {/* Mobile: Infinite Loop Ticker in One Line */}
        <div className="md:hidden py-2.5 overflow-hidden relative">
          <div className="animate-marquee flex items-center gap-5 whitespace-nowrap">
            {[0, 1].map((copyIdx) => (
              <React.Fragment key={copyIdx}>
                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium text-[11px]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Будні 11:00–15:00: -20% на кухню
                </span>
                <span className="text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1.5 text-stone-300 text-[11px]">
                  🍕 Піца з собою: -15%
                </span>
                <span className="text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1.5 text-emerald-300 text-[11px]">
                  <Zap className="w-3.5 h-3.5" /> Світло є • Генератор
                </span>
                <span className="text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1.5 text-amber-200 text-[11px]">
                  <PawPrint className="w-3.5 h-3.5" /> Pet-friendly
                </span>
                <span className="text-zinc-700">•</span>
                <button
                  type="button"
                  onClick={handleCopyWifi}
                  className="inline-flex items-center gap-1.5 text-stone-200 text-[11px] hover:text-white"
                >
                  <Wifi className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    Wi-Fi:{" "}
                    <strong className="font-mono text-white underline">
                      {wifiCopied
                        ? "Скопійовано!"
                        : settings.wifi_password || "krymirome"}
                    </strong>
                  </span>
                </button>
                <span className="text-zinc-700">•</span>
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-stone-300 text-[11px] hover:text-white"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  вул. Братства Тарасівців, 3
                </a>
                <span className="text-zinc-700">•</span>
                <a
                  href={`tel:${(settings.phone || "+380931090103").replace(/[^\d+]/g, "")}`}
                  className="inline-flex items-center gap-1.5 text-amber-400 text-[11px]"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {settings.phone || "+380 (93) 109-01-03"}
                </a>
                <span className="text-zinc-700 mr-2">•</span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Desktop: Clean Single Line Bar */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 py-2 items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar whitespace-nowrap">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              Будні 11:00–15:00: -20% на кухню
            </span>
            <span className="text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1 text-stone-300">
              🍕 Піца з собою -15%
            </span>
            <span className="text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1 text-emerald-300">
              <Zap className="w-3.5 h-3.5" /> Працюємо зі світлом та генератором
            </span>
            <span className="text-zinc-700">•</span>
            <span className="inline-flex items-center gap-1 text-amber-200">
              <PawPrint className="w-3.5 h-3.5" /> Pet-friendly
            </span>
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button
              onClick={handleCopyWifi}
              className="inline-flex items-center gap-1.5 text-stone-300 hover:text-white transition"
              title="Натисніть, щоб скопіювати пароль Wi-Fi"
            >
              <Wifi className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Wi-Fi:{" "}
                <strong className="font-mono tracking-wider text-white">
                  {wifiCopied
                    ? "Скопійовано!"
                    : settings.wifi_password || "krymirome"}
                </strong>
              </span>
            </button>
            <a
              href={`tel:${(settings.phone || "+380931090103").replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
            >
              <Phone className="w-3.5 h-3.5" />
              {settings.phone || "+380 (93) 109-01-03"}
            </a>
          </div>
        </div>
      </div>

      {/* ================= STICKY NAVIGATION HEADER ================= */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          {/* Left Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium tracking-wide uppercase text-zinc-700">
            <a href="#menu" className="hover:text-zinc-950 transition py-1 border-b-2 border-transparent hover:border-zinc-900">
              Меню
            </a>
            <a href="#concept" className="hover:text-zinc-950 transition py-1 border-b-2 border-transparent hover:border-zinc-900">
              Крим & Рим
            </a>
            <a href="#gallery" className="hover:text-zinc-950 transition py-1 border-b-2 border-transparent hover:border-zinc-900">
              Атмосфера
            </a>
            <a href="#reviews" className="hover:text-zinc-950 transition py-1 border-b-2 border-transparent hover:border-zinc-900">
              Відгуки Google
            </a>
            <a href="#contacts" className="hover:text-zinc-950 transition py-1 border-b-2 border-transparent hover:border-zinc-900">
              Контакти
            </a>
          </nav>

          {/* Mobile Burger Button */}
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2.5 rounded-lg border border-stone-200 text-zinc-800 hover:bg-stone-100"
            aria-label="Меню навігації"
          >
            {mobileNavOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>

          {/* Center Diamond Logo */}
          <a
            href="#"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="relative -my-4 transform group-hover:scale-105 transition duration-300">
              <LogoDiamond size="md" />
            </div>
            <div className="hidden sm:block lg:hidden xl:block">
              <div className="text-lg font-bold tracking-[0.2em] uppercase text-zinc-900 leading-none">
                КРИМ & РИМ
              </div>
              <div className="text-[11px] text-zinc-500 tracking-widest uppercase mt-1">
                Ресторан двох культур
              </div>
            </div>
          </a>

          {/* Right Actions */}
          <div className="flex items-center gap-2.5">
            <a
              href="/menu.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-none border border-zinc-900 text-xs font-semibold uppercase tracking-wider text-zinc-900 hover:bg-zinc-900 hover:text-white transition"
              title="Відкрити оригінальне PDF меню"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF Меню</span>
            </a>

            <button
              onClick={() => {
                setBookingSuccess(false);
                setBookingModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white text-xs font-semibold uppercase tracking-widest hover:bg-amber-700 transition shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Бронювати стіл</span>
            </button>

            <Link
              href="/admin"
              className="p-2 text-zinc-400 hover:text-zinc-900 transition"
              title="Адмін-панель"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white border-t border-stone-200 px-4 py-5 space-y-4 shadow-xl">
            <div className="grid grid-cols-2 gap-2 text-sm font-semibold uppercase tracking-wider">
              <a
                href="#menu"
                onClick={() => setMobileNavOpen(false)}
                className="p-3 bg-stone-100 rounded text-center"
              >
                📖 Меню
              </a>
              <a
                href="#concept"
                onClick={() => setMobileNavOpen(false)}
                className="p-3 bg-stone-100 rounded text-center"
              >
                🏛️ Концепція
              </a>
              <a
                href="#gallery"
                onClick={() => setMobileNavOpen(false)}
                className="p-3 bg-stone-100 rounded text-center"
              >
                📸 Фотогалерея
              </a>
              <a
                href="#reviews"
                onClick={() => setMobileNavOpen(false)}
                className="p-3 bg-stone-100 rounded text-center"
              >
                ⭐ Відгуки
              </a>
            </div>
            <div className="pt-2 border-t border-stone-100 flex flex-col gap-2 text-sm text-zinc-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{settings.hours}</span>
              </div>
              <div className="flex items-center justify-between pt-2">
                <a
                  href="/menu.pdf"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider underline"
                >
                  <FileText className="w-4 h-4" /> Завантажити PDF-меню
                </a>
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1 text-xs text-zinc-500"
                >
                  <Settings className="w-3.5 h-3.5" /> Адмінка
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO SECTION (STYLED AFTER PDF SLIDE 1) ================= */}
      <section className="relative overflow-hidden bg-white border-b border-stone-200 py-10 md:py-16">
        {/* Subtle decorative background lines */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            {/* Left Column: Editorial Typography & Concept */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 border border-stone-300 text-xs uppercase tracking-[0.2em] font-semibold text-zinc-800">
                <span>Кримськотатарська</span>
                <span className="text-amber-600">&amp;</span>
                <span>Італійська кухня</span>
              </div>

              <h1 className="text-4xl sm:text-5xl xl:text-6xl font-bold tracking-tight text-zinc-950 leading-[1.08]">
                Коли південний вогонь{" "}
                <span className="underline decoration-amber-500/60 decoration-4 underline-offset-8">
                  Криму
                </span>{" "}
                зустрічає класику{" "}
                <span className="italic font-serif font-normal text-amber-800">
                  Риму
                </span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-2xl">
                У ресторані <strong>«Крим &amp; Рим»</strong> на Харківському
                масиві ми об’єднали дві легендарні гастрономічні традиції. Тут
                хрумкі авторські чебуреки, янтики, навариста шурпа й соковитий
                люля-кебаб із мангалу сусідують зі справжньою неаполітанською
                піцою з живої дров’яної печі, домашньою пастою ручної роботи та
                равіолі.
              </p>

              {/* Key Highlights Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 bg-[#F8F6F1] border border-stone-200">
                  <div className="text-xs uppercase tracking-widest text-zinc-500">
                    Дров&apos;яна піч
                  </div>
                  <div className="text-sm font-bold text-zinc-900 mt-0.5">
                    14 видів піци
                  </div>
                </div>
                <div className="p-3.5 bg-[#F8F6F1] border border-stone-200">
                  <div className="text-xs uppercase tracking-widest text-zinc-500">
                    Живий вогонь
                  </div>
                  <div className="text-sm font-bold text-zinc-900 mt-0.5">
                    Мангал &amp; Хоспер
                  </div>
                </div>
                <div className="p-3.5 bg-[#F8F6F1] border border-stone-200">
                  <div className="text-xs uppercase tracking-widest text-zinc-500">
                    Будні 11–15
                  </div>
                  <div className="text-sm font-bold text-amber-700 mt-0.5">
                    Знижка -20%
                  </div>
                </div>
                <div className="p-3.5 bg-[#F8F6F1] border border-stone-200">
                  <div className="text-xs uppercase tracking-widest text-zinc-500">
                    Google Карти
                  </div>
                  <a
                    href="#reviews"
                    className="text-sm font-bold text-zinc-900 mt-0.5 inline-flex items-center gap-1 hover:text-amber-700"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {settings.google_rating || "4.8"} ({settings.google_reviews_count || "288"})
                  </a>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-3 px-7 py-4 bg-zinc-950 text-white text-xs sm:text-sm font-bold uppercase tracking-[0.2em] hover:bg-amber-700 transition shadow-md"
                >
                  <Utensils className="w-4 h-4" />
                  <span>Відкрити повне меню</span>
                </a>
                <button
                  onClick={() => {
                    setBookingSuccess(false);
                    setBookingModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-4 bg-white border-2 border-zinc-950 text-zinc-950 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] hover:bg-stone-100 transition"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Забронювати столик</span>
                </button>
              </div>

              {/* Location & Hours quick bar */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs sm:text-sm text-zinc-600 border-t border-stone-200">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-zinc-950 transition"
                >
                  <MapPin className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="underline underline-offset-4">
                    {settings.address}
                  </span>
                </a>
                <div className="inline-flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>{settings.hours}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Authentic PDF Cover Replica (Slide 1) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md pt-10 pb-4 px-4 sm:px-6">
                {/* Outer Black Thin Frame from PDF Page 1 */}
                <div className="relative border-[1.5px] border-zinc-900 bg-white p-3 sm:p-4 shadow-2xl">
                  {/* Top Center Diamond Logo overlapping frame */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 bg-white p-1 rotate-0">
                    <LogoDiamond size="lg" />
                  </div>

                  {/* Right Vertical Black "м е н ю" Banner from PDF Page 1 */}
                  <a
                    href="#menu"
                    className="absolute -right-4 top-20 z-20 bg-zinc-950 text-white py-7 px-3 flex flex-col items-center justify-center shadow-lg hover:bg-amber-800 transition group"
                    title="Перейти до меню"
                  >
                    <span
                      className="text-xl sm:text-2xl tracking-[0.35em] font-light uppercase"
                      style={{
                        writingMode: "vertical-rl",
                        transform: "rotate(180deg)",
                      }}
                    >
                      меню
                    </span>
                  </a>

                  {/* Main Cover Photo */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-stone-100">
                    <img
                      src="/images/cover_pasta.jpg"
                      alt="Домашня паста Крим і Рим"
                      className="w-full h-full object-cover hover:scale-105 transition duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between gap-3">
                      <p className="text-sm sm:text-base font-semibold tracking-wide uppercase drop-shadow">
                        Домашня паста Путтанеска
                      </p>
                      <span className="text-sm sm:text-base font-bold bg-black/80 backdrop-blur-sm px-2.5 py-1 whitespace-nowrap shrink-0 border border-white/10">
                        290.00 ₴
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= DUAL CONCEPT SHOWCASE: КРИМ & РИМ ================= */}
      <section id="concept" className="py-12 md:py-16 bg-[#F2EFE9] border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-[0.25em] text-amber-800 font-bold">
              Дві зали • Два характери • Єдина душа
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-wider text-zinc-900 mt-2">
              Оберіть свій настрій: Крим чи Рим
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* CRIMEA CARD */}
            <div className="group bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col">
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src="/images/interior_crimea_sofas.jpg"
                  alt="Зала Крим — східний колорит"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-xs uppercase tracking-[0.25em] text-amber-300 font-semibold">
                    Південна гостинність
                  </span>
                  <h3 className="text-2xl font-bold tracking-wider uppercase mt-0.5">
                    Напрям «КРИМ»
                  </h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Затишна зала з кримськотатарськими килимами ручної роботи,
                  м’якими орнаментованими кріслами та теплим мідним світлом. У
                  меню — соковиті чебуреки та янтики з авторського тіста,
                  пікантна шурпа з нутом, лагман, махан, люля-кебаб і шашлик на
                  вугіллі.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setActiveGroup("crimea");
                      setActiveCategorySlug("all");
                      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-800 hover:text-zinc-950"
                  >
                    <span>Страви Криму</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBookingForm((f) => ({ ...f, hall_preference: "crimea" }));
                      setBookingSuccess(false);
                      setBookingModalOpen(true);
                    }}
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 underline underline-offset-4"
                  >
                    Забронювати у залі «Крим»
                  </button>
                </div>
              </div>
            </div>

            {/* ROME CARD */}
            <div className="group bg-white border border-stone-200 overflow-hidden shadow-sm hover:shadow-xl transition flex flex-col">
              <div className="relative h-64 sm:h-72 overflow-hidden">
                <img
                  src="/images/interior_rome_arches.jpg"
                  alt="Зала Рим — італійська класика"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute bottom-4 left-5 right-5 text-white">
                  <span className="text-xs uppercase tracking-[0.25em] text-stone-300 font-semibold">
                    Європейська елегантність
                  </span>
                  <h3 className="text-2xl font-bold tracking-wider uppercase mt-0.5">
                    Напрям «РИМ»
                  </h3>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Світла кам’яна кладка, високі аркові вікна, барокові карнизи,
                  віденські бістро-стільці та відкрита дров’яна піч. Тут готують
                  14 видів італійської піци, пасту з чорнилом каракатиці,
                  равіолі з качкою чи кроликом, вітелло тоннато, карпачо та
                  авторські коктейлі.
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    onClick={() => {
                      setActiveGroup("rome");
                      setActiveCategorySlug("all");
                      document.getElementById("menu")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-zinc-900 hover:text-amber-700"
                  >
                    <span>Страви Риму</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setBookingForm((f) => ({ ...f, hall_preference: "rome" }));
                      setBookingSuccess(false);
                      setBookingModalOpen(true);
                    }}
                    className="text-xs font-semibold uppercase tracking-wider text-zinc-600 hover:text-zinc-950 underline underline-offset-4"
                  >
                    Забронювати у залі «Рим»
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= FULL INTERACTIVE PDF-STYLE MENU SECTION ================= */}
      <section id="menu" className="py-12 md:py-16 max-w-7xl mx-auto px-4 w-full">
        {/* Section Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-zinc-500 font-semibold">
              <span>Повне актуальне меню закладу</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-[0.15em] text-zinc-950 mt-1">
              Меню «Крим &amp; Рим»
            </h2>
          </div>

          {/* Search & Quick Toggles */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук страви або інгредієнта..."
                className="w-full pl-10 pr-8 py-2.5 bg-white border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-900"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => setOnlyPopular(!onlyPopular)}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border transition inline-flex items-center gap-1.5 ${
                onlyPopular
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-zinc-700 border-stone-300 hover:border-zinc-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Хіти</span>
            </button>

            <button
              onClick={() => setOnlyWithPhoto(!onlyWithPhoto)}
              className={`px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider border transition inline-flex items-center gap-1.5 ${
                onlyWithPhoto
                  ? "bg-zinc-900 text-white border-zinc-900"
                  : "bg-white text-zinc-700 border-stone-300 hover:border-zinc-900"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>З фото</span>
            </button>
          </div>
        </div>

        {/* Macro Culinary Direction Filter Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-4">
          {[
            { id: "all", label: "Усе меню", count: menuItems.length },
            {
              id: "crimea",
              label: "🌙 Кухня Криму",
              count: menuItems.filter((i) =>
                categories
                  .filter((c) => c.culinary_group === "crimea")
                  .some((c) => c.slug === i.category_slug)
              ).length,
            },
            {
              id: "rome",
              label: "🏛️ Кухня Риму",
              count: menuItems.filter((i) =>
                categories
                  .filter((c) => c.culinary_group === "rome")
                  .some((c) => c.slug === i.category_slug)
              ).length,
            },
            {
              id: "grill",
              label: "🔥 На вугіллі",
              count: menuItems.filter((i) => i.category_slug === "grill").length,
            },
            {
              id: "kids",
              label: "🐱 Дитяче меню",
              count: menuItems.filter((i) => i.category_slug === "kids").length,
            },
            {
              id: "bar",
              label: "🍸 Бар & Напої",
              count: menuItems.filter((i) =>
                categories
                  .filter((c) => c.culinary_group === "bar")
                  .some((c) => c.slug === i.category_slug)
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveGroup(tab.id);
                setActiveCategorySlug("all");
              }}
              className={`px-3 py-3 text-xs font-bold uppercase tracking-wider border text-center transition flex items-center justify-center gap-1.5 ${
                activeGroup === tab.id
                  ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                  : "bg-white text-zinc-700 border-stone-300 hover:bg-stone-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  activeGroup === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-zinc-500"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Sticky Category Ribbon Selector */}
        <div className="sticky top-20 z-30 bg-[#F7F5F0]/95 backdrop-blur-md py-3 border-y border-stone-300 mb-8 -mx-4 px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategorySlug("all")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition ${
                activeCategorySlug === "all"
                  ? "bg-zinc-900 text-white"
                  : "bg-[#E2E4E6] text-zinc-800 hover:bg-stone-300"
              }`}
              style={{
                clipPath:
                  "polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)",
                paddingRight: "1.25rem",
              }}
            >
              Усі категорії ({visibleCategories.length})
            </button>

            {visibleCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() =>
                  setActiveCategorySlug(
                    activeCategorySlug === cat.slug ? "all" : cat.slug
                  )
                }
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition ${
                  activeCategorySlug === cat.slug
                    ? "bg-amber-700 text-white"
                    : cat.culinary_group === "kids"
                    ? "bg-[#1997A9] text-white hover:opacity-90"
                    : "bg-[#E2E4E6] text-zinc-900 hover:bg-stone-300"
                }`}
                style={{
                  clipPath:
                    "polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%)",
                  paddingRight: "1.25rem",
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Sheets Container */}
        {filteredCategoriesWithItems.length === 0 ? (
          <div className="bg-white border border-stone-200 p-12 text-center space-y-4">
            <p className="text-lg text-zinc-600">
              За вашим запитом не знайдено страв.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setOnlyPopular(false);
                setOnlyWithPhoto(false);
                setActiveGroup("all");
                setActiveCategorySlug("all");
              }}
              className="px-5 py-2.5 bg-zinc-900 text-white text-xs font-bold uppercase tracking-widest"
            >
              Скинути фільтри
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {filteredCategoriesWithItems.map(({ category, items }) => {
              // Special rendering for Kids Menu (Page 9 of PDF)
              if (category.culinary_group === "kids" || category.slug === "kids") {
                return (
                  <div
                    key={category.slug}
                    id={`cat-${category.slug}`}
                    className="bg-white border border-stone-200 shadow-md overflow-hidden relative p-6 sm:p-10"
                  >
                    {/* Kids Menu Ribbon Header matching PDF Page 9 */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                      <div
                        className="px-10 py-2.5 bg-[#1997A9] text-white text-lg sm:text-xl font-bold uppercase tracking-[0.3em] text-center"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%, 5% 50%)",
                        }}
                      >
                        {category.name}
                      </div>
                      <KidsMenuCatIllustration className="w-28 h-24 sm:w-36 sm:h-28 shrink-0" />
                    </div>

                    {/* Kids Menu Colored Quote Bars matching PDF Page 9 */}
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {items.map((item, idx) => {
                        const barColor =
                          item.badge_color === "yellow"
                            ? "bg-[#F6D046] text-zinc-950"
                            : item.badge_color === "coral"
                            ? "bg-[#DD5746] text-white"
                            : idx % 3 === 1
                            ? "bg-[#F6D046] text-zinc-950"
                            : idx % 3 === 2
                            ? "bg-[#DD5746] text-white"
                            : "bg-[#1997A9] text-white";

                        return (
                          <div key={item.id} className="group">
                            <div
                              className={`px-4 py-2 flex items-center justify-between gap-4 ${barColor}`}
                            >
                              <span className="text-base sm:text-lg font-medium tracking-wide">
                                {item.quote_badge || item.name}
                              </span>
                              <div className="flex items-baseline gap-2 sm:gap-4 shrink-0">
                                {item.weight && (
                                  <span className="text-xs sm:text-sm opacity-90 whitespace-nowrap">
                                    {item.weight}
                                  </span>
                                )}
                                <span className="text-base sm:text-xl font-bold whitespace-nowrap">
                                  {item.price}&nbsp;₴
                                </span>
                              </div>
                            </div>
                            <div className="pt-1.5 pb-2 px-4 bg-stone-50/70 border-x border-b border-stone-100">
                              <div className="text-sm font-bold uppercase tracking-wider text-zinc-900">
                                {item.name}
                              </div>
                              {item.description && (
                                <div className="text-xs sm:text-sm text-zinc-600 mt-0.5">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              // Standard Editorial PDF Page Sheet (Pages 3-8, 10-14)
              return (
                <div
                  key={category.slug}
                  id={`cat-${category.slug}`}
                  className="bg-white border border-stone-200/90 shadow-sm overflow-hidden"
                >
                  {/* Top Photographic Strip Banner (like top of each PDF page) */}
                  {category.banner_image && (
                    <div className="relative h-36 sm:h-48 w-full overflow-hidden border-b border-stone-200">
                      <img
                        src={category.banner_image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
                      <div className="absolute bottom-3 left-6 text-white">
                        <span className="text-[11px] uppercase tracking-[0.25em] text-amber-300 font-semibold">
                          {category.culinary_group === "crimea"
                            ? "Кримська традиція"
                            : category.culinary_group === "grill"
                            ? "Мангал & Хоспер"
                            : category.culinary_group === "bar"
                            ? "Барна карта"
                            : "Італійська традиція"}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 sm:p-10">
                    {/* PDF Grey Chevron Ribbon Category Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                      <div
                        className="inline-block bg-[#E2E4E6] text-zinc-950 px-6 py-2.5 pr-10 text-base sm:text-lg font-extrabold uppercase tracking-[0.28em]"
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, calc(100% - 14px) 50%, 100% 100%, 0 100%)",
                        }}
                      >
                        {category.name}
                      </div>
                      {category.subtitle && (
                        <span className="text-xs sm:text-sm text-zinc-500 italic">
                          {category.subtitle}
                        </span>
                      )}
                    </div>

                    {/* Two-Column PDF Layout with Center Vertical Divider */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 relative">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start gap-3.5 group py-1"
                        >
                          {/* Optional Dish Photo Thumbnail */}
                          {item.image_url && (
                            <button
                              onClick={() =>
                                setLightboxImage({
                                  url: item.image_url,
                                  title: item.name,
                                  subtitle: `${item.weight ? item.weight + " • " : ""}${item.price} ₴ — ${item.description}`,
                                })
                              }
                              className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 overflow-hidden border border-stone-200 bg-stone-100 relative group/img"
                              title="Натисніть, щоб збільшити фото страви"
                            >
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover/img:scale-110 transition duration-500"
                              />
                              <span className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition flex items-center justify-center">
                                <Eye className="w-4 h-4 text-white opacity-0 group-hover/img:opacity-100 transition" />
                              </span>
                            </button>
                          )}

                          {/* Dish Text & Dotted Price Leader */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {item.is_spicy && (
                                  <span
                                    title="Пікантна / гостра страва"
                                    className="inline-flex items-center text-orange-600"
                                  >
                                    <Flame className="w-4 h-4 fill-orange-500 text-orange-600 shrink-0" />
                                  </span>
                                )}
                                <h3 className="text-sm sm:text-[15px] font-bold uppercase tracking-wide text-zinc-950 leading-snug">
                                  {item.name}
                                </h3>
                                {item.weight && (
                                  <span className="text-xs font-normal text-zinc-500 whitespace-nowrap">
                                    ({item.weight})
                                  </span>
                                )}
                                {item.is_popular && (
                                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                                    ХІТ
                                  </span>
                                )}
                              </div>

                              {/* Dotted Leader Line from PDF */}
                              <div className="flex-1 border-b-2 border-dotted border-stone-300 mx-1 min-w-[20px] hidden sm:block" />

                              {/* Price */}
                              <div className="text-sm sm:text-base font-bold text-zinc-950 whitespace-nowrap shrink-0 text-right">
                                {item.price}&nbsp;
                                <span className="text-xs font-normal text-zinc-500">
                                  ₴
                                </span>
                              </div>
                            </div>

                            {item.description && (
                              <p className="text-xs sm:text-[13px] text-zinc-600 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PDF Footer Allergy Notice & Wi-Fi Password */}
        <div className="mt-10 p-6 bg-white border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-xs sm:text-sm text-zinc-600 italic">
            {settings.allergy_notice ||
              "* Якщо у вас є алергія на певні продукти — повідомте, будь ласка, офіціанта"}
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono uppercase tracking-widest bg-stone-100 px-3 py-1.5 border border-stone-200">
              <strong>WI-FI PASSWORD:</strong> {settings.wifi_password || "krymirome"}
            </span>
            <a
              href="/menu.pdf"
              target="_blank"
              className="text-xs font-bold uppercase tracking-wider underline hover:text-amber-700 whitespace-nowrap"
            >
              Завантажити PDF
            </a>
          </div>
        </div>
      </section>

      {/* ================= ATMOSPHERE & PHOTO GALLERY SECTION ================= */}
      <section id="gallery" className="py-14 bg-zinc-950 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold">
                Атмосфера закладу та подача
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider mt-1">
                Фотогалерея «Крим &amp; Рим»
              </h2>
            </div>

            {/* Gallery Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Усі фото" },
                { id: "interior", label: "Інтер'єр залів" },
                { id: "food", label: "Страви" },
                { id: "bar", label: "Бар & Коктейлі" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setGalleryTab(tab.id)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition ${
                    galleryTab === tab.id
                      ? "bg-white text-zinc-950 border-white"
                      : "bg-transparent text-stone-300 border-zinc-700 hover:border-stone-400"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredGallery.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() =>
                  setLightboxImage({
                    url: photo.image_url,
                    title: photo.title,
                  })
                }
                className={`group relative overflow-hidden bg-zinc-900 border border-zinc-800 cursor-pointer ${
                  index === 0 && galleryTab === "all"
                    ? "sm:col-span-2 sm:row-span-2 aspect-[16/10] sm:aspect-auto"
                    : "aspect-[4/3]"
                }`}
              >
                <img
                  src={photo.image_url}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition" />
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                    {photo.category === "interior"
                      ? "Інтер'єр"
                      : photo.category === "bar"
                      ? "Бар"
                      : "Кухня"}
                  </span>
                  <p className="text-xs sm:text-sm font-medium text-white line-clamp-2 mt-0.5">
                    {photo.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= GOOGLE MAPS REVIEWS SECTION ================= */}
      <section id="reviews" className="py-14 md:py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header & Official Google Maps Badge */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-stone-200">
            <div>
              <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-amber-800 font-bold">
                <span>Відгуки наших гостей</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-wider text-zinc-950 mt-1">
                Що кажуть на Google Картах
              </h2>
            </div>

            {/* Google Rating Summary Box */}
            <div className="flex flex-wrap items-center gap-5 bg-[#F8F6F1] p-4 sm:px-6 border border-stone-200">
              <div className="flex items-center gap-3">
                <div className="text-3xl sm:text-4xl font-extrabold text-zinc-950">
                  {settings.google_rating || "4.8"}
                </div>
                <div>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    На основі {settings.google_reviews_count || "288"}+ оцінок у Google
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-700 transition"
                >
                  <span>Всі відгуки на Картах</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Reviews Carousel: Horizontal Swipe on Mobile, Responsive Grid on Desktop */}
          <div className="relative mt-8">
            {/* Mobile swipe navigation bar */}
            <div className="flex md:hidden items-center justify-between gap-2 mb-3 px-1">
              <span className="text-xs text-zinc-500 font-medium inline-flex items-center gap-1.5">
                <span>👈</span>
                <span>Свайпайте відгуки вправо/вліво</span>
                <span>👉</span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollReviews("left")}
                  className="p-1.5 bg-white border border-stone-300 text-zinc-700 active:bg-stone-100 shadow-sm"
                  aria-label="Попередній відгук"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollReviews("right")}
                  className="p-1.5 bg-white border border-stone-300 text-zinc-700 active:bg-stone-100 shadow-sm"
                  aria-label="Наступний відгук"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              ref={reviewsScrollRef}
              className="flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto md:overflow-x-visible snap-x snap-mandatory no-scrollbar pb-3 -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="w-[84vw] max-w-[340px] md:w-auto shrink-0 snap-start bg-[#F8F6F1] border border-stone-200 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md transition"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {rev.author_avatar && rev.author_avatar.startsWith("http") ? (
                          <img
                            src={rev.author_avatar}
                            alt={rev.author_name}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {rev.author_avatar ||
                              rev.author_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-zinc-950 truncate">
                            {rev.author_name}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {rev.relative_time}
                          </div>
                        </div>
                      </div>

                      {/* Google 'G' emblem */}
                      <div
                        className="text-xs font-bold px-2 py-1 bg-white border border-stone-200 text-zinc-600 flex items-center gap-1 shrink-0"
                        title="Відгук з Google Maps"
                      >
                        <span className="text-blue-600 font-extrabold">G</span>
                        <span>Maps</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 mb-3">
                      {Array.from({ length: rev.rating || 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed line-clamp-6 sm:line-clamp-none">
                      «{rev.text}»
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-200/70 flex items-center justify-between text-[11px] text-zinc-400">
                    <span>Перевірений відгук</span>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-zinc-800 underline font-medium"
                    >
                      Google Карти ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTACTS, MAP & SISTER VENUES (PDF PAGE 16) ================= */}
      <section id="contacts" className="py-14 md:py-16 bg-[#F7F5F0]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Left Info Box */}
            <div className="lg:col-span-5 bg-white border border-stone-200 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <LogoDiamond size="sm" />
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-zinc-950">
                      Чекаємо в гості
                    </h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest">
                      Ресторан «Крим та Рим»
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                        Адреса
                      </div>
                      <div className="text-sm sm:text-base font-bold text-zinc-900">
                        {settings.address}
                      </div>
                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-amber-700 font-semibold underline mt-0.5 inline-block"
                      >
                        Прокласти маршрут у Google Maps →
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                        Графік роботи
                      </div>
                      <div className="text-sm sm:text-base font-bold text-zinc-900">
                        {settings.hours}
                      </div>
                      <div className="text-xs text-emerald-700 font-medium mt-0.5">
                        Працюємо під час відключень електроенергії (є генератор)
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-widest text-zinc-400 font-semibold">
                        Телефон для бронювання та замовлень з собою
                      </div>
                      <a
                        href={`tel:${(settings.phone || "+380931090103").replace(/[^\d+]/g, "")}`}
                        className="text-base sm:text-lg font-extrabold text-zinc-950 hover:text-amber-700"
                      >
                        {settings.phone || "+380 (93) 109-01-03"}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Sister Venues from PDF Page 16 ("НАШІ ЗАКЛАДИ:") */}
                <div className="pt-4 border-t border-stone-200">
                  <div className="text-xs font-extrabold uppercase tracking-[0.2em] text-zinc-900 mb-3">
                    Наші заклади в Instagram:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      settings.instagram_main || "kyrym_i_rym",
                      settings.instagram_2 || "amigosbarkyiv",
                      settings.instagram_3 || "barstoyanka",
                    ].map((handle) => (
                      <a
                        key={handle}
                        href={`https://www.instagram.com/${handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-zinc-900 hover:text-white text-xs font-bold uppercase tracking-wider transition border border-stone-200"
                      >
                        <Instagram className="w-3.5 h-3.5 text-pink-600" />
                        <span>{handle.toUpperCase()}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setBookingSuccess(false);
                  setBookingModalOpen(true);
                }}
                className="w-full py-4 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-700 transition"
              >
                Забронювати столик онлайн
              </button>
            </div>

            {/* Right Interactive Google Map */}
            <div className="lg:col-span-7 bg-stone-200 border border-stone-300 min-h-[380px] relative overflow-hidden group">
              <iframe
                title="Карта Ресторан Крим та Рим"
                src="https://www.google.com/maps?q=50.406378,30.656502&hl=uk&z=16&output=embed"
                className="w-full h-full min-h-[380px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <div className="absolute top-3 right-3 z-10">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-950/90 hover:bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm transition"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Відкрити у Google Maps ↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EXPANDED RICH FOOTER ================= */}
      <footer className="bg-zinc-950 text-stone-300 pt-14 pb-12 border-t border-zinc-800 text-xs">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-zinc-800/80">
            {/* Column 1: Brand & Identity (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="flex items-center gap-3">
                <LogoDiamond size="sm" />
                <div>
                  <span className="text-base font-extrabold uppercase tracking-[0.25em] text-white block">
                    КРИМ &amp; РИМ
                  </span>
                  <span className="text-[11px] text-zinc-400 uppercase tracking-widest">
                    Ресторан кримськотатарської та італійської кухні
                  </span>
                </div>
              </div>

              <p className="text-stone-400 text-xs sm:text-[13px] leading-relaxed pr-2">
                Дві великі гастрономічні культури під одним дахом у Києві на
                Харківському масиві. Соковитий мангал, чебуреки, янтики та шурпа
                поруч зі справжньою неаполітанською піцою з дров&apos;яної печі,
                пастою та авторським баром.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[11px] text-amber-300">
                  <Flame className="w-3 h-3 text-amber-500" /> Дров&apos;яна піч
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[11px] text-stone-300">
                  Мангал &amp; Хоспер
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[11px] text-emerald-300">
                  <Zap className="w-3 h-3" /> Генератор
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[11px] text-amber-200">
                  <PawPrint className="w-3 h-3" /> Pet-friendly
                </span>
              </div>
            </div>

            {/* Column 2: Меню та Кухня (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Меню ресторану
              </h4>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <a href="#cat-pizza" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🍕</span>
                    <span>Піца з дров&apos;яної печі (14 видів)</span>
                  </a>
                </li>
                <li>
                  <a href="#cat-grill" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🍢</span>
                    <span>Мангал-меню (шашлик, люля-кебаб)</span>
                  </a>
                </li>
                <li>
                  <a href="#cat-pasta" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🍝</span>
                    <span>Домашня паста та равіолі</span>
                  </a>
                </li>
                <li>
                  <a href="#cat-appetizers-crimea" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🥟</span>
                    <span>Чебуреки, янтики та мезе</span>
                  </a>
                </li>
                <li>
                  <a href="#cat-soups-crimea" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🍲</span>
                    <span>Кримський лагман і шурпа</span>
                  </a>
                </li>
                <li>
                  <a href="#cat-cocktails-short" className="hover:text-amber-400 transition flex items-center gap-1.5">
                    <span>🍸</span>
                    <span>Крафтовий бар та настоянки</span>
                  </a>
                </li>
                <li className="pt-1">
                  <a
                    href="/menu.pdf"
                    target="_blank"
                    className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-semibold underline"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Завантажити повне PDF-меню</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 3: Гостям та Сервіс (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Гостям
              </h4>
              <ul className="space-y-2 text-stone-400">
                <li>
                  <button
                    onClick={() => {
                      setBookingSuccess(false);
                      setBookingModalOpen(true);
                    }}
                    className="text-amber-400 hover:text-amber-300 font-medium transition text-left"
                  >
                    Забронювати стіл онлайн →
                  </button>
                </li>
                <li>
                  <a href="#reviews" className="hover:text-white transition">
                    Відгуки Google ({settings.google_rating || "4.8"} ★)
                  </a>
                </li>
                <li>
                  <a href="#concept" className="hover:text-white transition">
                    Зали «Крим» та «Рим»
                  </a>
                </li>
                <li>
                  <span className="text-zinc-500 block text-[11px]">
                    Знижка -20% у будні 11–15
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 block text-[11px]">
                    Знижка -15% на піцу з собою
                  </span>
                </li>
                <li className="pt-1">
                  <button
                    onClick={handleCopyWifi}
                    className="inline-flex items-center gap-1 text-stone-400 hover:text-white transition text-[11px]"
                  >
                    <Wifi className="w-3 h-3 text-amber-400" />
                    <span>Wi-Fi: <strong className="font-mono text-white">{settings.wifi_password || "krymirome"}</strong></span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Контакти та Мережа (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white">
                Контакти та локація
              </h4>
              <div className="space-y-2 text-stone-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <a
                      href={googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-amber-300 transition font-medium"
                    >
                      {settings.address} ↗
                    </a>
                    <span className="text-[11px] text-zinc-500 block">
                      м. Харківська, Київ
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{settings.hours}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <a
                    href={`tel:${(settings.phone || "+380931090103").replace(/[^\d+]/g, "")}`}
                    className="text-white hover:text-amber-300 font-bold"
                  >
                    {settings.phone || "+380 (93) 109-01-03"}
                  </a>
                </div>

                <div className="pt-2">
                  <div className="text-[11px] uppercase tracking-wider text-zinc-400 font-bold mb-1.5">
                    Наші заклади в Instagram:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { handle: settings.instagram_main || "kyrym_i_rym", label: "КРИМ & РИМ" },
                      { handle: settings.instagram_2 || "amigosbarkyiv", label: "AMIGOS" },
                      { handle: settings.instagram_3 || "barstoyanka", label: "СТОЯНКА" },
                    ].map((item) => (
                      <a
                        key={item.handle}
                        href={`https://www.instagram.com/${item.handle.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] font-bold text-stone-300 hover:text-white transition border border-zinc-800"
                      >
                        <Instagram className="w-3 h-3 text-pink-500" />
                        <span>{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-zinc-500 text-xs">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span>© 2026 КРИМ &amp; РИМ. Всі права захищено.</span>
            </div>

            <div className="flex items-center gap-4 text-center sm:text-right">
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-stone-300 transition inline-flex items-center gap-1"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                <span>Google Карти</span>
              </a>
              <span>•</span>
              <span className="text-zinc-600">м. Київ, вул. Братства Тарасівців, 3</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ================= MOBILE FLOATING ACTION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-zinc-950 text-white border-t border-zinc-800 grid grid-cols-3 divide-x divide-zinc-800 shadow-2xl">
        <a
          href="#menu"
          className="py-3 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider active:bg-zinc-800"
        >
          <Utensils className="w-4 h-4 text-amber-400" />
          <span>Меню</span>
        </a>
        <a
          href={`tel:${(settings.phone || "+380931090103").replace(/[^\d+]/g, "")}`}
          className="py-3 flex flex-col items-center justify-center gap-1 text-[11px] font-semibold uppercase tracking-wider active:bg-zinc-800"
        >
          <Phone className="w-4 h-4 text-emerald-400" />
          <span>Подзвонити</span>
        </a>
        <button
          onClick={() => {
            setBookingSuccess(false);
            setBookingModalOpen(true);
          }}
          className="py-3 flex flex-col items-center justify-center gap-1 text-[11px] font-bold uppercase tracking-wider bg-amber-700 text-white"
        >
          <Calendar className="w-4 h-4" />
          <span>Стіл</span>
        </button>
      </div>

      {/* ================= IMAGE LIGHTBOX MODAL ================= */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/70 text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.title}
              className="w-full max-h-[75vh] object-contain bg-black"
            />
            <div className="p-4 text-white">
              <h4 className="text-base font-bold uppercase tracking-wider">
                {lightboxImage.title}
              </h4>
              {lightboxImage.subtitle && (
                <p className="text-xs text-stone-300 mt-1">
                  {lightboxImage.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TABLE RESERVATION MODAL ================= */}
      {bookingModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain"
          onClick={() => setBookingModalOpen(false)}
        >
          <div
            className="bg-white border-2 border-zinc-950 max-w-lg w-full p-5 sm:p-8 relative shadow-2xl my-auto max-h-[92dvh] overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setBookingModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-950"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <LogoDiamond size="sm" />
              <div>
                <h3 className="text-xl font-bold uppercase tracking-wider text-zinc-950">
                  Бронювання столика
                </h3>
                <p className="text-xs text-zinc-500">
                  вул. Братства Тарасівців, 3 • Щодня 12:00–22:00
                </p>
              </div>
            </div>

            {bookingSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold uppercase tracking-wider">
                  Заявку прийнято!
                </h4>
                <p className="text-sm text-zinc-600">
                  Дякуємо, <strong>{bookingForm.customer_name}</strong>! Ми
                  отримали ваше бронювання на{" "}
                  <strong>
                    {bookingForm.reservation_date} о {bookingForm.reservation_time}
                  </strong>{" "}
                  ({bookingForm.guests_count} гостей) і зв’яжемося з вами для
                  підтвердження.
                </p>
                <button
                  onClick={() => setBookingModalOpen(false)}
                  className="px-6 py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest"
                >
                  Чудово
                </button>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit} className="space-y-4">
                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                    {bookingError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Ваше ім&apos;я *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.customer_name}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, customer_name: e.target.value })
                      }
                      placeholder="Олександр"
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.customer_phone}
                      onChange={(e) =>
                        setBookingForm({ ...bookingForm, customer_phone: e.target.value })
                      }
                      placeholder="+380 (93) 000-00-00"
                      className="w-full px-3.5 py-2.5 border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Дата *
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.reservation_date}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          reservation_date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Час *
                    </label>
                    <input
                      type="time"
                      required
                      value={bookingForm.reservation_time}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          reservation_time: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-950"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                      Гостей
                    </label>
                    <select
                      value={bookingForm.guests_count}
                      onChange={(e) =>
                        setBookingForm({
                          ...bookingForm,
                          guests_count: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2.5 border border-stone-300 text-base md:text-sm bg-white focus:outline-none focus:border-zinc-950"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((n) => (
                        <option key={n} value={n}>
                          {n} {n === 1 ? "гість" : n < 5 ? "гості" : "гостей"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Бажана зала
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "crimea", label: "🌙 Зала Крим" },
                      { id: "rome", label: "🏛️ Зала Рим" },
                      { id: "any", label: "✨ Будь-яка" },
                    ].map((h) => (
                      <button
                        type="button"
                        key={h.id}
                        onClick={() =>
                          setBookingForm({ ...bookingForm, hall_preference: h.id })
                        }
                        className={`py-2 px-2 text-xs font-bold uppercase border transition ${
                          bookingForm.hall_preference === h.id
                            ? "bg-zinc-950 text-white border-zinc-950"
                            : "bg-stone-50 text-zinc-700 border-stone-300"
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Побажання (дитяче крісло, з песиком, іменини тощо)
                  </label>
                  <textarea
                    rows={2}
                    value={bookingForm.comment}
                    onChange={(e) =>
                      setBookingForm({ ...bookingForm, comment: e.target.value })
                    }
                    placeholder="Наприклад: столик біля вікна, прийдемо з коргі 🐾"
                    className="w-full px-3.5 py-2 border border-stone-300 text-base md:text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <button
                  type="submit"
                  disabled={bookingSubmitting}
                  className="w-full py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-700 transition disabled:opacity-50"
                >
                  {bookingSubmitting ? "Відправка..." : "Підтвердити бронювання"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

