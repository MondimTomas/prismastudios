import WorkspaceLayout from "../components/WorkspaceLayout";

const views = ["Hoje", "Esta semana", "Atrasadas", "Todas"];

export default function TasksPage() {
  return (
    <WorkspaceLayout title="Tarefas" eyebrow="Execução & follow-up">
      <div className="flex flex-wrap gap-2">
        {views.map((view, index) => (
          <button
            key={view}
            type="button"
            className={`rounded-full px-4 py-2 text-sm border transition ${
              index === 0
                ? "bg-white text-[#151515] border-white"
                : "border-white/10 text-white/40 hover:text-white"
            }`}
          >
            {view}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <div className="rounded-xl border border-dashed border-white/10 px-5 py-16 text-center">
          <p className="text-sm text-white/35">Sem tarefas para mostrar.</p>
          <p className="text-xs text-white/20 mt-2">
            As tarefas poderão estar ligadas a uma lead, cliente, projeto ou cobrança.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
