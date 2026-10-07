import { useCallback, useEffect, useMemo, useState } from "react";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { skillLabel, transportLabel } from "../../team/teamOptions";
import { supabase } from "../../lib/supabase";

const initialAssignment = {
  job_id: "",
  collaborator_user_id: "",
  role: "Fotógrafo",
  fee_amount: "50",
  travel_reimbursement: "0",
  notes: "",
};

const initialSop = {
  business_line: "futebol",
  title: "",
  summary: "",
  content: "",
  is_published: true,
};

export default function TeamManagementPage() {
  const [members, setMembers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [sops, setSops] = useState([]);
  const [assignmentForm, setAssignmentForm] = useState(initialAssignment);
  const [sopForm, setSopForm] = useState(initialSop);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError("");
    const today = dateKey(new Date());

    const [membersResult, profilesResult, jobsResult, assignmentsResult, sopsResult] = await Promise.all([
      supabase.from("workspace_members").select("*").eq("role","collaborator").order("created_at",{ascending:false}),
      supabase.from("collaborator_profiles").select("*").order("created_at",{ascending:false}),
      supabase.from("workspace_jobs").select("id,client_name,title,job_date,status,revenue,business_line").eq("business_line","futebol").gte("job_date",today).in("status",["scheduled","in_progress"]).order("job_date",{ascending:true}),
      supabase.from("collaborator_assignments").select("*, workspace_jobs(id,client_name,title,job_date,status,revenue)").order("created_at",{ascending:false}),
      supabase.from("workspace_sops").select("*").order("sort_order",{ascending:true}).order("created_at",{ascending:false}),
    ]);

    const firstError = membersResult.error || profilesResult.error || jobsResult.error || assignmentsResult.error || sopsResult.error;
    if (firstError) setError(firstError.message);

    setMembers(membersResult.data || []);
    setProfiles(profilesResult.data || []);
    setJobs(jobsResult.data || []);
    setAssignments(assignmentsResult.data || []);
    setSops(sopsResult.data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  const people = useMemo(() => members.map((member) => ({
    ...member,
    profile: profiles.find((profile) => profile.user_id === member.user_id) || {},
  })), [members, profiles]);

  const activePeople = people.filter((person) => person.status === "active");
  const pendingPeople = people.filter((person) => person.status === "pending");

  async function setMemberStatus(userId, status) {
    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      status,
      updated_at: new Date().toISOString(),
      approved_at: status === "active" ? new Date().toISOString() : null,
      approved_by: status === "active" ? userData.user?.id : null,
    };
    const { error: updateError } = await supabase.from("workspace_members").update(payload).eq("user_id",userId);
    if (updateError) setError(updateError.message);
    else await load();
  }

  async function createAssignment(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("collaborator_assignments").insert({
      job_id: assignmentForm.job_id,
      collaborator_user_id: assignmentForm.collaborator_user_id,
      role: assignmentForm.role.trim() || "Fotógrafo",
      fee_amount: Number(assignmentForm.fee_amount || 0),
      travel_reimbursement: Number(assignmentForm.travel_reimbursement || 0),
      notes: assignmentForm.notes.trim() || null,
      created_by: userData.user?.id || null,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setAssignmentForm(initialAssignment);
    await load();
  }

  async function createSop(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const { data: userData } = await supabase.auth.getUser();
    const { error: insertError } = await supabase.from("workspace_sops").insert({
      business_line: sopForm.business_line || null,
      title: sopForm.title.trim(),
      summary: sopForm.summary.trim() || null,
      content: sopForm.content.trim(),
      is_published: sopForm.is_published,
      created_by: userData.user?.id || null,
    });
    setSaving(false);
    if (insertError) setError(insertError.message);
    else {
      setSopForm(initialSop);
      await load();
    }
  }

  async function toggleSop(sop) {
    const { error: updateError } = await supabase.from("workspace_sops").update({is_published:!sop.is_published,updated_at:new Date().toISOString()}).eq("id",sop.id);
    if (updateError) setError(updateError.message);
    else await load();
  }

  return (
    <WorkspaceLayout title="Equipa" eyebrow="Colaboradores">
      <p className="text-white/45 max-w-3xl">
        Gere quem trabalha contigo, o que sabe fazer, os jogos atribuídos, valores e SOPs. A estrutura já é genérica para depois usares também em eventos, vídeo e conteúdo.
      </p>

      {error && <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

      <div className="grid sm:grid-cols-3 gap-4 mt-7">
        <Metric label="Ativos" value={String(activePeople.length)} />
        <Metric label="Por aprovar" value={String(pendingPeople.length)} />
        <Metric label="Atribuições abertas" value={String(assignments.filter((item)=>["assigned","accepted"].includes(item.status)).length)} />
      </div>

      <Section eyebrow="Registos" title="Candidaturas pendentes">
        {pendingPeople.length === 0 ? <Empty>Sem registos pendentes.</Empty> : (
          <div className="grid xl:grid-cols-2 gap-4">
            {pendingPeople.map((person)=><PersonCard key={person.user_id} person={person} action={<button onClick={()=>setMemberStatus(person.user_id,"active")} className="rounded-lg bg-[#B89A84] px-3 py-2 text-xs font-semibold text-[#151515]">Aprovar</button>} />)}
          </div>
        )}
      </Section>

      <Section eyebrow="Rede" title="Colaboradores ativos">
        {activePeople.length === 0 ? <Empty>Ainda não tens colaboradores aprovados.</Empty> : (
          <div className="grid xl:grid-cols-2 gap-4">
            {activePeople.map((person)=><PersonCard key={person.user_id} person={person} action={<button onClick={()=>setMemberStatus(person.user_id,"inactive")} className="text-xs text-white/30 hover:text-red-300">Desativar</button>} />)}
          </div>
        )}
      </Section>

      <Section eyebrow="Futebol" title="Atribuir jogo">
        <form onSubmit={createAssignment} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 grid lg:grid-cols-2 gap-4">
          <Field label="Jogo">
            <select required value={assignmentForm.job_id} onChange={(e)=>setAssignmentForm({...assignmentForm,job_id:e.target.value})} className={inputClass}>
              <option value="">Escolher trabalho...</option>
              {jobs.map((job)=><option key={job.id} value={job.id}>{formatDate(job.job_date)} — {job.client_name} — {job.title}</option>)}
            </select>
          </Field>
          <Field label="Colaborador">
            <select required value={assignmentForm.collaborator_user_id} onChange={(e)=>setAssignmentForm({...assignmentForm,collaborator_user_id:e.target.value})} className={inputClass}>
              <option value="">Escolher pessoa...</option>
              {activePeople.map((person)=><option key={person.user_id} value={person.user_id}>{person.profile.full_name || person.profile.email}</option>)}
            </select>
          </Field>
          <Field label="Função"><input value={assignmentForm.role} onChange={(e)=>setAssignmentForm({...assignmentForm,role:e.target.value})} className={inputClass} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fee (€)"><input type="number" min="0" step="0.01" value={assignmentForm.fee_amount} onChange={(e)=>setAssignmentForm({...assignmentForm,fee_amount:e.target.value})} className={inputClass} /></Field>
            <Field label="Deslocação (€)"><input type="number" min="0" step="0.01" value={assignmentForm.travel_reimbursement} onChange={(e)=>setAssignmentForm({...assignmentForm,travel_reimbursement:e.target.value})} className={inputClass} /></Field>
          </div>
          <div className="lg:col-span-2"><Field label="Notas para o colaborador"><textarea rows={3} value={assignmentForm.notes} onChange={(e)=>setAssignmentForm({...assignmentForm,notes:e.target.value})} placeholder="Hora de chegada, ponto de encontro, pedidos específicos..." className={inputClass} /></Field></div>
          <div className="lg:col-span-2 flex justify-end"><button disabled={saving || !jobs.length || !activePeople.length} className="rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515] disabled:opacity-30">Atribuir trabalho</button></div>
        </form>

        <div className="mt-4 space-y-2">
          {assignments.slice(0,12).map((assignment)=>{
            const person = people.find((item)=>item.user_id===assignment.collaborator_user_id);
            const job = assignment.workspace_jobs;
            return <div key={assignment.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div><p className="text-sm text-white/70">{job?.client_name} · {job?.title}</p><p className="text-xs text-white/30 mt-1">{formatDate(job?.job_date)} · {person?.profile?.full_name || "Colaborador"} · {assignment.status}</p></div>
              <p className="text-sm font-medium">{money(Number(assignment.fee_amount||0)+Number(assignment.travel_reimbursement||0))}</p>
            </div>;
          })}
        </div>
      </Section>

      <Section eyebrow="Playbook da equipa" title="SOPs">
        <div className="grid xl:grid-cols-[1fr_1.2fr] gap-5">
          <form onSubmit={createSop} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 space-y-4">
            <Field label="Área"><select value={sopForm.business_line} onChange={(e)=>setSopForm({...sopForm,business_line:e.target.value})} className={inputClass}><option value="">Geral</option><option value="futebol">Futebol</option><option value="eventos">Eventos</option><option value="conteudo">Conteúdo</option><option value="redes-sociais">Redes Sociais</option></select></Field>
            <Field label="Título"><input required value={sopForm.title} onChange={(e)=>setSopForm({...sopForm,title:e.target.value})} className={inputClass} /></Field>
            <Field label="Resumo"><input value={sopForm.summary} onChange={(e)=>setSopForm({...sopForm,summary:e.target.value})} className={inputClass} /></Field>
            <Field label="Conteúdo"><textarea required rows={8} value={sopForm.content} onChange={(e)=>setSopForm({...sopForm,content:e.target.value})} placeholder={"Antes do jogo:\n- ...\n\nDurante:\n- ...\n\nEntrega:\n- ..."} className={inputClass} /></Field>
            <label className="flex items-center gap-3 text-sm text-white/50"><input type="checkbox" checked={sopForm.is_published} onChange={(e)=>setSopForm({...sopForm,is_published:e.target.checked})} className="accent-[#B89A84]" />Publicar imediatamente</label>
            <button disabled={saving} className="rounded-xl bg-[#B89A84] px-5 py-3 text-sm font-semibold text-[#151515]">Guardar SOP</button>
          </form>

          <div className="space-y-3">
            {sops.length===0 ? <Empty>Ainda não existem SOPs da equipa.</Empty> : sops.map((sop)=><div key={sop.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-[#B89A84]">{sop.business_line || "Geral"}</p><h3 className="font-semibold mt-1">{sop.title}</h3>{sop.summary&&<p className="text-sm text-white/35 mt-2">{sop.summary}</p>}</div><button onClick={()=>toggleSop(sop)} className="text-xs text-white/35 hover:text-white">{sop.is_published?"Publicado":"Rascunho"}</button></div>
            </div>)}
          </div>
        </div>
      </Section>
    </WorkspaceLayout>
  );
}

function PersonCard({person,action}) {
  const profile=person.profile || {};
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
    <div className="flex items-start justify-between gap-4"><div><h3 className="font-semibold">{profile.full_name || profile.email || "Sem nome"}</h3><p className="text-xs text-white/30 mt-1">{profile.city || "Zona não indicada"} · {profile.phone || "Sem telefone"}</p></div>{action}</div>
    <div className="mt-4 flex flex-wrap gap-2">{(profile.skills||[]).map((skill)=><span key={skill} className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/45">{skillLabel(skill)}</span>)}</div>
    <div className="mt-4 grid sm:grid-cols-2 gap-3 text-xs text-white/35">
      <p><span className="text-white/20">Transporte:</span> {transportLabel(profile.transport_mode)}</p>
      <p><span className="text-white/20">Raio:</span> {profile.travel_radius_km != null ? profile.travel_radius_km+" km" : "—"}</p>
      <p><span className="text-white/20">Câmara:</span> {profile.equipment?.camera || "—"}</p>
      <p><span className="text-white/20">Lentes:</span> {profile.equipment?.lenses || "—"}</p>
    </div>
  </div>;
}
function Section({eyebrow,title,children}) { return <section className="mt-10"><div className="mb-4"><p className="text-[10px] uppercase tracking-[0.22em] text-white/25">{eyebrow}</p><h2 className="text-xl font-semibold mt-1">{title}</h2></div>{children}</section>; }
function Metric({label,value}) { return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><p className="text-sm text-white/35">{label}</p><p className="text-3xl font-semibold mt-3">{value}</p></div>; }
function Empty({children}) { return <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/30">{children}</div>; }
function Field({label,children}) { return <label className="block"><span className="block text-xs text-white/40 mb-2">{label}</span>{children}</label>; }
const inputClass="w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-3.5 py-3 text-sm text-white outline-none focus:border-[#B89A84]/60";
function money(value){return new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(Number(value||0));}
function formatDate(value){if(!value)return"—";return new Intl.DateTimeFormat("pt-PT",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value+"T12:00:00"));}
function dateKey(date){return date.getFullYear()+"-"+String(date.getMonth()+1).padStart(2,"0")+"-"+String(date.getDate()).padStart(2,"0");}
