// -------- app/api/report/route.ts --------
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { browserInfo = {}, location = {} } = await req.json();

  const message = `🌐 New visitor on Korvynox`
    + `\nIP: ${location.ip}`
    + `\nCity: ${location.city}`
    + `\nRegion: ${location.region}`
    + `\nCountry: ${location.country_name}`
    + `\nUA: ${browserInfo.userAgent}`
    + `\nLang: ${browserInfo.language}`
    + `\nTZ: ${browserInfo.timezone}`
    + `\nScreen: ${browserInfo.screenRes}`
    + `\nPlatform: ${browserInfo.platform}`;

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (token && chatId) {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    }).catch(() => {});
  }

  return NextResponse.json({ ok: true });
}
