import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { businessLines } from "../workspaceData";
import GlobalCreateMenu from "./GlobalCreateMenu";

function navClass({ isActive }) {
  return [
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
    isActive
      ? "bg-white/[0.08] text-white"
      : "text-white/50 hover:text-white hover:bg-white/[0.04]",
  ].join(" ");
}

export default function WorkspaceLayout({ children, title, eyebrow, actions }) {
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/tomasmondim/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 border-r border-white/[0.07] bg-[#121212] px-4 py-6 flex-col">
        <div className="px-3 mb-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[#B89A84]">
            Prisma Studios
          </p>
          <p className="font-semibold mt-2">Tomás Workspace</p>
        </div>

        <nav className="space-y-1">
          <NavLink to="/tomasmondim" end className={navClass}>
            <span>◫</span>
            <span>Visão Geral</span>
          </NavLink>

          <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-[0.22em] text-white/25">
            Ramos
          </div>

          {businessLines.map((line) => (
            <NavLink
              key={line.id}
              to={`/tomasmondim/ramo/${line.id}`}
              className={navClass}
            >
              <span>{line.icon}</span>
              <span>{line.name}</span>
            </NavLink>
          ))}

          <div className="pt-5 pb-2 px-3 text-[10px] uppercase tracking-[0.22em] text-white/25">
            Gestão
          </div>

          <NavLink to="/tomasmondim/trabalhos" className={navClass}>
            <span>▣</span>
            <span>Trabalhos</span>
          </NavLink>
          <NavLink to="/tomasmondim/clientes" className={navClass}>
            <span>◎</span>
            <span>Clientes</span>
          </NavLink>
          <NavLink to="/tomasmondim/equipa" className={navClass}>
            <span>♙</span>
            <span>Equipa</span>
          </NavLink>
          <NavLink to="/tomasmondim/tarefas" className={navClass}>
            <span>✓</span>
            <span>Tarefas</span>
          </NavLink>
          <NavLink to="/tomasmondim/calendario" className={navClass}>
            <span>□</span>
            <span>Calendário</span>
          </NavLink>
          <NavLink to="/tomasmondim/financeiro" className={navClass}>
            <span>€</span>
            <span>Financeiro</span>
          </NavLink>
          <NavLink to="/tomasmondim/playbook" className={navClass}>
            <span>▤</span>
            <span>Playbook</span>
          </NavLink>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white hover:bg-white/[0.04] transition"
          >
            Terminar sessão
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-white/[0.07] bg-[#151515]/90 backdrop-blur-xl">
          <div className="max-w-[1500px] mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.25em] text-[#B89A84] lg:hidden">
                Tomás Workspace
              </p>
              {eyebrow && (
                <p className="hidden lg:block text-[10px] uppercase tracking-[0.22em] text-white/30">
                  {eyebrow}
                </p>
              )}
              <h1 className="font-semibold text-xl sm:text-2xl truncate mt-0.5">
                {title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {actions}
              <GlobalCreateMenu />
            </div>
          </div>

          <div className="lg:hidden overflow-x-auto scrollbar-hide border-t border-white/[0.05]">
            <div className="flex gap-1 px-4 py-2 min-w-max">
              <NavLink to="/tomasmondim" end className={navClass}>
                Visão Geral
              </NavLink>
              {businessLines.map((line) => (
                <NavLink
                  key={line.id}
                  to={`/tomasmondim/ramo/${line.id}`}
                  className={navClass}
                >
                  {line.icon} {line.name}
                </NavLink>
              ))}
              <NavLink to="/tomasmondim/trabalhos" className={navClass}>
                Trabalhos
              </NavLink>
              <NavLink to="/tomasmondim/clientes" className={navClass}>
                Clientes
              </NavLink>
              <NavLink to="/tomasmondim/equipa" className={navClass}>
                Equipa
              </NavLink>
              <NavLink to="/tomasmondim/tarefas" className={navClass}>
                Tarefas
              </NavLink>
              <NavLink to="/tomasmondim/calendario" className={navClass}>
                Calendário
              </NavLink>
              <NavLink to="/tomasmondim/financeiro" className={navClass}>
                Financeiro
              </NavLink>
              <NavLink to="/tomasmondim/playbook" className={navClass}>
                Playbook
              </NavLink>
            </div>
          </div>
        </header>

        <main className="max-w-[1500px] mx-auto px-5 sm:px-8 py-7 sm:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
