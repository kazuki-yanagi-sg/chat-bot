"use client";

import { useEffect, useState } from "react";

const times: Array<"morning" | "day" | "evening" | "night"> = ["morning", "day", "evening", "night"];

export default function CitypopBackground() {
  const [timeIndex, setTimeIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeIndex((prev) => (prev + 1) % times.length);
    }, 20000); // 20秒ごとに切り替え

    return () => clearInterval(interval);
  }, []);

  const time = times[timeIndex];

  return (
    <div className={`fixed inset-0 -z-10 transition-colors duration-1000 ${getBgGradient(time)}`}>
      {/* 雲たち */}
      <div className="cloud cloud-1" />
      <div className="cloud cloud-2" />
      <div className="cloud cloud-3" />
      <div className="cloud cloud-4" />
    </div>
  );
}

function getBgGradient(time: string) {
  switch (time) {
    case "morning":
      return "bg-gradient-to-b from-yellow-100 via-pink-100 to-blue-100";
    case "day":
      return "bg-gradient-to-b from-sky-300 to-sky-100";
    case "evening":
      return "bg-gradient-to-b from-orange-300 via-pink-400 to-purple-500";
    case "night":
      return "bg-gradient-to-b from-indigo-900 to-black";
    default:
      return "";
  }
}
