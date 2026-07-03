// Animated skeleton placeholder shown while restaurant cards are loading

const SkeletonCard = () => (
  <div className="flex flex-col md:flex-row gap-md p-md bg-glass-surface border border-glass-border rounded-[1.5rem] overflow-hidden animate-pulse">
    {/* Image placeholder */}
    <div className="w-full md:w-[200px] h-[200px] md:h-[150px] rounded-md bg-glass-border/40 shrink-0" />

    {/* Content placeholders */}
    <div className="flex-1 flex flex-col gap-sm justify-center">
      <div className="h-5 w-2/3 rounded-md bg-glass-border/40" />
      <div className="h-4 w-1/3 rounded-md bg-glass-border/30" />
      <div className="h-4 w-1/4 rounded-md bg-glass-border/30" />
      <div className="flex gap-xs mt-xs">
        <div className="h-6 w-20 rounded-full bg-glass-border/30" />
        <div className="h-6 w-16 rounded-full bg-glass-border/30" />
        <div className="h-6 w-24 rounded-full bg-glass-border/30" />
      </div>
      <div className="h-3 w-full rounded-md bg-glass-border/20 mt-xs" />
      <div className="h-3 w-4/5 rounded-md bg-glass-border/20" />
    </div>
  </div>
)

export const SkeletonList = ({ count = 3 }) => (
  <div className="flex flex-col gap-md">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

export default SkeletonCard
