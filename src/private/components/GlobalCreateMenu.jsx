import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getBusinessLine } from "../workspaceData";

export default function GlobalCreateMenu() {
  const navigate = useNavigate();
  const { lineId } = useParams();
  const line = getBusinessLine(lineId);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (ref.current && !ref.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const items = [
    { label: "Lead", hint: line ? `em ${line.name}` : "escolher ramo" },
    { label: "Cliente", hint: "global" },
    {
      label: "Trabalho",
      hint: line ? `${line.workLabel} · ${line.name}` : "histórico / novo",
      action: () => {
        const query = line ? `?novo=1&ramo=${line.id}` : "?novo=1";
        navigate("/tomasmondim/admin/trabalhos" + query);
      },
    },
    { label: "Tarefa", hint: "follow-up ou execução" },
    { label: "Receita / Despesa", hint: "financeiro" },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl bg-[#B89A84] px-4 py-2 text-sm font-semibold text-[#151515] hover:brightness-110 transition"
      >
        + Novo
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/10 bg-[#1B1B1B] p-2 shadow-2xl z-50">
          {line && (
            <div className="px-3 py-2 mb-1 text-[10px] uppercase tracking-[0.18em] text-white/30">
              Contexto: {line.icon} {line.name}
            </div>
          )}

          {items.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setOpen(false);
                item.action?.();
              }}
              className="w-full rounded-xl px-3 py-3 text-left hover:bg-white/[0.05] transition"
              title="A criação real fica ativa quando ligarmos estas entidades ao Supabase"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-white/80">{item.label}</span>
                <span className="text-[11px] text-white/25">{item.hint}</span>
              </div>
            </button>
          ))}

          <div className="mx-3 mt-2 border-t border-white/[0.06] pt-3 pb-2 text-[11px] leading-relaxed text-white/25">
            O menu já define a estrutura. A gravação dos dados é ativada na próxima fase com o Supabase.
          </div>
        </div>
      )}
    </div>
  );
}
