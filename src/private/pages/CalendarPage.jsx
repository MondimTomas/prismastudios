import WorkspaceLayout from "../components/WorkspaceLayout";

const dayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function CalendarPage() {
  return (
    <WorkspaceLayout title="Calendário" eyebrow="Agenda operacional">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4 mb-8">
        <div>
          <p className="text-white/45 max-w-2xl">
            Sessões de futebol, gravações, eventos, reuniões e entregas num único calendário.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/35">
          <button className="rounded-xl border border-white/10 px-3 py-2 hover:text-white transition">
            ←
          </button>
          <span className="min-w-32 text-center text-white/70">Outubro 2026</span>
          <button className="rounded-xl border border-white/10 px-3 py-2 hover:text-white transition">
            →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/[0.06]">
          {dayLabels.map((day) => (
            <div
              key={day}
              className="px-3 py-3 text-center text-[10px] uppercase tracking-[0.18em] text-white/30"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: 35 }, (_, index) => {
            const number = index - 2;
            const visible = number > 0 && number <= 31;

            return (
              <div
                key={index}
                className="min-h-28 border-r border-b border-white/[0.05] p-2 last:border-r-0"
              >
                <span className={visible ? "text-xs text-white/40" : "text-xs text-white/10"}>
                  {visible ? number : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Próximos 7 dias
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
          <p className="text-sm text-white/35">
            Sem compromissos registados. Os trabalhos e tarefas com data vão aparecer aqui.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
