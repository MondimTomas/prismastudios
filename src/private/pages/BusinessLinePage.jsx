import { Navigate, useParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { getBusinessLine } from "../workspaceData";

export default function BusinessLinePage() {
  const { lineId } = useParams();
  const line = getBusinessLine(lineId);

  if (!line) {
    return <Navigate to="/tomasmondim" replace />;
  }

  return (
    <WorkspaceLayout
      title={line.name}
      eyebrow={line.eyebrow}
      actions={
        <button
          type="button"
          className="rounded-xl bg-[#B89A84] px-4 py-2 text-sm font-semibold text-[#151515] opacity-60 cursor-not-allowed"
          title="Ativamos ao ligar a base de dados"
        >
          + Nova lead
        </button>
      }
    >
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-8">
        <div className="max-w-2xl">
          <p className="text-white/45">{line.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Oferta: {line.offer}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Preço: {line.pricing}
          </span>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {line.metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
          >
            <p className="text-sm text-white/40">{metric.label}</p>
            <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
            Pipeline
          </p>
          <h2 className="text-xl font-semibold mt-1">Processo comercial</h2>
        </div>

        <div className="grid md:grid-cols-5 gap-3">
          {line.pipeline.map((stage, index) => (
            <div
              key={stage}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 min-h-[118px]"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-white/30">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/35">
                  0
                </span>
              </div>
              <p className="font-medium mt-6">{stage}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid xl:grid-cols-3 gap-5 mt-10">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Leads
            </p>
            <h2 className="font-semibold mt-1">Oportunidades ativas</h2>
          </div>

          <div className="p-5">
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-12 text-center">
              <p className="text-sm text-white/35">Ainda não existem leads neste ramo.</p>
              <p className="text-xs text-white/20 mt-2">
                Cada ramo terá os seus próprios campos e processo.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
              Estrutura
            </p>
            <h2 className="font-semibold mt-1">Campos específicos</h2>
          </div>

          <div className="p-5 space-y-2">
            {line.fields.map((field) => (
              <div
                key={field}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/50"
              >
                {field}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Playbook
          </p>
          <h2 className="font-semibold mt-1">A preparar neste ramo</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3 p-5">
          {line.nextActions.map((action) => (
            <div
              key={action}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
            >
              <div className="h-5 w-5 rounded-md border border-white/15 mb-4" />
              <p className="text-sm text-white/55">{action}</p>
            </div>
          ))}
        </div>
      </section>
    </WorkspaceLayout>
  );
}
