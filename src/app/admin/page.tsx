"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Edit3,
  Upload,
  RefreshCw,
  Check,
  X,
  Search,
  Star,
  Flame,
  Eye,
  EyeOff,
  ArrowLeft,
  Save,
  Utensils,
  Image as ImageIcon,
  MessageSquare,
  Calendar,
  Settings as SettingsIcon,
  FolderKanban,
  Lock,
  LogOut,
} from "lucide-react";
import { LogoDiamond } from "@/components/LogoDiamond";
import type {
  Category,
  MenuItem,
  GalleryPhoto,
  Review,
} from "@/components/RestaurantClient";

interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  guests_count: number;
  reservation_date: string;
  reservation_time: string;
  hall_preference: string;
  comment: string;
  status: string;
  created_at: string;
}

export default function AdminPage() {
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  const [activeTab, setActiveTab] = useState<
    "menu" | "categories" | "gallery" | "reviews" | "bookings" | "settings"
  >("menu");

  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [gallery, setGallery] = useState<GalleryPhoto[]>([]);
  const [reviews, setReviews] = useState<(Review & { is_visible?: boolean })[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Toast feedback
  const [toast, setToast] = useState<string>("");
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  };

  // Menu Filter & Modal State
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>("all");
  const [menuSearch, setMenuSearch] = useState<string>("");
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Category Modal State
  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);

  // Gallery Form State
  const [newGalleryPhoto, setNewGalleryPhoto] = useState({
    title: "",
    category: "food",
    image_url: "",
  });

  // Review Form & Sync State
  const [syncingReviews, setSyncingReviews] = useState<boolean>(false);
  const [newReview, setNewReview] = useState({
    author_name: "",
    rating: 5,
    relative_time: "нещодавно",
    text: "",
  });

  const fetchAllData = useCallback(async (pwd?: string) => {
    setLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (pwd) headers["x-admin-password"] = pwd;
      const res = await fetch("/api/site", { headers, cache: "no-store" });
      const data = await res.json();

      setCategories(data.categories || []);
      setMenuItems(data.menuItems || []);
      setGallery(data.gallery || []);
      setReviews(data.reviews || []);
      setReservations(data.reservations || []);
      setSettings(data.settings || {});

      if (data.isAdmin) {
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.error("Load admin data error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedPwd = localStorage.getItem("krimirim_admin_pwd") || "";
    if (savedPwd) setAdminPassword(savedPwd);
    fetchAllData(savedPwd);
  }, [fetchAllData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setLoginError(data.error || "Невірний пароль");
        return;
      }
      localStorage.setItem("krimirim_admin_pwd", adminPassword);
      setIsAuthenticated(true);
      fetchAllData(adminPassword);
    } catch {
      setLoginError("Помилка з'єднання з сервером");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("krimirim_admin_pwd");
    document.cookie = "krimirim_admin=; Max-Age=0; path=/";
    setIsAuthenticated(false);
    setAdminPassword("");
  };

  const adminHeaders = () => ({
    "Content-Type": "application/json",
    "x-admin-password":
      adminPassword || localStorage.getItem("krimirim_admin_pwd") || "krymirome",
  });

  // Upload file helper
  const handleFileUpload = async (
    file: File,
    onSuccess: (url: string) => void
  ) => {
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-admin-password":
            adminPassword ||
            localStorage.getItem("krimirim_admin_pwd") ||
            "krymirome",
        },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload error");
      onSuccess(data.url);
      showToast("Зображення завантажено!");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Помилка завантаження файлу");
    } finally {
      setUploadingImage(false);
    }
  };

  // Save Menu Item
  const handleSaveMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const isUpdate = Boolean(editingItem.id);
    const res = await fetch("/api/menu", {
      method: isUpdate ? "PUT" : "POST",
      headers: adminHeaders(),
      body: JSON.stringify(editingItem),
    });

    if (res.ok) {
      showToast(isUpdate ? "Страву оновлено!" : "Нову страву додано!");
      setEditingItem(null);
      fetchAllData(adminPassword);
    } else {
      const err = await res.json();
      alert(err.error || "Помилка збереження");
    }
  };

  const handleDeleteMenuItem = async (id: number, name: string) => {
    if (!confirm(`Видалити страву «${name}»?`)) return;
    const res = await fetch(`/api/menu?id=${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (res.ok) {
      showToast("Страву видалено");
      fetchAllData(adminPassword);
    }
  };

  // Save Category
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const isUpdate = Boolean(editingCategory.id);
    const res = await fetch("/api/categories", {
      method: isUpdate ? "PUT" : "POST",
      headers: adminHeaders(),
      body: JSON.stringify(editingCategory),
    });

    if (res.ok) {
      showToast(isUpdate ? "Категорію оновлено!" : "Категорію створено!");
      setEditingCategory(null);
      fetchAllData(adminPassword);
    }
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (
      !confirm(
        `Видалити категорію «${name}» та всі страви в ній? Цю дію не можна скасувати.`
      )
    )
      return;
    const res = await fetch(`/api/categories?id=${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (res.ok) {
      showToast("Категорію видалено");
      fetchAllData(adminPassword);
    }
  };

  // Add Gallery Photo
  const handleAddGalleryPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalleryPhoto.image_url) {
      alert("Спочатку завантажте або вкажіть URL зображення");
      return;
    }
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(newGalleryPhoto),
    });
    if (res.ok) {
      showToast("Фото додано в галерею!");
      setNewGalleryPhoto({ title: "", category: "food", image_url: "" });
      fetchAllData(adminPassword);
    }
  };

  const handleDeleteGalleryPhoto = async (id: number) => {
    if (!confirm("Видалити це фото з галереї?")) return;
    const res = await fetch(`/api/gallery?id=${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    if (res.ok) {
      showToast("Фото видалено");
      fetchAllData(adminPassword);
    }
  };

  // Sync Google Maps Reviews
  const handleSyncGoogleReviews = async () => {
    setSyncingReviews(true);
    try {
      const res = await fetch("/api/reviews/sync", {
        method: "POST",
        headers: adminHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          `Синхронізовано з Google Maps! Всього відгуків: ${data.totalReviews}`
        );
        fetchAllData(adminPassword);
      } else {
        alert(data.error || "Помилка синхронізації");
      }
    } finally {
      setSyncingReviews(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(newReview),
    });
    if (res.ok) {
      showToast("Відгук додано!");
      setNewReview({
        author_name: "",
        rating: 5,
        relative_time: "нещодавно",
        text: "",
      });
      fetchAllData(adminPassword);
    }
  };

  const handleToggleReviewVisibility = async (
    rev: Review & { is_visible?: boolean }
  ) => {
    await fetch("/api/reviews", {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({
        ...rev,
        is_visible: rev.is_visible === false ? true : false,
      }),
    });
    fetchAllData(adminPassword);
  };

  const handleDeleteReview = async (id: number) => {
    if (!confirm("Видалити цей відгук?")) return;
    await fetch(`/api/reviews?id=${id}`, {
      method: "DELETE",
      headers: adminHeaders(),
    });
    showToast("Відгук видалено");
    fetchAllData(adminPassword);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: adminHeaders(),
      body: JSON.stringify({ settings }),
    });
    if (res.ok) {
      showToast("Налаштування закладу збережено!");
    }
  };

  const filteredAdminItems = menuItems.filter((item) => {
    if (
      selectedCatFilter !== "all" &&
      item.category_slug !== selectedCatFilter
    ) {
      return false;
    }
    if (menuSearch.trim()) {
      const q = menuSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description || "").toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Login Screen
  if (!isAuthenticated && !loading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-zinc-950 max-w-md w-full p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-6">
            <LogoDiamond size="md" />
            <h1 className="text-2xl font-bold uppercase tracking-widest text-zinc-950 mt-4">
              Адмін-панель
            </h1>
            <p className="text-xs text-zinc-500 mt-1">
              Керування меню, фотографіями та відгуками «Крим &amp; Рим»
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-xs text-red-700">
                {loginError}
              </div>
            )}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Пароль адміністратора
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Введіть пароль (за замовчуванням: krymirome)"
                  className="w-full pl-10 pr-4 py-3 border border-stone-300 text-sm focus:outline-none focus:border-zinc-950"
                />
              </div>
              <p className="text-[11px] text-zinc-400 mt-1.5">
                Підказка: стандартний пароль —{" "}
                <code className="bg-stone-100 px-1.5 py-0.5 text-zinc-700 font-mono">
                  krymirome
                </code>
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-[0.2em] hover:bg-amber-700 transition"
            >
              Увійти в адмінку
            </button>

            <div className="pt-3 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Повернутися на сайт
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F2ED] text-zinc-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-950 text-white px-5 py-3 shadow-2xl border-l-4 border-amber-500 flex items-center gap-2 text-sm font-medium">
          <Check className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="bg-zinc-950 text-white border-b border-zinc-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold uppercase tracking-wider transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>На сайт</span>
            </Link>
            <span className="text-sm sm:text-base font-bold uppercase tracking-widest">
              КРИМ &amp; РИМ • Адмінка
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-stone-400">
              PostgreSQL • Активно ({menuItems.length} позицій меню)
            </span>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-red-900/60 border border-zinc-700 text-xs uppercase tracking-wider"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Вийти</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-stone-300">
          {[
            {
              id: "menu",
              label: `Страви меню (${menuItems.length})`,
              icon: Utensils,
            },
            {
              id: "categories",
              label: `Категорії (${categories.length})`,
              icon: FolderKanban,
            },
            {
              id: "gallery",
              label: `Фотогалерея (${gallery.length})`,
              icon: ImageIcon,
            },
            {
              id: "reviews",
              label: `Відгуки Google (${reviews.length})`,
              icon: MessageSquare,
            },
            {
              id: "bookings",
              label: `Бронювання (${reservations.length})`,
              icon: Calendar,
            },
            {
              id: "settings",
              label: "Контакти & Налаштування",
              icon: SettingsIcon,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-2.5 text-xs font-bold uppercase tracking-wider border whitespace-nowrap inline-flex items-center gap-2 transition ${
                  activeTab === tab.id
                    ? "bg-zinc-950 text-white border-zinc-950 shadow-sm"
                    : "bg-white text-zinc-700 border-stone-300 hover:bg-stone-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ================= TAB 1: MENU ITEMS ================= */}
        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="bg-white border border-stone-200 p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                    placeholder="Пошук страви за назвою або складом..."
                    className="w-full pl-9 pr-4 py-2 border border-stone-300 text-sm focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <select
                  value={selectedCatFilter}
                  onChange={(e) => setSelectedCatFilter(e.target.value)}
                  className="px-3 py-2 border border-stone-300 text-sm bg-white focus:outline-none focus:border-zinc-950"
                >
                  <option value="all">Усі категорії ({menuItems.length})</option>
                  {categories.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() =>
                  setEditingItem({
                    category_slug:
                      selectedCatFilter !== "all"
                        ? selectedCatFilter
                        : categories[0]?.slug || "salads-rome",
                    name: "",
                    price: "",
                    weight: "",
                    description: "",
                    image_url: "",
                    is_spicy: false,
                    is_popular: false,
                    is_available: true,
                    sort_order: 10,
                  })
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold uppercase tracking-wider transition"
              >
                <Plus className="w-4 h-4" />
                <span>Додати страву</span>
              </button>
            </div>

            {/* Items Table / Cards */}
            <div className="bg-white border border-stone-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                      <th className="py-3 px-4">Фото</th>
                      <th className="py-3 px-4">Назва та склад</th>
                      <th className="py-3 px-4">Категорія</th>
                      <th className="py-3 px-4">Вага/Об&apos;єм</th>
                      <th className="py-3 px-4">Ціна (₴)</th>
                      <th className="py-3 px-4">Позначки</th>
                      <th className="py-3 px-4 text-right">Дії</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200 text-sm">
                    {filteredAdminItems.map((item) => {
                      const cat = categories.find(
                        (c) => c.slug === item.category_slug
                      );
                      return (
                        <tr
                          key={item.id}
                          className={`hover:bg-stone-50 ${
                            !item.is_available ? "opacity-50 bg-stone-50" : ""
                          }`}
                        >
                          <td className="py-3 px-4 w-16">
                            {item.image_url ? (
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-12 h-12 object-cover border border-stone-200"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-stone-100 border border-stone-200 flex items-center justify-center text-[10px] text-zinc-400">
                                Без фото
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 max-w-md">
                            {item.quote_badge && (
                              <span className="inline-block px-2 py-0.5 bg-teal-100 text-teal-900 text-[10px] font-bold mb-1">
                                «{item.quote_badge}»
                              </span>
                            )}
                            <div className="font-bold text-zinc-900 uppercase">
                              {item.name}
                            </div>
                            {item.description && (
                              <div className="text-xs text-zinc-500 line-clamp-2 mt-0.5">
                                {item.description}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs font-medium text-zinc-700 whitespace-nowrap">
                            {cat?.name || item.category_slug}
                          </td>
                          <td className="py-3 px-4 text-xs text-zinc-600 whitespace-nowrap">
                            {item.weight || "—"}
                          </td>
                          <td className="py-3 px-4 font-bold text-zinc-950 whitespace-nowrap">
                            {item.price} ₴
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              {item.is_popular && (
                                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase">
                                  ХІТ
                                </span>
                              )}
                              {item.is_spicy && (
                                <Flame className="w-4 h-4 text-orange-600 fill-orange-500" />
                              )}
                              {!item.is_available && (
                                <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase">
                                  Приховано
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1">
                              <button
                                onClick={() => setEditingItem({ ...item })}
                                className="p-2 text-zinc-600 hover:text-zinc-950 hover:bg-stone-200 transition"
                                title="Редагувати"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteMenuItem(item.id, item.name)
                                }
                                className="p-2 text-red-600 hover:bg-red-50 transition"
                                title="Видалити"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: CATEGORIES ================= */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between bg-white p-4 sm:p-6 border border-stone-200">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-wider">
                  Категорії меню
                </h2>
                <p className="text-xs text-zinc-500">
                  Редагуйте назви розділів, банерні фотографії та порядок відображення
                </p>
              </div>
              <button
                onClick={() =>
                  setEditingCategory({
                    name: "",
                    subtitle: "",
                    culinary_group: "rome",
                    banner_image: "",
                    sort_order: categories.length + 1,
                    is_visible: true,
                  })
                }
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-wider"
              >
                <Plus className="w-4 h-4" />
                <span>Нова категорія</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="bg-white border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    {cat.banner_image ? (
                      <div className="h-28 w-full overflow-hidden bg-stone-100 relative">
                        <img
                          src={cat.banner_image}
                          alt={cat.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-14 bg-stone-100 border-b border-stone-200 flex items-center px-4 text-xs text-zinc-400">
                        Без верхнього фото-банера
                      </div>
                    )}
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-stone-100 text-zinc-700">
                          Група: {cat.culinary_group.toUpperCase()} • Порядок: #{cat.sort_order}
                        </span>
                        {!cat.is_visible && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 font-bold">
                            Приховано
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold uppercase tracking-wider mt-2">
                        {cat.name}
                      </h3>
                      {cat.subtitle && (
                        <p className="text-xs text-zinc-500 mt-1">{cat.subtitle}</p>
                      )}
                    </div>
                  </div>

                  <div className="px-4 py-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
                    <button
                      onClick={() => setEditingCategory({ ...cat })}
                      className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-800 hover:text-amber-700"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Редагувати
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: PHOTO GALLERY & MEDIA UPLOAD ================= */}
        {activeTab === "gallery" && (
          <div className="space-y-8">
            {/* Add New Photo Form */}
            <form
              onSubmit={handleAddGalleryPhoto}
              className="bg-white border border-stone-200 p-6 space-y-4"
            >
              <h3 className="text-base font-bold uppercase tracking-wider">
                Додати нову фотографію в галерею сайту
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Підпис / Назва фото
                  </label>
                  <input
                    type="text"
                    required
                    value={newGalleryPhoto.title}
                    onChange={(e) =>
                      setNewGalleryPhoto({
                        ...newGalleryPhoto,
                        title: e.target.value,
                      })
                    }
                    placeholder="Наприклад: Зала Крим або Піца з печі"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Розділ галереї
                  </label>
                  <select
                    value={newGalleryPhoto.category}
                    onChange={(e) =>
                      setNewGalleryPhoto({
                        ...newGalleryPhoto,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm bg-white"
                  >
                    <option value="interior">Інтер&apos;єр залів</option>
                    <option value="food">Страви кухні</option>
                    <option value="bar">Бар та коктейлі</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Зображення (завантажити файл або URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGalleryPhoto.image_url}
                      onChange={(e) =>
                        setNewGalleryPhoto({
                          ...newGalleryPhoto,
                          image_url: e.target.value,
                        })
                      }
                      placeholder="/images/..."
                      className="flex-1 px-3 py-2 border border-stone-300 text-sm"
                    />
                    <label className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{uploadingImage ? "..." : "Файл"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            handleFileUpload(f, (url) =>
                              setNewGalleryPhoto((prev) => ({
                                ...prev,
                                image_url: url,
                              }))
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition"
              >
                Додати фото в галерею
              </button>
            </form>

            {/* Gallery Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {gallery.map((photo) => (
                <div
                  key={photo.id}
                  className="bg-white border border-stone-200 overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-stone-100 relative">
                    <img
                      src={photo.image_url}
                      alt={photo.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 bg-black/75 text-white text-[10px] font-bold uppercase px-2 py-0.5">
                      {photo.category}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-zinc-800 line-clamp-2">
                      {photo.title}
                    </span>
                    <button
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 shrink-0"
                      title="Видалити фото"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: GOOGLE MAPS REVIEWS ================= */}
        {activeTab === "reviews" && (
          <div className="space-y-8">
            {/* Sync Box */}
            <div className="bg-white border border-stone-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-amber-800">
                  <span>Інтеграція з Google Картами</span>
                </div>
                <h3 className="text-lg font-bold uppercase tracking-wider">
                  Парсинг та синхронізація останніх відгуків
                </h3>
                <p className="text-xs text-zinc-600 max-w-2xl">
                  Натисніть кнопку нижче, щоб підтягнути останні відгуки та
                  актуальний рейтинг закладу «Ресторан Крим та Рим» з Google
                  Maps. Ви також можете додати офіційний ключ{" "}
                  <code>GOOGLE_PLACES_API_KEY</code> у вкладці «Налаштування» або
                  модерувати відгуки вручну.
                </p>
                {settings.last_reviews_sync && (
                  <p className="text-[11px] text-zinc-400">
                    Остання синхронізація: {settings.last_reviews_sync}
                  </p>
                )}
              </div>

              <button
                onClick={handleSyncGoogleReviews}
                disabled={syncingReviews}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition shrink-0 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${syncingReviews ? "animate-spin" : ""}`}
                />
                <span>
                  {syncingReviews
                    ? "Синхронізація..."
                    : "Підтягнути з Google Maps"}
                </span>
              </button>
            </div>

            {/* Add Review Manually */}
            <form
              onSubmit={handleAddReview}
              className="bg-white border border-stone-200 p-6 space-y-4"
            >
              <h4 className="text-sm font-bold uppercase tracking-wider">
                Додати відгук гостя вручну
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  required
                  value={newReview.author_name}
                  onChange={(e) =>
                    setNewReview({ ...newReview, author_name: e.target.value })
                  }
                  placeholder="Ім'я гостя (напр. Олена К.)"
                  className="px-3 py-2 border border-stone-300 text-sm"
                />
                <input
                  type="text"
                  value={newReview.relative_time}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      relative_time: e.target.value,
                    })
                  }
                  placeholder="Час (напр. тиждень тому)"
                  className="px-3 py-2 border border-stone-300 text-sm"
                />
                <select
                  value={newReview.rating}
                  onChange={(e) =>
                    setNewReview({
                      ...newReview,
                      rating: Number(e.target.value),
                    })
                  }
                  className="px-3 py-2 border border-stone-300 text-sm bg-white"
                >
                  <option value={5}>5 зірок ★★★★★</option>
                  <option value={4}>4 зірки ★★★★</option>
                  <option value={3}>3 зірки ★★★</option>
                </select>
              </div>
              <textarea
                rows={2}
                required
                value={newReview.text}
                onChange={(e) =>
                  setNewReview({ ...newReview, text: e.target.value })
                }
                placeholder="Текст відгуку..."
                className="w-full px-3 py-2 border border-stone-300 text-sm"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-amber-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                Додати відгук
              </button>
            </form>

            {/* Reviews List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className={`bg-white border border-stone-200 p-5 flex flex-col justify-between ${
                    rev.is_visible === false ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="font-bold text-sm">
                        {rev.author_name}{" "}
                        <span className="text-xs font-normal text-zinc-400">
                          • {rev.relative_time}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className="w-3.5 h-3.5 fill-amber-400 text-amber-400"
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      «{rev.text}»
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100">
                    <button
                      onClick={() => handleToggleReviewVisibility(rev)}
                      className="inline-flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-950"
                    >
                      {rev.is_visible === false ? (
                        <>
                          <EyeOff className="w-3.5 h-3.5" /> Приховано (Показати)
                        </>
                      ) : (
                        <>
                          <Eye className="w-3.5 h-3.5 text-emerald-600" /> Видимий на сайті
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      Видалити
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 5: BOOKINGS / RESERVATIONS ================= */}
        {activeTab === "bookings" && (
          <div className="bg-white border border-stone-200 p-6">
            <h3 className="text-lg font-bold uppercase tracking-wider mb-4">
              Заявки на бронювання столиків
            </h3>
            {reservations.length === 0 ? (
              <p className="text-sm text-zinc-500 py-8 text-center">
                Поки що немає нових онлайн-заявок на бронювання.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-stone-100 border-b border-stone-200 text-xs uppercase text-zinc-600">
                      <th className="py-3 px-4">Гість</th>
                      <th className="py-3 px-4">Телефон</th>
                      <th className="py-3 px-4">Дата та Час</th>
                      <th className="py-3 px-4">Гостей / Зала</th>
                      <th className="py-3 px-4">Коментар</th>
                      <th className="py-3 px-4">Статус</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {reservations.map((b) => (
                      <tr key={b.id}>
                        <td className="py-3 px-4 font-bold">{b.customer_name}</td>
                        <td className="py-3 px-4">
                          <a
                            href={`tel:${b.customer_phone}`}
                            className="text-amber-700 font-semibold underline"
                          >
                            {b.customer_phone}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          {b.reservation_date} о <strong>{b.reservation_time}</strong>
                        </td>
                        <td className="py-3 px-4">
                          {b.guests_count} ос. •{" "}
                          <span className="uppercase text-xs font-bold">
                            {b.hall_preference === "crimea"
                              ? "Зала Крим"
                              : b.hall_preference === "rome"
                              ? "Зала Рим"
                              : "Будь-яка"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs text-zinc-600">
                          {b.comment || "—"}
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={b.status}
                            onChange={async (e) => {
                              await fetch("/api/reservations", {
                                method: "PUT",
                                headers: adminHeaders(),
                                body: JSON.stringify({
                                  id: b.id,
                                  status: e.target.value,
                                }),
                              });
                              fetchAllData(adminPassword);
                            }}
                            className="px-2.5 py-1 border border-stone-300 text-xs font-bold uppercase bg-white"
                          >
                            <option value="new">🔥 Нова</option>
                            <option value="confirmed">✅ Підтверджено</option>
                            <option value="cancelled">❌ Скасовано</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 6: SETTINGS ================= */}
        {activeTab === "settings" && (
          <form
            onSubmit={handleSaveSettings}
            className="bg-white border border-stone-200 p-6 sm:p-8 space-y-6 max-w-4xl"
          >
            <h3 className="text-lg font-bold uppercase tracking-wider border-b border-stone-200 pb-3">
              Основні налаштування закладу та інтеграцій
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Назва ресторану
                </label>
                <input
                  type="text"
                  value={settings.restaurant_name || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, restaurant_name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Телефон
                </label>
                <input
                  type="text"
                  value={settings.phone || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Адреса
                </label>
                <input
                  type="text"
                  value={settings.address || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Графік роботи
                </label>
                <input
                  type="text"
                  value={settings.hours || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, hours: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Пароль Wi-Fi (з меню)
                </label>
                <input
                  type="text"
                  value={settings.wifi_password || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, wifi_password: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Рейтинг Google Maps / Кількість відгуків
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={settings.google_rating || "4.8"}
                    onChange={(e) =>
                      setSettings({ ...settings, google_rating: e.target.value })
                    }
                    placeholder="4.8"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                  <input
                    type="text"
                    value={settings.google_reviews_count || "288"}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        google_reviews_count: e.target.value,
                      })
                    }
                    placeholder="288"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                Google Places API Key (опціонально для офіційного API відгуків)
              </label>
              <input
                type="password"
                value={settings.google_places_api_key || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    google_places_api_key: e.target.value,
                  })
                }
                placeholder="AIzaSy... (якщо порожньо — використовується прямий парсер Google Maps)"
                className="w-full px-3.5 py-2.5 border border-stone-300 text-sm font-mono"
              />
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition"
            >
              <Save className="w-4 h-4" />
              <span>Зберегти налаштування</span>
            </button>
          </form>
        )}
      </div>

      {/* ================= MODAL: EDIT / CREATE MENU ITEM ================= */}
      {editingItem && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingItem(null)}
        >
          <div
            className="bg-white border-2 border-zinc-950 max-w-xl w-full p-6 sm:p-8 relative my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold uppercase tracking-wider mb-5">
              {editingItem.id ? "Редагувати страву" : "Нова страва в меню"}
            </h3>

            <form onSubmit={handleSaveMenuItem} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Категорія *
                  </label>
                  <select
                    value={editingItem.category_slug || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category_slug: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Ціна (₴) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.price || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: e.target.value })
                    }
                    placeholder="Напр. 330.00 або 185.00/850.00"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Назва страви *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingItem.name || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, name: e.target.value })
                    }
                    placeholder="САЛАТ З РОСТБІФОМ"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Вага / Об&apos;єм
                  </label>
                  <input
                    type="text"
                    value={editingItem.weight || ""}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, weight: e.target.value })
                    }
                    placeholder="250 гр / 150ml"
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Опис / Інгредієнти
                </label>
                <textarea
                  rows={2}
                  value={editingItem.description || ""}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="рукола, томати чері, пармезан..."
                  className="w-full px-3 py-2 border border-stone-300 text-sm"
                />
              </div>

              {/* Photo Upload or URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Фотографія страви
                </label>
                <div className="flex items-center gap-3">
                  {editingItem.image_url && (
                    <img
                      src={editingItem.image_url}
                      alt="Preview"
                      className="w-14 h-14 object-cover border border-stone-300 shrink-0"
                    />
                  )}
                  <input
                    type="text"
                    value={editingItem.image_url || ""}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        image_url: e.target.value,
                      })
                    }
                    placeholder="URL фото або завантажте з комп'ютера/телефону →"
                    className="flex-1 px-3 py-2.5 border border-stone-300 text-sm"
                  />
                  <label className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-xs font-bold uppercase tracking-wider cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                    <Upload className="w-4 h-4" />
                    <span>{uploadingImage ? "..." : "Завантажити"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleFileUpload(f, (url) =>
                            setEditingItem((prev) => ({
                              ...prev,
                              image_url: url,
                            }))
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.is_popular)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_popular: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-amber-600"
                  />
                  <span>⭐ Хіт продажу</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(editingItem.is_spicy)}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_spicy: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-orange-600"
                  />
                  <span>🔥 Гостра / Пікантна</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-bold uppercase cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.is_available !== false}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <span>✅ В наявності на сайті</span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-5 py-2.5 border border-stone-300 text-xs font-bold uppercase tracking-wider"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-700"
                >
                  Зберегти страву
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / CREATE CATEGORY ================= */}
      {editingCategory && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditingCategory(null)}
        >
          <div
            className="bg-white border-2 border-zinc-950 max-w-lg w-full p-6 sm:p-8 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setEditingCategory(null)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-zinc-950"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold uppercase tracking-wider mb-5">
              {editingCategory.id ? "Редагувати категорію" : "Нова категорія"}
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Назва категорії *
                </label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  placeholder="Напр. Салати Рим"
                  className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Підзаголовок
                </label>
                <input
                  type="text"
                  value={editingCategory.subtitle || ""}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      subtitle: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Кулінарна група
                  </label>
                  <select
                    value={editingCategory.culinary_group || "rome"}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        culinary_group: e.target.value as Category["culinary_group"],
                      })
                    }
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm bg-white"
                  >
                    <option value="crimea">🌙 Кухня Криму</option>
                    <option value="rome">🏛️ Кухня Риму</option>
                    <option value="grill">🔥 На вугіллі</option>
                    <option value="kids">🐱 Дитяче меню</option>
                    <option value="bar">🍸 Бар & Напої</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                    Порядок сортування
                  </label>
                  <input
                    type="number"
                    value={editingCategory.sort_order ?? 1}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        sort_order: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2.5 border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 mb-1">
                  Верхній фото-банер категорії
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editingCategory.banner_image || ""}
                    onChange={(e) =>
                      setEditingCategory({
                        ...editingCategory,
                        banner_image: e.target.value,
                      })
                    }
                    placeholder="/images/banner_..."
                    className="flex-1 px-3 py-2 border border-stone-300 text-sm"
                  />
                  <label className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-xs font-bold uppercase cursor-pointer inline-flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Файл</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          handleFileUpload(f, (url) =>
                            setEditingCategory((prev) => ({
                              ...prev,
                              banner_image: url,
                            }))
                          );
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 border border-stone-300 text-xs font-bold uppercase"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest"
                >
                  Зберегти
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
