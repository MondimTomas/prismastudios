// src/components/PortfolioSwitch.jsx
import { useMemo } from "react";

const TABS = [
  { key: "video", label: "Vídeo" },
  { key: "foto",  label: "Fotografia" },
  { key: "web",   label: "Web & Socials" },
];

export default function PortfolioSwitch({ value, onChange }) {
  const activeIndex = useMemo(
    () => Math.max(0, TABS.findIndex(t => t.key === value)),
    [value]
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* trilho */}
      <div className="relative rounded-full bg-[#EBEBEB] p-1 ring-2 ring-white shadow-[0_4px_20px_rgba(0,0,0,.15)] overflow-hidden">
        {/* indicador (pill preto) */}
        <div
          className="absolute top-1 bottom-1 left-1 rounded-full bg-black transition-transform duration-300 ease-out will-change-transform"
          style={{
            width: "calc((100% - 0.5rem) / 3)",        // p-1 = 0.25rem por lado → total 0.5rem
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          aria-hidden="true"
        />
        {/* botões */}
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
                  text-[11px] sm:text-xs md:text-sm
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
