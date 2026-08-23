// The mark: an ascending arc from a lower, solid navy point (past
// experience) to a higher, teal point (opportunity) — reads as both
// "bridge" and "upward progression" at once. Works small since it's
// just two points and one stroke, no fine detail to lose.
const Logo = ({ size = 30, showWordmark = true }) => {
  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 24 C 14 24, 20 8, 34 8"
          stroke="#0E6E64"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="6" cy="24" r="3.5" fill="#14202B" />
        <circle cx="34" cy="8" r="3.5" fill="#0E6E64" />
      </svg>
      {showWordmark && (
        <span className="text-[19px] font-semibold tracking-tight leading-none">
          <span className="text-ink">Skill</span>
          <span className="text-accent">Bridge</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
