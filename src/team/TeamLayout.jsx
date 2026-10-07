import { NavLink, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

function navClass({ isActive }) {
  return isActive
    ? "rounded-xl bg-white/[0.08] px-4 py-2 text-sm text-white"
    : "rounded-xl px-4 py-2 text-sm text-white/45 hover:text-white hover:bg-white/[0.04] transition";
}

export default function TeamLayout({
  children,
  title,
  eyebrow = "Equipa Prisma",
  previewMode = false,
}) {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams();
  const base = "/tomasmondim/" + workspaceSlug;
  const previewQuery = previewMode ? "?preview=1" : "";

  async function logout() {
    if (previewMode) {
      navigate("/tomasmondim/admin/equipa");
      return;
    }

    await supabase.auth.signOut();
    navigate("/tomasmondim/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white">
      <header className="border-b border-white/[0.07] bg-[#121212]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] text-[#B89A84]">
              Prisma Studios
            </p>
            <h1 className="text-xl font-semibold mt-1">{title}</h1>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto">
            <NavLink to={base + previewQuery} end className={navClass}>Trabalhos</NavLink>
            <NavLink to={base + "/perfil" + previewQuery} className={navClass}>Perfil</NavLink>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl px-4 py-2 text-sm text-white/35 hover:text-white transition"
            >
              {previewMode ? "Voltar ao admin" : "Sair"}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-8 sm:py-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/25 mb-2">{eyebrow}</p>
        {children}
      </main>
    </div>
  );
}
