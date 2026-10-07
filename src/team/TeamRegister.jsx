import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { skillOptions, transportOptions } from "./teamOptions";

const initialForm = {
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

export default function TeamRegister() {
  const [form, setForm] = useState(initialForm);
  const [skills, setSkills] = useState(["photo_football"]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [error, setError] = useState("");

  function toggleSkill(id) {
    setSkills((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: signupError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: {
          workspace_context: "prisma_collaborator",
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          city: form.city.trim(),
          instagram: form.instagram.trim(),
          portfolio_url: form.portfolio_url.trim(),
          transport_mode: form.transport_mode,
          can_travel: form.can_travel,
          travel_radius_km: form.travel_radius_km,
          equipment: {
            camera: form.camera.trim(),
            lenses: form.lenses.trim(),
            lighting_audio: form.lighting_audio.trim(),
            drone: form.drone.trim(),
            other: form.other_gear.trim(),
          },
          skills,
          availability_notes: form.availability_notes.trim(),
        },
      },
    });

    setLoading(false);

    if (signupError) {
      setError(signupError.message);
      return;
    }

    setNeedsConfirmation(!data.session);
    setDone(true);
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#151515] text-white flex items-center justify-center px-6">
        <div className="max-w-lg rounded-3xl border border-white/10 bg-white/[0.025] p-8 text-center">
          <div className="text-3xl">✓</div>
          <h1 className="text-2xl font-semibold mt-4">Registo recebido</h1>
          <p className="text-white/45 mt-3 leading-relaxed">
            {needsConfirmation
              ? "Confirma o email que recebeste. Depois poderás entrar na área da equipa; o acesso aos trabalhos fica pendente até aprovação."
              : "A tua conta foi criada. O acesso aos trabalhos fica pendente até aprovação."}
          </p>
          <Link to="/equipa/login" className="inline-flex mt-6 rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515]">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#151515] text-white px-5 py-10 sm:py-14">
      <form onSubmit={submit} className="max-w-4xl mx-auto">
        <div className="mb-9">
          <p className="text-[#B89A84] text-sm uppercase tracking-[0.3em]">Prisma Studios</p>
          <h1 className="text-4xl sm:text-5xl font-semibold mt-3">Registo de colaborador</h1>
          <p className="text-white/40 mt-4 max-w-2xl">
            Estes dados ajudam-nos a perceber que trabalhos te podemos atribuir agora e noutras áreas no futuro.
          </p>
        </div>

        <Section title="Contacto">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome completo"><input required value={form.full_name} onChange={(e) => setForm({...form, full_name:e.target.value})} className={inputClass} /></Field>
            <Field label="Telemóvel"><input required value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} className={inputClass} /></Field>
            <Field label="Email"><input required type="email" value={form.email} onChange={(e) => setForm({...form, email:e.target.value})} className={inputClass} /></Field>
            <Field label="Palavra-passe"><input required minLength={8} type="password" value={form.password} onChange={(e) => setForm({...form, password:e.target.value})} className={inputClass} /></Field>
            <Field label="Zona / cidade"><input value={form.city} onChange={(e) => setForm({...form, city:e.target.value})} placeholder="Ex.: Setúbal" className={inputClass} /></Field>
            <Field label="Instagram"><input value={form.instagram} onChange={(e) => setForm({...form, instagram:e.target.value})} placeholder="@utilizador" className={inputClass} /></Field>
            <div className="sm:col-span-2"><Field label="Portfólio / site"><input value={form.portfolio_url} onChange={(e) => setForm({...form, portfolio_url:e.target.value})} placeholder="https://..." className={inputClass} /></Field></div>
          </div>
        </Section>

        <Section title="Material">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Câmara(s)"><input value={form.camera} onChange={(e) => setForm({...form, camera:e.target.value})} placeholder="Ex.: Sony A7 IV" className={inputClass} /></Field>
            <Field label="Lentes"><input value={form.lenses} onChange={(e) => setForm({...form, lenses:e.target.value})} placeholder="Ex.: 24-70, 70-200" className={inputClass} /></Field>
            <Field label="Iluminação / áudio"><input value={form.lighting_audio} onChange={(e) => setForm({...form, lighting_audio:e.target.value})} className={inputClass} /></Field>
            <Field label="Drone"><input value={form.drone} onChange={(e) => setForm({...form, drone:e.target.value})} placeholder="Modelo, se tiveres" className={inputClass} /></Field>
            <div className="sm:col-span-2"><Field label="Outro material"><textarea rows={3} value={form.other_gear} onChange={(e) => setForm({...form, other_gear:e.target.value})} className={inputClass} /></Field></div>
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
              <select value={form.transport_mode} onChange={(e) => setForm({...form, transport_mode:e.target.value})} className={inputClass}>
                {transportOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}
              </select>
            </Field>
            <Field label="Raio habitual de deslocação (km)">
              <input type="number" min="0" value={form.travel_radius_km} onChange={(e) => setForm({...form, travel_radius_km:e.target.value})} className={inputClass} />
            </Field>
            <label className="sm:col-span-2 flex items-center gap-3 text-sm text-white/60">
              <input type="checkbox" checked={form.can_travel} onChange={(e) => setForm({...form, can_travel:e.target.checked})} className="accent-[#B89A84]" />
              Tenho disponibilidade para deslocações quando combinadas previamente.
            </label>
            <div className="sm:col-span-2"><Field label="Disponibilidade / observações"><textarea rows={3} value={form.availability_notes} onChange={(e) => setForm({...form, availability_notes:e.target.value})} placeholder="Ex.: fins de semana, horários, limitações..." className={inputClass} /></Field></div>
          </div>
        </Section>

        {error && <p className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</p>}

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link to="/equipa/login" className="text-sm text-white/35 hover:text-white">Já tenho conta</Link>
          <button disabled={loading} className="rounded-xl bg-[#B89A84] px-6 py-3.5 font-semibold text-[#151515] disabled:opacity-50">
            {loading ? "A criar registo..." : "Enviar registo"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return <label className="block"><span className="block text-xs text-white/45 mb-2">{label}</span>{children}</label>;
}

function Section({ title, children }) {
  return <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6 mb-5"><h2 className="font-semibold mb-5">{title}</h2>{children}</section>;
}
