import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function TeamLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setChecking(false);
        return;
      }

      const { data: member } = await supabase
        .from("workspace_members")
        .select("role")
        .eq("user_id", data.session.user.id)
        .maybeSingle();

      if (member?.role === "owner") navigate("/tomasmondim", { replace: true });
      else if (member?.role === "collaborator") navigate("/equipa", { replace: true });
      else setChecking(false);
    });
  }, [navigate]);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setLoading(false);
      setError("Email ou palavra-passe incorretos.");
      return;
    }

    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("user_id", data.user.id)
      .maybeSingle();

    setLoading(false);

    if (member?.role === "owner") {
      navigate("/tomasmondim", { replace: true });
      return;
    }

    if (member?.role !== "collaborator") {
      await supabase.auth.signOut();
      setError("Esta conta não está associada à Equipa Prisma.");
      return;
    }

    navigate("/equipa", { replace: true });
  }

  if (checking) {
    return <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center text-sm text-white/40">A validar sessão...</div>;
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <p className="text-[#B89A84] text-sm uppercase tracking-[0.3em]">Prisma Studios</p>
        <h1 className="text-4xl font-semibold mt-3">Equipa Prisma</h1>
        <p className="text-white/40 mt-3">Consulta os teus trabalhos, SOPs e dados de colaboração.</p>

        <form onSubmit={submit} className="mt-9 space-y-4">
          <Field label="Email">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} autoComplete="email" />
          </Field>
          <Field label="Palavra-passe">
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} autoComplete="current-password" />
          </Field>
          {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}
          <button disabled={loading} className="w-full rounded-xl bg-[#B89A84] py-3.5 font-semibold text-[#151515] disabled:opacity-50">
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>

        <p className="text-sm text-white/35 mt-6 text-center">
          Ainda não tens conta? <Link to="/equipa/registo" className="text-[#B89A84] hover:text-white">Preencher registo</Link>
        </p>
      </div>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white outline-none focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return <label className="block"><span className="block text-sm text-white/55 mb-2">{label}</span>{children}</label>;
}
