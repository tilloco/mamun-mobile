export function PremiumBadge({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-sm bg-brassLight text-brass text-xs font-medium px-2 py-0.5">
        Premium
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-sm bg-sageLight text-sage text-xs font-medium px-2 py-0.5">
      Bepul
    </span>
  );
}
