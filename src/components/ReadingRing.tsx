interface ConcentricRingsProps {
  books: {
    id: string;
    title: string;
    pagesRead: number;
    totalPages: number;
  }[];
}

const ringColors = [
  { dark: 'hsl(348, 83%, 47%)', light: 'hsl(348, 50%, 88%)' },   // amaranth
  { dark: 'hsl(320, 55%, 45%)', light: 'hsl(320, 35%, 86%)' },   // deep rose
  { dark: 'hsl(15, 70%, 50%)',  light: 'hsl(15, 45%, 87%)' },    // warm coral
  { dark: 'hsl(280, 45%, 50%)', light: 'hsl(280, 30%, 86%)' },   // plum
  { dark: 'hsl(355, 65%, 55%)', light: 'hsl(355, 40%, 88%)' },   // crimson rose
  { dark: 'hsl(340, 60%, 40%)', light: 'hsl(340, 35%, 85%)' },   // burgundy
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
