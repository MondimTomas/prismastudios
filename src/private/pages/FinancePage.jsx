import WorkspaceLayout from "../components/WorkspaceLayout";

const metrics = [
  ["Receita este mês", "0 €"],
  ["Despesas", "0 €"],
  ["Resultado", "0 €"],
  ["A receber", "0 €"],
];

export default function FinancePage() {
  return (
    <WorkspaceLayout title="Financeiro" eyebrow="Visão de gestão">
      <p className="text-white/45 max-w-3xl">
        Esta área serve para perceber a rentabilidade do negócio e de cada ramo.
        Não substitui faturação nem contabilidade.
      </p>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {metrics.map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"
          >
            <p className="text-sm text-white/40">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mt-8">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Rentabilidade
          </p>
          <h2 className="font-semibold mt-1">Por ramo</h2>
          <div className="mt-8 text-sm text-white/30 text-center py-12">
            Os dados aparecem quando começarmos a registar trabalhos e custos.
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Cobranças
          </p>
          <h2 className="font-semibold mt-1">A receber</h2>
          <div className="mt-8 text-sm text-white/30 text-center py-12">
            Sem pagamentos pendentes.
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
