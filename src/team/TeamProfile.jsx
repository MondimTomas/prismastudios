import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TeamLayout from "./TeamLayout";
import { skillOptions, transportOptions } from "./teamOptions";
import { supabase } from "../lib/supabase";

export default function TeamProfile() {
  const { workspaceSlug } = useParams();
  const location = useLocation();
  const previewMode = new URLSearchParams(location.search).get("preview") === "1";
  const [form, setForm] = useState(null);
  const [skills, setSkills] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function load() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      let targetUserId = userData.user.id;

      if (previewMode) {
        const { data: member } = await supabase
          .from("workspace_members")
          .select("user_id")
          .eq("workspace_slug", workspaceSlug)
          .eq("role", "collaborator")
          .maybeSingle();

        if (!member) return;
        targetUserId = member.user_id;
      }

      const { data } = await supabase
        .from("collaborator_profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .maybeSingle();

      if (!data) return;
      setForm({
        ...data,
        equipment: data.equipment || {},
      });
      setSkills(data.skills || []);
    }
    load();
  }, [previewMode, workspaceSlug]);

  function toggleSkill(id) {
    setSkills((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current,id]);
  }

  function setEquipment(key, value) {
    setForm((current) => ({...current, equipment:{...(current.equipment || {}), [key]:value}}));
  }

  async function save(event) {
    event.preventDefault();

    if (previewMode) {
      setMessage("Pré-visualização: nenhuma alteração foi guardada.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("collaborator_profiles")
      .update({
        full_name: form.full_name,
        phone: form.phone || null,
        city: form.city || null,
        instagram: form.instagram || null,
        portfolio_url: form.portfolio_url || null,
        transport_mode: form.transport_mode || null,
        can_travel: Boolean(form.can_travel),
        travel_radius_km: form.travel_radius_km === "" || form.travel_radius_km === null ? null : Number(form.travel_radius_km),
        equipment: form.equipment || {},
        skills,
        availability_notes: form.availability_notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", form.user_id);

    setSaving(false);
    setMessage(error ? error.message : "Perfil atualizado.");
  }

  if (!form) {
    return <TeamLayout title="Perfil" previewMode={previewMode}><div className="py-20 text-center text-sm text-white/30">A carregar...</div></TeamLayout>;
  }

  return (
    <TeamLayout title="O meu perfil" eyebrow="Dados de colaboração" previewMode={previewMode}>
      <form onSubmit={save} className="space-y-5">
        <Card title="Contacto">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nome"><input value={form.full_name || ""} onChange={(e)=>setForm({...form,full_name:e.target.value})} className={inputClass} /></Field>
            <Field label="Email"><input value={form.email || ""} disabled className={inputClass + " opacity-50"} /></Field>
            <Field label="Telemóvel"><input value={form.phone || ""} onChange={(e)=>setForm({...form,phone:e.target.value})} className={inputClass} /></Field>
            <Field label="Cidade"><input value={form.city || ""} onChange={(e)=>setForm({...form,city:e.target.value})} className={inputClass} /></Field>
            <Field label="Instagram"><input value={form.instagram || ""} onChange={(e)=>setForm({...form,instagram:e.target.value})} className={inputClass} /></Field>
            <Field label="Portfólio"><input value={form.portfolio_url || ""} onChange={(e)=>setForm({...form,portfolio_url:e.target.value})} className={inputClass} /></Field>
          </div>
        </Card>

        <Card title="Material">
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              ["camera","Câmara(s)"],
              ["lenses","Lentes"],
              ["lighting_audio","Iluminação / áudio"],
              ["drone","Drone"],
            ].map(([key,label]) => (
              <Field key={key} label={label}><input value={form.equipment?.[key] || ""} onChange={(e)=>setEquipment(key,e.target.value)} className={inputClass} /></Field>
            ))}
            <div className="sm:col-span-2"><Field label="Outro material"><textarea rows={3} value={form.equipment?.other || ""} onChange={(e)=>setEquipment("other",e.target.value)} className={inputClass} /></Field></div>
          </div>
        </Card>

        <Card title="Áreas">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {skillOptions.map((skill) => (
              <label key={skill.id} className="flex items-center gap-3 rounded-xl border border-white/[0.08] px-4 py-3">
                <input type="checkbox" checked={skills.includes(skill.id)} onChange={()=>toggleSkill(skill.id)} className="accent-[#B89A84]" />
                <span className="text-sm text-white/60">{skill.label}</span>
              </label>
            ))}
          </div>
        </Card>

        <Card title="Deslocações">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Transporte">
              <select value={form.transport_mode || ""} onChange={(e)=>setForm({...form,transport_mode:e.target.value})} className={inputClass}>
                <option value="">—</option>
                {transportOptions.map((item)=><option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Raio habitual (km)"><input type="number" min="0" value={form.travel_radius_km ?? ""} onChange={(e)=>setForm({...form,travel_radius_km:e.target.value})} className={inputClass} /></Field>
            <label className="sm:col-span-2 flex items-center gap-3 text-sm text-white/55"><input type="checkbox" checked={Boolean(form.can_travel)} onChange={(e)=>setForm({...form,can_travel:e.target.checked})} className="accent-[#B89A84]" />Disponível para deslocações combinadas previamente</label>
            <div className="sm:col-span-2"><Field label="Disponibilidade / observações"><textarea rows={3} value={form.availability_notes || ""} onChange={(e)=>setForm({...form,availability_notes:e.target.value})} className={inputClass} /></Field></div>
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4">
          {message && <span className="text-sm text-white/40">{message}</span>}
          <button
            disabled={saving || previewMode}
            className="rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515] disabled:opacity-50"
          >
            {previewMode ? "Pré-visualização" : saving ? "A guardar..." : "Guardar perfil"}
          </button>
        </div>
      </form>
    </TeamLayout>
  );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 py-3 text-sm text-white outline-none focus:border-[#B89A84]/60";
function Field({label,children}) { return <label className="block"><span className="block text-xs text-white/40 mb-2">{label}</span>{children}</label>; }
function Card({title,children}) { return <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"><h2 className="font-semibold mb-5">{title}</h2>{children}</section>; }
