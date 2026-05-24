interface ConcentricRingsProps {
  books: {
    id: string;
    title: string;
    pagesRead: number;
    totalPages: number;
  }[];
}

const ringColors = [
  { dark: 'hsl(16, 75%, 47%)',  light: 'hsl(16, 50%, 88%)' },    // rust
  { dark: 'hsl(30, 65%, 45%)',  light: 'hsl(30, 40%, 87%)' },    // burnt sienna
  { dark: 'hsl(8, 60%, 42%)',   light: 'hsl(8, 40%, 86%)' },     // terracotta
  { dark: 'hsl(45, 55%, 45%)',  light: 'hsl(45, 35%, 88%)' },    // amber
  { dark: 'hsl(0, 50%, 40%)',   light: 'hsl(0, 35%, 86%)' },     // brick red
  { dark: 'hsl(22, 70%, 50%)',  light: 'hsl(22, 45%, 87%)' },    // copper
];

const ConcentricRings = ({ books }: ConcentricRingsProps) => {
  const size = 240;
  const strokeWidth = 14;
  const gap = 6;

  if (books.length === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {books.map((book, i) => {
            const radius = (size / 2) - (strokeWidth / 2) - i * (strokeWidth + gap);
            if (radius <= 0) return null;
            const circumference = 2 * Math.PI * radius;
            const progress = book.totalPages > 0 ? Math.min(book.pagesRead / book.totalPages, 1) : 0;
            const offset = circumference - progress * circumference;
            const colors = ringColors[i % ringColors.length];

            return (
              <g key={book.id}>
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={colors.light}
                  strokeWidth={strokeWidth}
                />
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke={colors.dark}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  className="transition-all duration-700"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {books.map((book, i) => {
          const colors = ringColors[i % ringColors.length];
          const pct = book.totalPages > 0 ? Math.round((book.pagesRead / book.totalPages) * 100) : 0;
          return (
            <div key={book.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: colors.dark }} />
              <span className="max-w-[120px] truncate">{book.title}</span>
              <span className="font-medium text-foreground">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConcentricRings;
