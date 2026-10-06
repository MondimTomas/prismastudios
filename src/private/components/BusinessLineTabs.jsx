import { NavLink } from "react-router-dom";

export default function BusinessLineTabs({ line, activeSection = "overview" }) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-1 mb-8">
      <div className="flex min-w-max gap-1 px-1">
        {line.sections.map((section) => {
          const to =
            section.id === "overview"
              ? `/tomasmondim/ramo/${line.id}`
              : `/tomasmondim/ramo/${line.id}/${section.id}`;

          const active = activeSection === section.id;

          return (
            <NavLink
              key={section.id}
              to={to}
              className={[
                "rounded-xl px-4 py-2 text-sm border transition",
                active
                  ? "border-white/15 bg-white/[0.08] text-white"
                  : "border-transparent text-white/40 hover:text-white hover:bg-white/[0.04]",
              ].join(" ")}
            >
              {section.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
