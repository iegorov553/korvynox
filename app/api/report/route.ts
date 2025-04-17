import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const { browserInfo = {}, location = {} } = await req.json();

  const message = `🌐 New visitor on Korvynox
IP: ${location.ip}
City: ${location.city}
Region: ${location.region}
Country: ${location.country_name}
ISP: ${location.org}
UA: ${browserInfo.userAgent}
Lang: ${browserInfo.language}
TZ: ${browserInfo.timezone}
Screen: ${browserInfo.screenRes}
Platform: ${browserInfo.platform}
Memory: ${browserInfo.memory}
Battery: ${
    typeof browserInfo.battery === "string"
      ? browserInfo.battery
      : browserInfo.battery?.level
  }
Conn: ${browserInfo.connection?.type} ${
    browserInfo.connection?.downlink
  } Mbps`;

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
