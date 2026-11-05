import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function LogoDiamond({ className = "", size = "md" }: LogoProps) {
  const dimensions = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
    xl: "w-40 h-40",
  }[size];

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${dimensions} ${className}`}
      title="Крим & Рим"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Outer Black Diamond */}
        <polygon points="100,6 194,100 100,194 6,100" fill="#0B0B0B" />
        {/* Inner White Diamond Frame */}
        <polygon
          points="100,14 186,100 100,186 14,100"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.4"
        />

        {/* Left Radiating Accent Lines */}
        <line
          x1="46"
          y1="91"
          x2="60"
          y2="96"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="43"
          y1="101"
          x2="59"
          y2="101"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="46"
          y1="111"
          x2="60"
          y2="106"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Right Radiating Accent Lines */}
        <line
          x1="154"
          y1="91"
          x2="140"
          y2="96"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="157"
          y1="101"
          x2="141"
          y2="101"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="154"
          y1="111"
          x2="140"
          y2="106"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* TOP ROW: К Р И М (Tall condensed monoline art-deco lettering matching PDF Slide 1) */}
        <g
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* К */}
          <line x1="71" y1="62" x2="71" y2="97" />
          <path d="M71 71 C76 71 78 66 78 62" />
          <path d="M71 88 C76 88 78 92 78 97" />

          {/* Р */}
          <line x1="86" y1="62" x2="86" y2="97" />
          <path d="M86 62 C94 62 94 72 86 72" />

          {/* И */}
          <line x1="100" y1="62" x2="100" y2="97" />
          <line x1="100" y1="97" x2="109" y2="62" />
          <line x1="109" y1="62" x2="109" y2="97" />

          {/* М */}
          <polyline points="116,97 116,62 122.5,88 129,62 129,97" />
        </g>

        {/* BOTTOM ROW: & Р И М */}
        <g
          stroke="#FFFFFF"
          strokeWidth="2.3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* & (Slender tall ampersand) */}
          <path d="M79 138 L71 114 C69.5 109 71 104 74 104 C77 104 78.5 109 76.5 114 L70.5 127 C68.5 132 70.5 138 74.5 138 C77.5 138 79.5 133 80.5 127" />

          {/* Р */}
          <line x1="86" y1="104" x2="86" y2="138" />
          <path d="M86 104 C94 104 94 114 86 114" />

          {/* И */}
          <line x1="100" y1="104" x2="100" y2="138" />
          <line x1="100" y1="138" x2="109" y2="104" />
          <line x1="109" y1="104" x2="109" y2="138" />

          {/* М */}
          <polyline points="116,138 116,104 122.5,129 129,104 129,138" />
        </g>
      </svg>
    </div>
  );
}

export function KidsMenuCatIllustration({ className = "w-36 h-36" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 220 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Turquoise abstract blob background from PDF Page 9 */}
      <path
        d="M30 85 C10 40, 75 5, 130 15 C185 25, 215 65, 200 120 C185 160, 110 165, 60 145 Z"
        fill="#1997A9"
        opacity="0.18"
      />
      {/* Yellow sun blob */}
      <circle cx="48" cy="44" r="22" fill="#F6D046" />
      {/* Terracotta spotted cat from PDF Page 9 */}
      <path
        d="M65 165 L75 115 C78 100 95 95 125 95 L135 55 L145 35 C147 30 152 30 154 36 L158 48 L175 48 L180 35 C183 30 188 30 190 36 L195 58 C202 80 202 125 198 165 Z"
        fill="#DD5746"
      />
      {/* Cat ears inner */}
      <path d="M147 44 C147 38 151 38 152 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M182 44 C182 38 186 38 187 44" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
      {/* Cat eyes & nose */}
      <circle cx="157" cy="68" r="2.5" fill="#FFFFFF" />
      <circle cx="178" cy="68" r="2.5" fill="#FFFFFF" />
      <path d="M164 73 L171 73 M167.5 73 L167.5 85" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
      {/* White spots on cat */}
      <ellipse cx="105" cy="125" rx="14" ry="9" stroke="#FFFFFF" strokeWidth="2" />
      <ellipse cx="145" cy="135" rx="12" ry="15" stroke="#FFFFFF" strokeWidth="2" />
      <ellipse cx="178" cy="128" rx="11" ry="14" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="88" cy="145" r="7" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}

