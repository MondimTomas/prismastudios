import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        navigate("/tomasmondim", { replace: true });
      } else {
        setCheckingSession(false);
      }
    });
  }, [navigate]);

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (loginError) {
      setError("Email ou palavra-passe incorretos.");
      return;
    }

    const target = location.state?.from || "/tomasmondim";
    navigate(target, { replace: true });
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center">
        <div className="text-sm text-white/50">A validar sessão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-10">
          <p className="text-[#B89A84] text-sm uppercase tracking-[0.32em] mb-3">
            Prisma Studios
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Tomás Workspace
          </h1>
          <p className="text-white/45 mt-4">
            Área privada de gestão comercial e operacional.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-white/65 text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none transition focus:border-[#B89A84]/70 focus:bg-white/[0.07]"
            />
          </div>

          <div>
            <label className="block text-white/65 text-sm mb-2">
              Palavra-passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none transition focus:border-[#B89A84]/70 focus:bg-white/[0.07]"
            />
          </div>

          {error && (
            <p className="text-red-300 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#B89A84] text-[#151515] font-semibold rounded-2xl py-3.5 transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? "A entrar..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
