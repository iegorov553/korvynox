// app/page.tsx
"use client";
import Head from "next/head";
import { useEffect, useState } from "react";

type BrowserInfo = {
  userAgent: string;
  language: string;
  timezone: string;
  screenRes: string;
  platform: string;
  memory: string;
  cookieEnabled: boolean;
  connection: { type: string; downlink: number };
  battery: string | { level: string; charging: string };
};

type LocationInfo = {
  ip: string;
  city: string;
  region: string;
  country_name: string;
  org: string;
  error?: string;
};

export default function Page() {
  const [info, setInfo] = useState<BrowserInfo | null>(null);
  const [location, setLocation] = useState<LocationInfo | null>(null);

  useEffect(() => {
  // 1) промис браузерных данных
  const browserPromise = (navigator as any).getBattery
    ? (navigator as any).getBattery().then((battery: any) => ({
        userAgent: navigator.userAgent,
        language:  navigator.language,
        timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        platform:  navigator.platform,
        memory:    (navigator as any).deviceMemory?.toString() || "unknown",
        cookieEnabled: navigator.cookieEnabled,
        connection: {
          type: (navigator as any).connection?.effectiveType || "",
          downlink: (navigator as any).connection?.downlink || 0,
        },
        battery: battery
          ? `${Math.round(battery.level * 100)}%, Charging: ${battery.charging?"Yes":"No"}`
          : "Battery info not available",
      }))
    : Promise.resolve({
        userAgent: navigator.userAgent,
        language:  navigator.language,
        timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone,
        screenRes: `${window.screen.width}x${window.screen.height}`,
        platform:  navigator.platform,
        memory:    (navigator as any).deviceMemory?.toString() || "unknown",
        cookieEnabled: navigator.cookieEnabled,
        connection: { type: "", downlink: 0 },
        battery: "Battery info not available",
      });

  // 2) промис гео
  const geoPromise = fetch("https://ipapi.co/json")
    .then(r => r.json())
    .catch(() => ({ ip: "unknown", city: "unknown", region: "unknown", country_name: "unknown", org: "unknown" }));

  // 3) ждём оба
  Promise.all([browserPromise, geoPromise]).then(([browserInfo, locationInfo]) => {
    setInfo(browserInfo);
    setLocation(locationInfo);
    // единственный POST
    fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ browserInfo, location: locationInfo }),
    }).catch(() => {});
  });
}, []); // пустые зависимости — код выполнится только 1 раз при монтировании


  return (
    <>
      <Head>
        <title>Korvynox | What the web knows about you</title>
        <meta
          name="description"
          content="Korvynox shows everything your browser leaks: IP, location, device data."
        />
        <meta
          name="keywords"
          content="korvynox, browser info, ip checker, device fingerprint, who am i"
        />
        <meta name="robots" content="index,follow" />
      </Head>

      <main className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">
          🕵️ Korvynox: Вот что я о&nbsp;тебе знаю
        </h1>

        <div className="border rounded-xl p-4 shadow space-y-2">
          {info ? (
            <>
              <p>
                <strong>User Agent:</strong> {info.userAgent}
              </p>
              <p>
                <strong>Language:</strong> {info.language}
              </p>
              <p>
                <strong>Time Zone:</strong> {info.timezone}
              </p>
              <p>
                <strong>Screen Res:</strong> {info.screenRes}
              </p>
              <p>
                <strong>Platform:</strong> {info.platform}
              </p>
              <p>
                <strong>Device Memory:</strong> {info.memory} GB
              </p>
              <p>
                <strong>Cookies Enabled:</strong>{" "}
                {info.cookieEnabled ? "Yes" : "No"}
              </p>
              <p>
                <strong>Connection:</strong> {info.connection.type} ·{" "}
                {info.connection.downlink} Mbps
              </p>
              <p>
                <strong>Battery:</strong>{" "}
                {typeof info.battery === "string"
                  ? info.battery
                  : `${info.battery.level}, Charging: ${info.battery.charging}`}
              </p>
            </>
          ) : (
            <p>Loading device data…</p>
          )}
        </div>

        <div className="border rounded-xl p-4 shadow space-y-2">
          <h2 className="text-xl font-semibold">📍 Location Info</h2>
          {location?.error ? (
            <p>{location.error}</p>
          ) : location ? (
            <>
              <p>
                <strong>IP:</strong> {location.ip}
              </p>
              <p>
                <strong>City:</strong> {location.city}
              </p>
              <p>
                <strong>Region:</strong> {location.region}
              </p>
              <p>
                <strong>Country:</strong> {location.country_name}
              </p>
              <p>
                <strong>ISP:</strong> {location.org}
              </p>
            </>
          ) : (
            <p>Loading geo data…</p>
          )}
        </div>
      </main>
    </>
  );
}
