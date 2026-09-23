interface RatingBadgeProps {
  level: number;
  label: string;
}

const RATING_COLORS: Record<number, string> = {
  1: "#00a54f", // Livre (Verde)
  2: "#00a9e0", // 10 (Azul)
  3: "#ffcc00", // 12 (Amarelo)
  4: "#ff6600", // 14 (Laranja)
  5: "#ff0000", // 16 (Vermelho)
  6: "#000000", // 18 (Preto)
};

export function RatingBadge({ level, label }: RatingBadgeProps) {
  const bgColor = RATING_COLORS[level] || RATING_COLORS[1];

  return (
    <div className="flex items-center gap-2">
      <span 
        className="flex items-center justify-center font-bold text-white rounded-md w-8 h-8 text-sm"
        style={{ backgroundColor: bgColor }}
        title={`Nível de periculosidade: ${level}/6`}
      >
        {level === 1 ? 'L' : label.split(' ')[0]}
      </span>
      <span className="text-sm font-medium text-[var(--text)]">
        {label}
      </span>
    </div>
  );
}