import { cn } from '@/lib/utils';

interface ReadingRingProps {
  title: string;
  pagesRead: number;
  totalPages: number;
  color: string;
  size?: number;
  strokeWidth?: number;
}

const ReadingRing = ({ title, pagesRead, totalPages, color, size = 100, strokeWidth = 8 }: ReadingRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = totalPages > 0 ? Math.min(pagesRead / totalPages, 1) : 0;
  const offset = circumference - progress * circumference;
  const percent = Math.round(progress * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-semibold text-foreground">{percent}%</span>
        </div>
      </div>
      <p className="max-w-[100px] truncate text-xs text-muted-foreground text-center">{title}</p>
    </div>
  );
};

export default ReadingRing;
