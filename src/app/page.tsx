import React from "react";
import { getAllSiteData } from "@/lib/db";
import RestaurantClient from "@/components/RestaurantClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const siteData = await getAllSiteData(false);
  return <RestaurantClient initialData={siteData} />;
}

