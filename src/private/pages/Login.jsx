import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { skillOptions, transportOptions } from "../../team/teamOptions";

const emptyRegistration = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  instagram: "",
  portfolio_url: "",
  transport_mode: "car",
  can_travel: true,
  travel_radius_km: "",
  camera: "",
  lenses: "",
  lighting_audio: "",
  drone: "",
  other_gear: "",
  availability_notes: "",
};

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("modo") === "registo" ? "register" : "login";

  const [mode, setMode] = useState(initialMode);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registration, setRegistration] = useState(emptyRegistration);
  const [skills, setSkills] = useState(["photo_football"]);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [error, setError] = useState("");
  const [registrationDone, setRegistrationDone] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        setCheckingSession(false);
        return;
      }
      await redirectUser(data.session.user.id);
    });
  }, []);

  async function redirectUser(userId) {
    const { data: member } = await supabase
      .from("workspace_members")
      .select("role,workspace_slug")
      .eq("user_id", userId)
      .maybeSingle();

    setCheckingSession(false);

    if (member?.role === "owner") {
      navigate("/tomasmondim/admin", { replace: true });
      return;
    }

    if (member?.role === "collaborator" && member.workspace_slug) {
      navigate("/tomasmondim/" + member.workspace_slug, { replace: true });
    }
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setRegistrationDone(false);

    const next = new URLSearchParams(searchParams);
    if (nextMode === "register") next.set("modo", "registo");
    else next.delete("modo");
    setSearchParams(next, { replace: true });
  }

  function toggleSkill(id) {
    setSkills((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: loginForm.email.trim(),
      password: loginForm.password,
    });

    if (loginError) {
      setLoading(false);
      setError("Email ou palavra-passe incorretos.");
      return;
    }

    const { data: member } = await supabase
      .from("workspace_members")
      .select("role,workspace_slug")
      .eq("user_id", data.user.id)
      .maybeSingle();

    setLoading(false);

    if (member?.role === "owner") {
      navigate("/tomasmondim/admin", { replace: true });
      return;
    }

    if (member?.role === "collaborator" && member.workspace_slug) {
      navigate("/tomasmondim/" + member.workspace_slug, { replace: true });
      return;
    }

    await supabase.auth.signOut();
    setError("Esta conta não está associada a um workspace Prisma.");
  }

  async function handleRegister(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signupError } = await supabase.auth.signUp({
      email: registration.email.trim(),
      password: registration.password,
      options: {
        data: {
          workspace_context: "prisma_collaborator",
          full_name: registration.full_name.trim(),
          phone: registration.phone.trim(),
          city: registration.city.trim(),
          instagram: registration.instagram.trim(),
          portfolio_url: registration.portfolio_url.trim(),
          transport_mode: registration.transport_mode,
          can_travel: registration.can_travel,
          travel_radius_km: registration.travel_radius_km,
          equipment: {
            camera: registration.camera.trim(),
            lenses: registration.lenses.trim(),
            lighting_audio: registration.lighting_audio.trim(),
            drone: registration.drone.trim(),
            other: registration.other_gear.trim(),
          },
          skills,
          availability_notes: registration.availability_notes.trim(),
        },
      },
    });

    if (signupError) {
      setLoading(false);
      setError(signupError.message);
      return;
    }

    setNeedsConfirmation(!data.session);
    setRegistrationDone(true);

    if (data.session && data.user) {
      await redirectUser(data.user.id);
    }

    setLoading(false);
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center">
        <div className="text-sm text-white/50">A validar sessão...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white px-5 py-10 sm:py-14">
      <div className={mode === "login" ? "w-full max-w-md mx-auto" : "w-full max-w-4xl mx-auto"}>
        <div className="mb-8">
          <p className="text-[#B89A84] text-sm uppercase tracking-[0.32em] mb-3">
            Prisma Studios
          </p>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
            Workspace Prisma
          </h1>
          <p className="text-white/45 mt-4">
            Um único acesso para administração e colaboradores.
          </p>
        </div>

        <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/[0.025] p-1 mb-7">
          <button
            type="button"
            onClick={() => changeMode("login")}
            className={
              mode === "login"
                ? "rounded-xl bg-white text-[#151515] py-3 text-sm font-semibold"
                : "rounded-xl py-3 text-sm text-white/45 hover:text-white"
            }
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => changeMode("register")}
            className={
              mode === "register"
                ? "rounded-xl bg-white text-[#151515] py-3 text-sm font-semibold"
                : "rounded-xl py-3 text-sm text-white/45 hover:text-white"
            }
          >
            Registar
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="space-y-5">
            <Field label="Email">
              <input
                type="email"
                value={loginForm.email}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, email: event.target.value })
                }
                required
                autoComplete="email"
                className={inputClass}
              />
            </Field>

            <Field label="Palavra-passe">
              <input
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({ ...loginForm, password: event.target.value })
                }
                required
                autoComplete="current-password"
                className={inputClass}
              />
            </Field>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#B89A84] text-[#151515] font-semibold rounded-2xl py-3.5 transition hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "A entrar..." : "Entrar"}
            </button>
          </form>
        ) : registrationDone ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center">
            <div className="text-3xl">✓</div>
            <h2 className="text-2xl font-semibold mt-4">Registo recebido</h2>
            <p className="text-white/45 mt-3 leading-relaxed">
              {needsConfirmation
                ? "Confirma o email que recebeste. Depois podes entrar aqui com a tua conta; os trabalhos ficam disponíveis depois da aprovação do administrador."
                : "A tua conta foi criada. Os trabalhos ficam disponíveis depois da aprovação do administrador."}
            </p>
            <button
              type="button"
              onClick={() => changeMode("login")}
              className="mt-6 rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515]"
            >
              Ir para login
            </button>
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-5">
            <Section title="Dados pessoais">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nome completo">
                  <input required value={registration.full_name} onChange={(e) => setRegistration({...registration, full_name:e.target.value})} className={inputClass} />
                </Field>
                <Field label="Telemóvel">
                  <input required value={registration.phone} onChange={(e) => setRegistration({...registration, phone:e.target.value})} className={inputClass} />
                </Field>
                <Field label="Email">
                  <input required type="email" value={registration.email} onChange={(e) => setRegistration({...registration, email:e.target.value})} className={inputClass} />
                </Field>
                <Field label="Palavra-passe">
                  <input required minLength={8} type="password" value={registration.password} onChange={(e) => setRegistration({...registration, password:e.target.value})} className={inputClass} />
                </Field>
                <Field label="Zona / cidade">
                  <input value={registration.city} onChange={(e) => setRegistration({...registration, city:e.target.value})} placeholder="Ex.: Setúbal" className={inputClass} />
                </Field>
                <Field label="Instagram">
                  <input value={registration.instagram} onChange={(e) => setRegistration({...registration, instagram:e.target.value})} placeholder="@utilizador" className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Portfólio / site">
                    <input value={registration.portfolio_url} onChange={(e) => setRegistration({...registration, portfolio_url:e.target.value})} placeholder="https://..." className={inputClass} />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Material">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Câmara(s)">
                  <input value={registration.camera} onChange={(e) => setRegistration({...registration, camera:e.target.value})} placeholder="Ex.: Sony A7 IV" className={inputClass} />
                </Field>
                <Field label="Lentes">
                  <input value={registration.lenses} onChange={(e) => setRegistration({...registration, lenses:e.target.value})} placeholder="Ex.: 24-70, 70-200" className={inputClass} />
                </Field>
                <Field label="Iluminação / áudio">
                  <input value={registration.lighting_audio} onChange={(e) => setRegistration({...registration, lighting_audio:e.target.value})} className={inputClass} />
                </Field>
                <Field label="Drone">
                  <input value={registration.drone} onChange={(e) => setRegistration({...registration, drone:e.target.value})} placeholder="Modelo, se tiveres" className={inputClass} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Outro material">
                    <textarea rows={3} value={registration.other_gear} onChange={(e) => setRegistration({...registration, other_gear:e.target.value})} className={inputClass} />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="Áreas em que gostarias de trabalhar">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {skillOptions.map((skill) => (
                  <label key={skill.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 cursor-pointer">
                    <input type="checkbox" checked={skills.includes(skill.id)} onChange={() => toggleSkill(skill.id)} className="accent-[#B89A84]" />
                    <span className="text-sm text-white/65">{skill.label}</span>
                  </label>
                ))}
              </div>
            </Section>

            <Section title="Deslocações e disponibilidade">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Transporte">
                  <select value={registration.transport_mode} onChange={(e) => setRegistration({...registration, transport_mode:e.target.value})} className={inputClass}>
                    {transportOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
                  </select>
                </Field>
                <Field label="Raio habitual de deslocação (km)">
                  <input type="number" min="0" value={registration.travel_radius_km} onChange={(e) => setRegistration({...registration, travel_radius_km:e.target.value})} className={inputClass} />
                </Field>
                <label className="sm:col-span-2 flex items-center gap-3 text-sm text-white/60">
                  <input type="checkbox" checked={registration.can_travel} onChange={(e) => setRegistration({...registration, can_travel:e.target.checked})} className="accent-[#B89A84]" />
                  Tenho disponibilidade para deslocações quando combinadas previamente.
                </label>
                <div className="sm:col-span-2">
                  <Field label="Disponibilidade / observações">
                    <textarea rows={3} value={registration.availability_notes} onChange={(e) => setRegistration({...registration, availability_notes:e.target.value})} placeholder="Ex.: fins de semana, horários, limitações..." className={inputClass} />
                  </Field>
                </div>
              </div>
            </Section>

            {error && <ErrorMessage>{error}</ErrorMessage>}

            <div className="flex justify-end">
              <button
                disabled={loading}
                className="rounded-xl bg-[#B89A84] px-6 py-3.5 font-semibold text-[#151515] disabled:opacity-50"
              >
                {loading ? "A criar conta..." : "Criar conta"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full bg-white/[0.05] border border-white/10 rounded-2xl px-4 py-3.5 text-white outline-none transition focus:border-[#B89A84]/70 focus:bg-white/[0.07]";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-white/55 text-sm mb-2">{label}</span>
      {children}
    </label>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6">
      <h2 className="font-semibold mb-5">{title}</h2>
      {children}
    </section>
  );
}

function ErrorMessage({ children }) {
  return (
    <p className="text-red-300 text-sm bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
      {children}
    </p>
  );
}
