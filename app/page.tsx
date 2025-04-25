// ============================
//  Korvynox — Stalker Site v5
//  Adds ScanReveal animation using React + GSAP + Canvas
// ============================

// 1) Install deps locally:
//    npm i gsap react-use-measure
// 2) This file contains two parts:
//    a) app/components/ScanReveal.tsx  – reusable animation component
//    b) app/page.tsx                    – page now renders <ScanReveal />
// ------------------------------------------------------------

// ---------- app/page.tsx ----------
"use client";
import Head from "next/head";
import { useEffect, useState } from "react";
import ScanReveal from "./components/ScanReveal";

// (оставшаяся логика сбора info + location берётся из предыдущей версии)
// чтобы не дублировать 300+ строк, здесь показываю только места, которые меняются

// ... импорт типов / useState как раньше ...


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

  // useEffect сбора данных остаётся БЕЗ изменений

  if (!info || !location) return <p className="p-6">Загрузка…</p>;

  // ↓ формируем threatMessage ровно тем же шаблоном, что утвердили ↓
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

  const threatMessage = `🚨 ВНИМАНИЕ — МОШЕННИК!\n\n`+
    `– Устройство: ${deviceType} (платформа — ${info.platform}, браузер — ${browserName})\n`+
    `– IP-адрес: ${location.ip} (${location.city}, ${location.region}, ${location.country_name})\n`+
    `– Язык интерфейса: ${info.language}; часовой пояс: ${info.timezone}\n`+
    `– Разрешение экрана: ${info.screenRes}\n\n`+
    (lowBattery ? `⚠️ Заряд ${batteryPct}% — подключитесь к питанию!\n` : `✅ Батарея: ${batteryPct}% — достаточно.\n`) +
    (slowNet   ? `⚠️ Медленный канал ${info.connection.downlink} Мбит/с.\n` : `✅ Канал ${info.connection.downlink} Мбит/с.\n`) +
    (lowMem    ? `⚠️ ОЗУ: ${memGB} ГБ — возможны сбои.\n\n` : `✅ ОЗУ: ${memGB} ГБ — без задержек.\n\n`) +
    `Данные переданы в центральный отчётный модуль.`;

  return (
    <>
      <Head>
        <title>Korvynox | Предупреждение</title>
        <meta name="description" content="Сайт фиксирует ваше устройство" />
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <main className="p-6 max-w-3xl mx-auto">
        {/* канвас-анимация */}
        <ScanReveal text={threatMessage} />
      </main>
    </>
  );
}
