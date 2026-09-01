type StatusBadgeProps = {
  status: string;
};

const STATUS_LABELS: Record<string, string> = {
  PROCESSANDO: "Na fila",
  PROCESSANDO_IA: "Analisando",
  PROCESSADO: "Concluído",
  SEM_ANALISE: "Sem análise",
  CANCELADO: "Cancelado",
  ERRO_ARQUIVO: "Erro no arquivo",
  ERRO_IA: "Erro na análise",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = status.toUpperCase();
  const label = STATUS_LABELS[normalized] ?? status;

  const tone =
    normalized === "PROCESSADO"
      ? "success"
      : normalized === "CANCELADO"
        ? "warning"
        : normalized.startsWith("ERRO")
          ? "danger"
          : "warning";

  const toneClasses = {
    success: "bg-brand-soft text-brand-strong",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
    danger: "bg-danger/15 text-danger",
  };

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium whitespace-nowrap ${toneClasses[tone]}`} > <span className="size-2 rounded-full bg-current" /> {label} </span>
  );
}
