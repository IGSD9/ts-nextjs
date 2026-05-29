type TeamConditionLogoProps = {
  className?: string;
};

const COLORS = {
  sage: "#6d9494",
  teal: "#2f4f5c",
  gold: "#c4a05e",
  goldDark: "#9a7840",
  goldLight: "#dcc07a",
};

function Person({
  headCx,
  headCy,
  headR,
  bodyTop,
  bodyBottom,
  bodyHalfWidth,
  fill,
}: {
  headCx: number;
  headCy: number;
  headR: number;
  bodyTop: number;
  bodyBottom: number;
  bodyHalfWidth: number;
  fill: string;
}) {
  const neckY = headCy + headR + 1;
  return (
    <g fill={fill}>
      <circle cx={headCx} cy={headCy} r={headR} />
      <path
        d={`M ${headCx - bodyHalfWidth} ${neckY}
            Q ${headCx} ${bodyTop} ${headCx + bodyHalfWidth} ${neckY}
            L ${headCx + bodyHalfWidth - 1} ${bodyBottom}
            Q ${headCx} ${bodyBottom + 4} ${headCx - bodyHalfWidth + 1} ${bodyBottom}
            Z`}
      />
    </g>
  );
}

/** ホーム用：3人シルエット + 上向き矢印（参考デザインをSVGで再現） */
export function TeamConditionLogo({ className }: TeamConditionLogoProps) {
  return (
    <svg
      viewBox="0 0 168 88"
      role="img"
      aria-label="Team Condition ロゴ"
      className={className}
    >
      <defs>
        <linearGradient id="tc-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={COLORS.goldDark} />
          <stop offset="45%" stopColor={COLORS.gold} />
          <stop offset="100%" stopColor={COLORS.goldLight} />
        </linearGradient>
      </defs>

      <circle cx="18" cy="14" r="1.5" fill={COLORS.gold} opacity="0.4" />
      <circle cx="152" cy="10" r="2" fill={COLORS.gold} opacity="0.35" />
      <circle cx="158" cy="24" r="1.2" fill={COLORS.sage} opacity="0.35" />
      <path
        d="M12 78 C30 64 52 58 76 56 C100 52 122 36 140 18"
        fill="none"
        stroke={COLORS.gold}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.28"
      />

      <path
        d="M6 76
           C22 66 44 60 68 58
           C92 54 112 40 128 24
           L148 10
           L142 20
           L124 34
           C106 48 84 58 62 62
           C40 66 22 72 12 78
           Z"
        fill="url(#tc-arrow)"
      />
      <path
        d="M6 76 C18 70 32 66 46 64 L42 72 C28 74 16 78 10 82 Z"
        fill={COLORS.goldDark}
        opacity="0.45"
      />

      <Person
        headCx={40}
        headCy={24}
        headR={8}
        bodyTop={30}
        bodyBottom={58}
        bodyHalfWidth={11}
        fill={COLORS.sage}
      />
      <Person
        headCx={80}
        headCy={18}
        headR={10}
        bodyTop={24}
        bodyBottom={64}
        bodyHalfWidth={13}
        fill={COLORS.teal}
      />
      <Person
        headCx={120}
        headCy={26}
        headR={8}
        bodyTop={32}
        bodyBottom={56}
        bodyHalfWidth={11}
        fill={COLORS.gold}
      />

      <path d="M128 24 L148 10 L144 18 L126 32 Z" fill={COLORS.goldLight} />
      <path d="M132 22 L146 12 L142 16 L130 26 Z" fill="#fff" opacity="0.22" />
    </svg>
  );
}
