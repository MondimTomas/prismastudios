import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines } from "../workspaceData";
import { supabase } from "../../lib/supabase";

export default function PlaybookPage() {
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSops = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: loadError } = await supabase
      .from("workspace_sops")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
      setSops([]);
    } else {
      setSops(data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadSops();
  }, [loadSops]);

  const byLine = useMemo(
    () =>
      Object.fromEntries(
        businessLines.map((line) => [
          line.id,
          sops.filter((sop) => sop.business_line === line.id),
        ])
      ),
    [sops]
  );

  const generalSops = sops.filter((sop) => !sop.business_line);

  return (
    <WorkspaceLayout title="Playbook" eyebrow="Processos & aprendizagem">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <p className="text-white/45 max-w-3xl">
          SOPs e processos reais do workspace, organizados por ramo e biblioteca comum.
        </p>
        <Link
          to="/tomasmondim/admin/equipa"
          className="text-sm text-[#B89A84] hover:text-white transition"
        >
          Gerir SOPs →
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        {businessLines.map((line) => {
          const lineSops = byLine[line.id] || [];
          const published = lineSops.filter((sop) => sop.is_published).length;

          return (
            <Link
              key={line.id}
              to={`/tomasmondim/admin/ramo/${line.id}/sops`}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 hover:bg-white/[0.045] transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="text-2xl">{line.icon}</div>
                <span className="text-xs text-white/25">
                  {loading ? "…" : lineSops.length}
                </span>
              </div>
              <h2 className="font-semibold mt-5">{line.name}</h2>
              <p className="text-sm text-white/35 mt-2">
                {loading
                  ? "A carregar..."
                  : lineSops.length
                    ? published + " publicados · " + (lineSops.length - published) + " rascunhos"
                    : "Ainda sem SOPs registados."}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">
            Conhecimento transversal
          </p>
          <h2 className="font-semibold mt-1">Biblioteca comum</h2>
        </div>

        <div className="p-5">
          {loading ? (
            <p className="text-sm text-white/30 py-6 text-center">A carregar...</p>
          ) : generalSops.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 px-5 py-10 text-center">
              <p className="text-sm text-white/35">Ainda não existem SOPs gerais.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
              {generalSops.map((sop) => (
                <div
                  key={sop.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-medium text-white/70">{sop.title}</p>
                    <span className={sop.is_published ? "text-[10px] text-emerald-300/60" : "text-[10px] text-white/20"}>
                      {sop.is_published ? "Publicado" : "Rascunho"}
                    </span>
                  </div>
                  <p className="text-xs text-white/30 mt-2 leading-relaxed">
                    {sop.summary || previewText(sop.content)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </WorkspaceLayout>
  );
}

function previewText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return "Sem resumo.";
  return text.length > 150 ? text.slice(0, 147) + "..." : text;
}
