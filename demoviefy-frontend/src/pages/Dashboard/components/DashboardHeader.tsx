// src/pages/Dashboard/components/DashboardHeader.tsx

interface DashboardHeaderProps {
  onToggleSidebar: () => void;
}

export function DashboardHeader({ onToggleSidebar }: DashboardHeaderProps) {
  return (
    <div className="flex items-center border-b border-slate-800 px-8 py-5 lg:px-12">
      <button
        type="button"
        onClick={onToggleSidebar}
        className="text-sm text-slate-400 hover:text-white"
        aria-label="Abrir biblioteca de vídeos"
      >
        Biblioteca
      </button>
    </div>
  );
}