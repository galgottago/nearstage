export function Stars({ rating }: { rating: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span aria-label={`${rating} out of 5`} className="tracking-tight text-[#b7791f]">
      {"★★★★★".slice(0, filled)}
      <span className="text-[#c9bfae]">{"★★★★★".slice(filled)}</span>
    </span>
  );
}
