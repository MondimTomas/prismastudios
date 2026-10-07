import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import TeamLayout from "./TeamLayout";
import { supabase } from "../lib/supabase";

export default function TeamDashboard() {
  const { workspaceSlug } = useParams();
  const [member, setMember] = useState(null);
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [sops, setSops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;
    if (!user) return;

    const [memberResult, profileResult, assignmentResult, sopResult] = await Promise.all([
      supabase.from("workspace_members").select("role,status").eq("user_id", user.id).maybeSingle(),
      supabase.from("collaborator_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase
        .from("collaborator_assignments")
        .select("*, workspace_jobs(id,business_line,client_name,title,service_type,job_date,status,notes,revenue)")
        .eq("collaborator_user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("workspace_sops")
        .select("*")
        .eq("is_published", true)
        .order("sort_order", { ascending: true }),
    ]);

    const firstError = memberResult.error || profileResult.error || assignmentResult.error || sopResult.error;
    if (firstError) setError(firstError.message);

    setMember(memberResult.data || null);
    setProfile(profileResult.data || null);
    setAssignments(assignmentResult.data || []);
    setSops(sopResult.data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function setAssignmentStatus(id, status) {
    const previous = assignments;
    setAssignments((current) => current.map((item) => item.id === id ? {...item, status} : item));

    const { error: updateError } = await supabase
      .from("collaborator_assignments")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (updateError) {
      setAssignments(previous);
      setError(updateError.message);
    }
  }

  const upcoming = useMemo(() => {
    const today = dateKey(new Date());
    return assignments
      .filter((item) => item.workspace_jobs?.job_date >= today && item.status !== "cancelled" && item.status !== "declined")
      .sort((a, b) => (a.workspace_jobs?.job_date || "").localeCompare(b.workspace_jobs?.job_date || ""));
  }, [assignments]);

  const expected = upcoming.reduce(
    (total, item) => total + Number(item.fee_amount || 0) + Number(item.travel_reimbursement || 0),
    0
  );

  return (
    <TeamLayout title={profile?.full_name ? "Olá, " + profile.full_name.split(" ")[0] : "Os meus trabalhos"}>
      {error && <Notice>{error}</Notice>}

      {loading ? (
        <div className="py-20 text-center text-sm text-white/30">A carregar...</div>
      ) : member?.status !== "active" ? (
        <div className="max-w-2xl rounded-3xl border border-[#B89A84]/20 bg-[#B89A84]/[0.05] p-7">
          <p className="text-xs uppercase tracking-[0.2em] text-[#B89A84]">Registo recebido</p>
          <h2 className="text-2xl font-semibold mt-2">Aguardamos aprovação</h2>
          <p className="text-white/45 mt-3 leading-relaxed">
            O teu perfil já está guardado. Assim que for aprovado, esta área mostra os jogos atribuídos, valores e SOPs da Prisma.
          </p>
          <Link to={"/tomasmondim/" + workspaceSlug + "/perfil"} className="inline-flex mt-5 text-sm text-[#B89A84] hover:text-white">Rever o meu perfil →</Link>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-3 gap-4">
            <Metric label="Próximos trabalhos" value={String(upcoming.length)} />
            <Metric label="Valor previsto" value={money(expected)} />
            <Metric label="SOPs disponíveis" value={String(sops.length)} />
          </div>

          <section className="mt-9">
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">Agenda</p>
              <h2 className="text-xl font-semibold mt-1">Jogos e trabalhos atribuídos</h2>
            </div>

            {upcoming.length === 0 ? (
              <Empty>Neste momento não tens trabalhos futuros atribuídos.</Empty>
            ) : (
              <div className="space-y-3">
                {upcoming.map((assignment) => {
                  const job = assignment.workspace_jobs;
                  return (
                    <div key={assignment.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                          <p className="text-xs text-[#B89A84]">{formatDate(job?.job_date)} · {assignment.role}</p>
                          <h3 className="text-lg font-semibold mt-1">{job?.client_name}</h3>
                          <p className="text-sm text-white/40 mt-1">{job?.title}</p>
                          {job?.notes && <p className="text-sm text-white/30 mt-3">{job.notes}</p>}
                        </div>
                        <div className="lg:text-right">
                          <p className="text-2xl font-semibold">{money(Number(assignment.fee_amount || 0) + Number(assignment.travel_reimbursement || 0))}</p>
                          <p className="text-xs text-white/30 mt-1">
                            {money(assignment.fee_amount)} trabalho
                            {Number(assignment.travel_reimbursement || 0) > 0 ? " + " + money(assignment.travel_reimbursement) + " deslocação" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-white/[0.06] flex flex-wrap gap-2">
                        <Status value={assignment.status} />
                        {assignment.status === "assigned" && (
                          <>
                            <button onClick={() => setAssignmentStatus(assignment.id, "accepted")} className="rounded-lg bg-[#B89A84] px-3 py-2 text-xs font-semibold text-[#151515]">Aceitar</button>
                            <button onClick={() => setAssignmentStatus(assignment.id, "declined")} className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/45 hover:text-white">Não consigo</button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="mt-10">
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">Playbook</p>
              <h2 className="text-xl font-semibold mt-1">SOPs</h2>
            </div>

            {sops.length === 0 ? (
              <Empty>Ainda não existem SOPs publicados para a equipa.</Empty>
            ) : (
              <div className="grid lg:grid-cols-2 gap-4">
                {sops.map((sop) => (
                  <article key={sop.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#B89A84]">{sop.business_line || "Geral"}</p>
                    <h3 className="font-semibold text-lg mt-2">{sop.title}</h3>
                    {sop.summary && <p className="text-sm text-white/40 mt-2">{sop.summary}</p>}
                    <div className="whitespace-pre-wrap text-sm leading-6 text-white/55 mt-4">{sop.content}</div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </TeamLayout>
  );
}

function Metric({ label, value }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><p className="text-sm text-white/35">{label}</p><p className="text-3xl font-semibold mt-3">{value}</p></div>;
}
function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed border-white/10 px-5 py-12 text-center text-sm text-white/35">{children}</div>;
}
function Notice({ children }) {
  return <div className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{children}</div>;
}
function Status({ value }) {
  const labels = { assigned:"Por confirmar", accepted:"Aceite", declined:"Recusado", completed:"Concluído", cancelled:"Cancelado" };
  return <span className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/50">{labels[value] || value}</span>;
}
function money(value) {
  return new Intl.NumberFormat("pt-PT",{style:"currency",currency:"EUR"}).format(Number(value || 0));
}
function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT",{weekday:"short",day:"2-digit",month:"short"}).format(new Date(value + "T12:00:00"));
}
function dateKey(date) {
  return date.getFullYear() + "-" + String(date.getMonth()+1).padStart(2,"0") + "-" + String(date.getDate()).padStart(2,"0");
}
