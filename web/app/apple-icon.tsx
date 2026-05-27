import { ImageResponse } from "next/og";
import { getPwaIconElement } from "@/lib/pwa-brand";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(getPwaIconElement(180), { ...size });
}
