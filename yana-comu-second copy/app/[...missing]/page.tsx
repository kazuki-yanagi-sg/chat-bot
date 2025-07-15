"use client";

import { notFound } from "next/navigation";

export default function CatchAllPage() {
  console.log("❗[...missing] page reached"); // デバッグ用ログ
  notFound(); // ← これが 404 を出すポイント
}
