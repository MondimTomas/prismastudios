// src/components/PortfolioSwitch.jsx
import { useMemo } from "react";

const TABS = [
  { key: "video", label: "Vídeo" },
  { key: "foto",  label: "Fotografia" },
  { key: "web",   label: "Web & Socials" },
];
// Se quiseres exatamente os textos do mock:
// const TABS = [
//   { key: "video", label: "Qualidade Superior" },
//   { key: "foto",  label: "Olhar Artístico" },
//   { key: "web",   label: "Edição e Pós-Produção" },
// ];

export default function PortfolioSwitch({ value, onChange }) {
  const activeIndex = useMemo(
    () => Math.max(0, TABS.findIndex(t => t.key === value)),
    [value]
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Trilho claro com borda branca e cantos bem arredondados */}
      <div className="relative rounded-full bg-[#EBEBEB] p-1 ring-2 ring-white shadow-[0_4px_20px_rgba(0,0,0,.15)]">
        {/* Indicador deslizante PRETO */}
        <div
          className="absolute top-1 bottom-1 left-1 rounded-full bg-black transition-transform duration-300 ease-out"
          style={{
            width: "calc(33.333% - 0.5rem)", // 3 opções, respeitando o padding do trilho
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          aria-hidden="true"
        />
        {/* Botões (texto por cima do indicador) */}
        <div className="relative grid grid-cols-3">
          {TABS.map((tab) => {
            const active = tab.key === value;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(tab.key)}
                className={`z-10 h-10 md:h-12 px-4 rounded-full font-semibold uppercase tracking-wide
                  ${active ? "text-white" : "text-gray-500"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
