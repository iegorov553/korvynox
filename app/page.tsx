// ============================
// Korvynox — Stalker Site v4
// Next.js 15 App Router with dynamic threat text
// ============================

// -------- app/page.tsx --------
"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

type BrowserInfo = {
  userAgent: string;
  language: string;
  timezone: string;
  screenRes: string;
  platform: string;
  memory: number;
  connection: { type: string; downlink: number };
  battery: { level: number; charging: boolean } | null;
};

type LocationInfo = {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
};

export default function Page() {
  const [info, setInfo] = useState<BrowserInfo | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    const language = navigator.language;
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const platform = navigator.platform;
    const memory = (navigator as any).deviceMemory || 0;
    const conn = (navigator as any).connection || {};
    const connection = {
      type: conn.effectiveType || "unknown",
      downlink: conn.downlink || 0,
    };

    const batteryPromise = (navigator as any).getBattery
      ? (navigator as any).getBattery().then((bat: any) => ({ level: bat.level * 100, charging: bat.charging }))
      : Promise.resolve(null);

    const browserPromise = batteryPromise.then((battery) => ({
      userAgent: ua,
      language,
      timezone,
      screenRes,
      platform,
      memory,
      connection,
      battery,
    }));

    const geoPromise = fetch("https://ipapi.co/json").then((res) => res.json());

    Promise.all([browserPromise, geoPromise])
      .then(([browserInfo, loc]) => {
        setInfo(browserInfo);
        setLocation(loc);
        fetch("/api/report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ browserInfo, location: loc }),
        }).catch(() => {});
      })
      .catch(() => {
        // ignore errors
      });
  }, []);

  if (!info || !location) {
    return <p className="p-6">Загрузка данных…</p>;
  }

  const deviceType = /Mobi|Android/i.test(info.userAgent)
    ? "мобильного устройства"
    : "компьютера";
  let browserName = "неизвестного браузера";
  if (info.userAgent.includes("Firefox")) browserName = "Firefox";
  else if (info.userAgent.includes("Edg")) browserName = "Edge";
  else if (info.userAgent.includes("Chrome")) browserName = "Chrome";
  else if (info.userAgent.includes("Safari")) browserName = "Safari";

  const batteryPct = info.battery ? Math.round(info.battery.level) : 0;
  const lowBattery = batteryPct < 20;
  const slowNet = info.connection.downlink < 2;
  const memGB = Math.round(info.memory);
  const lowMem = memGB < 4;

  return (
    <>
      <Head>
        <title>Korvynox | Предупреждение</title>
        <meta name="description" content="Сайт фиксирует ваше устройство" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="p-6 max-w-xl mx-auto text-lg">
        <div className="bg-red-100 border border-red-300 p-6 rounded-lg">
          <p className="font-bold text-xl">🚨 ВНИМАНИЕ — МОШЕННИК!</p>
          <p className="mt-4">– Устройство: {deviceType} (платформа — {info.platform}, браузер — {browserName})</p>
          <p>– IP-адрес: {location.ip} ({location.city}, {location.region}, {location.country_name})</p>
          <p>– Язык интерфейса: {info.language}; часовой пояс: {info.timezone}</p>
          <p>– Разрешение экрана: {info.screenRes}</p>

          {lowBattery ? (
            <p className="mt-4 text-red-700">
              ⚠️ При заряде {batteryPct}% устройство может отключиться. Подключитесь к питанию!
            </p>
          ) : (
            <p className="mt-4 text-green-700">
              ✅ Батарея: {batteryPct}% — заряда хватит ещё на время.
            </p>
          )}

          {slowNet ? (
            <p className="mt-2 text-red-700">
              ⚠️ Канал связи медленный ({info.connection.downlink} Мбит/с). Ваши действия фиксируются с задержкой.
            </p>
          ) : (
            <p className="mt-2 text-green-700">
              ✅ Канал связи: {info.connection.downlink} Мбит/с — фиксируем мгновенно.
            </p>
          )}

          {lowMem ? (
            <p className="mt-2 text-red-700">
              ⚠️ ОЗУ: {memGB} ГБ — при больших объёмах данных возможны сбои.
            </p>
          ) : (
            <p className="mt-2 text-green-700">
              ✅ ОЗУ: {memGB} ГБ — система работает без задержек.
            </p>
          )}

          <p className="mt-6">
            Данные переданы в центральный отчётный модуль. Ваши дальнейшие действия тщательно контролируются.
          </p>
        </div>
      </main>
    </>
  );
}
