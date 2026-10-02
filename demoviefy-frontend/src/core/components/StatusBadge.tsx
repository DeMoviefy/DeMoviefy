type StatusBadgeProps = {
    status: string;
};

const STATUS_LABELS: Record<string, string> = {
    PROCESSANDO: "Na fila",
    PROCESSANDO_IA: "Processando",
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
                ? "danger"
                : normalized.startsWith("ERRO")
                    ? "danger"
                    : normalized === "PROCESSANDO_IA"
                        ? "processing"
                        : "warning"

    const toneClasses = {
        success: "bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300",
        processing:"bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        warning: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
        danger: "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
    };



    return (
        <span className={`inline-flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${toneClasses[tone]}`}>
            <span className="size-1.5 rounded-full bg-current" />
            {label}
        </span>
    );
}
