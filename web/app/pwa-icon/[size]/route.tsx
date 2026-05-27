import { ImageResponse } from "next/og";
import { getPwaIconElement } from "@/lib/pwa-brand";

const ALLOWED_SIZES = [192, 512] as const;

export async function GET(
  _request: Request,
  context: { params: Promise<{ size: string }> },
) {
  const { size: sizeParam } = await context.params;
  const size = Number(sizeParam);

  if (!ALLOWED_SIZES.includes(size as (typeof ALLOWED_SIZES)[number])) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(getPwaIconElement(size), {
    width: size,
    height: size,
  });
}
