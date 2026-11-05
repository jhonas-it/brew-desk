import { useId } from "react";

// Brew Desk logo mark (from the Figma SVG).
// The color follows the CSS `color` of the parent, so set it in login.css
// (orange on the login screen, red on the splash screen).

const CRESCENT =
  "M972.235 1288.9L274.236 720.396C-693.776 2342.4 1234.22 4421.4 3006.73 2869.9C899.234 3310.4 633.234 1970.4 972.235 1288.9Z";

const BEAN_OUTER =
  "M1644.55 26.8721C2185.01 -115.93 2796.27 324.626 3009.82 1010.88C3223.37 1697.14 2958.36 2369.22 2417.9 2512.02C1877.44 2654.82 1266.19 2214.27 1052.63 1528.01C839.076 841.759 1104.09 169.675 1644.55 26.8721Z";

const BEAN_CUT =
  "M1775.82 252.861C1322.09 1126.16 2299.2 1160.15 2384.24 2292.19C2979.29 1552.06 1696.87 895.78 1775.82 252.861Z";

export default function BrewLogo({ size = 40, className = "" }) {
  const id = useId().replace(/:/g, "");
  const maskId = `bd-logo-gap-${id}`;

  return (
    <svg
      className={className}
      viewBox="0 0 3100 3430"
      height={size}
      width={size * (3100 / 3430)}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* cuts a thin gap around the bean so the crescent doesn't merge with it */}
        <mask id={maskId} maskUnits="userSpaceOnUse" x="-200" y="-200" width="3500" height="3800">
          <rect x="-200" y="-200" width="3500" height="3800" fill="#fff" />
          <path d={BEAN_OUTER} fill="#000" stroke="#000" strokeWidth="110" />
        </mask>
      </defs>
      <path d={CRESCENT} mask={`url(#${maskId})`} />
      <path d={`${BEAN_OUTER} ${BEAN_CUT}`} fillRule="evenodd" />
    </svg>
  );
}
