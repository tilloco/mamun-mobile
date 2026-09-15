export function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: 'brass' | 'sage' }) {
  return (
    <div className="bg-panel border border-line rounded-md px-5 py-4">
      <p className="text-sm text-muted">{label}</p>
      <p className={`font-display text-3xl mt-1 ${accent === 'brass' ? 'text-brass' : accent === 'sage' ? 'text-sage' : 'text-ink900'}`}>
        {value}
      </p>
    </div>
  );
}
