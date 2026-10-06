import WorkspaceLayout from "../components/WorkspaceLayout";

export default function ClientsPage() {
  return (
    <WorkspaceLayout
      title="Clientes"
      eyebrow="Gestão transversal"
      actions={
        <button
          type="button"
          className="rounded-xl bg-[#B89A84] px-4 py-2 text-sm font-semibold text-[#151515] opacity-60 cursor-not-allowed"
        >
          + Cliente
        </button>
      }
    >
      <div className="max-w-3xl">
        <p className="text-white/45">
          Os clientes são partilhados entre ramos. Um mesmo cliente poderá ter
          trabalhos de Futebol, Conteúdo, Redes Sociais ou Eventos sem ser duplicado.
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="grid grid-cols-4 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.18em] text-white/25">
          <span className="col-span-2">Cliente</span>
          <span>Ramos</span>
          <span>Último contacto</span>
        </div>
        <div className="px-5 py-16 text-center">
          <p className="text-sm text-white/35">Ainda não existem clientes no workspace.</p>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
