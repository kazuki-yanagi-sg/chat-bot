"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-pink-50 text-center px-4">
      <h1 className="text-[8rem] font-extrabold text-pink-300 drop-shadow-lg">404</h1>
      <p className="text-2xl font-semibold text-pink-600 mb-4">ページが見つかりません</p>
      <p className="text-md text-pink-500 mb-8">お探しのページは存在しないか、移動した可能性があります。</p>
      <Link href="/" className="inline-block px-6 py-3 bg-pink-400 hover:bg-pink-500 text-white rounded-full shadow-md transition-all">
        ホームに戻る
      </Link>
    </div>
  );
}
