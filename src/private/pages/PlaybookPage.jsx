import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";

export default function PlaybookPage() {
  return (
    <WorkspaceLayout title="Playbook" eyebrow="Processos & aprendizagem">
      <p className="text-white/45 max-w-3xl">
        Aqui transformamos experiência em processo: SOPs, mensagens comerciais,
        checklists, pricing, objeções e aprendizagens por ramo.
      </p>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {businessLines.map((line) => (
          <Link
            key={line.id}
            to={`/tomasmondim/ramo/${line.id}`}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 hover:bg-white/[0.045] transition"
          >
            <div className="text-2xl">{line.icon}</div>
            <h2 className="font-semibold mt-5">{line.name}</h2>
            <p className="text-sm text-white/35 mt-2">
              SOPs e processos específicos deste ramo.
            </p>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
          Conhecimento transversal
        </p>
        <h2 className="font-semibold mt-1">Biblioteca comum</h2>

        <div className="grid md:grid-cols-3 gap-3 mt-5">
          {["Vendas & follow-up", "Gestão de clientes", "Lições aprendidas"].map(
            (item) => (
              <div
                key={item}
                className="rounded-xl border border-white/[0.06] px-4 py-5 text-sm text-white/45"
              >
                {item}
              </div>
            )
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}
