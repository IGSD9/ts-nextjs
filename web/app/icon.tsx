import { ImageResponse } from "next/og";
import { getPwaIconElement } from "@/lib/pwa-brand";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(getPwaIconElement(32), { ...size });
}
