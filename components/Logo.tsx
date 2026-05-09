export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#0F6E56" />
        <text x="20" y="28" fontFamily="system-ui, sans-serif" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">₦</text>
      </svg>
      <span className="text-xl font-bold text-primary">NairaLog</span>
    </div>
  );
}
