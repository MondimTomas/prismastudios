import WorkspaceLayout from "../components/WorkspaceLayout";

export default function ClientsPage() {
  return (
    <WorkspaceLayout title="Clientes" eyebrow="Gestão transversal">
      <div className="max-w-3xl">
        <p className="text-white/45">
          Os clientes são partilhados entre ramos. Um mesmo cliente pode comprar Futebol,
          Conteúdo, Redes Sociais ou Eventos sem ser duplicado.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.18em] text-white/25">
          <span className="col-span-2">Cliente</span>
          <span>Ramos</span>
          <span>Valor total</span>
          <span>Último contacto</span>
        </div>
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-white/35">Ainda não existem clientes no workspace.</p>
          <p className="text-xs text-white/20 mt-2">
            Quando uma lead for ganha, poderá ser associada ou convertida num cliente.
          </p>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mt-5">
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Relação
          </p>
          <h2 className="font-semibold mt-1">Histórico de atividade</h2>
          <p className="text-sm text-white/35 leading-relaxed mt-4">
            Cada cliente terá uma timeline com contactos, propostas, trabalhos,
            entregas e pagamentos, independentemente do ramo.
          </p>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Cross-selling
          </p>
          <h2 className="font-semibold mt-1">Mais do que um ramo</h2>
          <p className="text-sm text-white/35 leading-relaxed mt-4">
            O sistema vai permitir ver rapidamente que clientes já compram mais do que
            um serviço e onde existem oportunidades para vender outro ramo.
          </p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
