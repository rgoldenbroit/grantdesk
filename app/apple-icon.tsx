import { ImageResponse } from "next/og";
import { LOGO_PATHS } from "./_components/logo-mark";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  // iOS rounds the corners itself, so the tile is a plain square.
  return new ImageResponse(
    <svg
      fill="none"
      height={size.height}
      viewBox="0 0 32 32"
      width={size.width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0h32v32H0z" fill="#1d4a93" />
      <g
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.25}
        transform="translate(4 4)"
      >
        {LOGO_PATHS.map((d) => (
          <path d={d} key={d} />
        ))}
      </g>
    </svg>,
    size,
  );
}
