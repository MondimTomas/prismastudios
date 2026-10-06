import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import { businessLines, getBusinessLine } from "../workspaceData";
import { supabase } from "../../lib/supabase";

const emptyForm = {
  business_line: "futebol",
  client_name: "",
  title: "",
  service_type: "",
  job_date: "",
  revenue: "",
  costs: "",
  payment_status: "paid",
  source: "",
  notes: "",
};

export default function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [lineFilter, setLineFilter] = useState(searchParams.get("ramo") || "all");
  const [form, setForm] = useState({
    ...emptyForm,
    business_line: searchParams.get("ramo") || "futebol",
  });

  const showForm = searchParams.get("novo") === "1";

  const loadJobs = useCallback(async () => {
    setLoading(true);
    setError("");

    let query = supabase
      .from("workspace_jobs")
      .select("*")
      .gte("job_date", "2026-01-01")
      .lte("job_date", "2026-12-31")
      .order("job_date", { ascending: false });

    if (lineFilter !== "all") query = query.eq("business_line", lineFilter);

    const { data, error: loadError } = await query;

    if (loadError) {
      setError("A tabela de trabalhos ainda não está pronta no Supabase.");
      setJobs([]);
    } else {
      setJobs(data || []);
    }

    setLoading(false);
  }, [lineFilter]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const totals = useMemo(
    () =>
      jobs.reduce(
        (acc, job) => {
          acc.revenue += Number(job.revenue || 0);
          acc.costs += Number(job.costs || 0);
          return acc;
        },
        { revenue: 0, costs: 0 }
      ),
    [jobs]
  );

  function openForm() {
    const next = new URLSearchParams(searchParams);
    next.set("novo", "1");
    setSearchParams(next);
  }

  function closeForm() {
    const next = new URLSearchParams(searchParams);
    next.delete("novo");
    setSearchParams(next);
    setError("");
    setForm({
      ...emptyForm,
      business_line: lineFilter !== "all" ? lineFilter : "futebol",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setSaving(false);
      setError("Não foi possível confirmar a tua sessão.");
      return;
    }

    const payload = {
      user_id: userData.user.id,
      business_line: form.business_line,
      client_name: form.client_name.trim(),
      title: form.title.trim(),
      service_type: form.service_type.trim() || null,
      job_date: form.job_date,
      status: "completed",
      revenue: Number(form.revenue || 0),
      costs: Number(form.costs || 0),
      payment_status: form.payment_status,
      source: form.source.trim() || null,
      notes: form.notes.trim() || null,
    };

    const { error: insertError } = await supabase.from("workspace_jobs").insert(payload);
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    closeForm();
    await loadJobs();
  }

  async function deleteJob(id) {
    if (!window.confirm("Eliminar este trabalho?")) return;
    const { error: deleteError } = await supabase.from("workspace_jobs").delete().eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadJobs();
  }

  return (
    <WorkspaceLayout
      title="Trabalhos"
      eyebrow="Histórico 2026"
      actions={
        <button
          type="button"
          onClick={openForm}
          className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.05] transition"
        >
          + Adicionar trabalho
        </button>
      }
    >
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">
        <p className="text-white/45 max-w-2xl">
          Começamos por 2026. Regista os trabalhos reais deste ano e só os dados que consegues recuperar sem esforço.
        </p>
        <div className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/55">
          Ano: <span className="text-white font-medium">2026</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-7">
        <FilterButton active={lineFilter === "all"} onClick={() => setLineFilter("all")}>
          Todos
        </FilterButton>
        {businessLines.map((line) => (
          <FilterButton
            key={line.id}
            active={lineFilter === line.id}
            onClick={() => setLineFilter(line.id)}
          >
            {line.icon} {line.name}
          </FilterButton>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-7">
        <Metric label="Trabalhos" value={String(jobs.length)} />
        <Metric label="Receita" value={money(totals.revenue)} />
        <Metric label="Custos diretos" value={money(totals.costs)} />
        <Metric label="Margem registada" value={money(totals.revenue - totals.costs)} />
      </div>

      {error && (
        <div className="mt-6 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="mt-7 rounded-2xl border border-white/[0.08] bg-white/[0.025] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.16em] text-white/25">
          <span className="col-span-2">Data</span>
          <span className="col-span-3">Cliente / Trabalho</span>
          <span className="col-span-2">Ramo</span>
          <span className="col-span-2 text-right">Receita</span>
          <span className="col-span-2">Pagamento</span>
          <span />
        </div>

        {loading ? (
          <div className="px-5 py-16 text-center text-sm text-white/30">A carregar...</div>
        ) : jobs.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm text-white/35">Ainda não tens trabalhos de 2026 registados.</p>
            <button type="button" onClick={openForm} className="mt-4 text-sm text-[#B89A84] hover:text-white transition">
              Adicionar o primeiro trabalho →
            </button>
          </div>
        ) : (
          jobs.map((job) => {
            const line = getBusinessLine(job.business_line);
            return (
              <div key={job.id} className="grid md:grid-cols-12 gap-3 md:gap-4 px-5 py-4 border-b border-white/[0.05] last:border-b-0 items-center">
                <div className="md:col-span-2 text-sm text-white/45">{formatDate(job.job_date)}</div>
                <div className="md:col-span-3">
                  <p className="text-sm font-medium">{job.client_name}</p>
                  <p className="text-xs text-white/30 mt-1">{job.title}</p>
                </div>
                <div className="md:col-span-2 text-sm text-white/45">
                  {line ? line.icon + " " + line.name : job.business_line}
                </div>
                <div className="md:col-span-2 md:text-right text-sm font-medium">{money(job.revenue)}</div>
                <div className="md:col-span-2"><PaymentBadge value={job.payment_status} /></div>
                <div className="md:col-span-1 md:text-right">
                  <button type="button" onClick={() => deleteJob(job.id)} className="text-xs text-white/20 hover:text-red-300 transition">
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center overflow-y-auto px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-[#1A1A1A] shadow-2xl">
            <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-white/[0.07]">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#B89A84]">Histórico 2026</p>
                <h2 className="text-xl font-semibold mt-1">Adicionar trabalho</h2>
              </div>
              <button type="button" onClick={closeForm} className="text-white/35 hover:text-white transition">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Ramo">
                  <select value={form.business_line} onChange={(e) => setForm({ ...form, business_line: e.target.value })} className={inputClass}>
                    {businessLines.map((line) => <option key={line.id} value={line.id}>{line.name}</option>)}
                  </select>
                </Field>
                <Field label="Data">
                  <input type="date" min="2026-01-01" max="2026-12-31" value={form.job_date} onChange={(e) => setForm({ ...form, job_date: e.target.value })} required className={inputClass} />
                </Field>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Cliente">
                  <input value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} placeholder="Ex.: Vitória FC" required className={inputClass} />
                </Field>
                <Field label="Nome do trabalho">
                  <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Sessão equipa sénior" required className={inputClass} />
                </Field>
              </div>

              <Field label="Tipo de serviço">
                <input value={form.service_type} onChange={(e) => setForm({ ...form, service_type: e.target.value })} placeholder="Fotografia, vídeo, produção + edição..." className={inputClass} />
              </Field>

              <div className="grid sm:grid-cols-3 gap-4">
                <Field label="Valor cobrado (€)">
                  <input type="number" min="0" step="0.01" value={form.revenue} onChange={(e) => setForm({ ...form, revenue: e.target.value })} className={inputClass} />
                </Field>
                <Field label="Custos diretos (€)">
                  <input type="number" min="0" step="0.01" value={form.costs} onChange={(e) => setForm({ ...form, costs: e.target.value })} placeholder="Combustível..." className={inputClass} />
                </Field>
                <Field label="Pagamento">
                  <select value={form.payment_status} onChange={(e) => setForm({ ...form, payment_status: e.target.value })} className={inputClass}>
                    <option value="paid">Pago</option>
                    <option value="partial">Parcial</option>
                    <option value="unpaid">Por pagar</option>
                  </select>
                </Field>
              </div>

              <Field label="Origem do cliente">
                <input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} placeholder="Instagram, recomendação, contacto direto..." className={inputClass} />
              </Field>

              <Field label="Notas">
                <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} placeholder="Só o que for útil recordar." className={inputClass} />
              </Field>

              {error && <div className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">{error}</div>}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeForm} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-white/55 hover:text-white transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="rounded-xl bg-[#B89A84] px-5 py-2.5 text-sm font-semibold text-[#151515] hover:brightness-110 disabled:opacity-50 transition">
                  {saving ? "A guardar..." : "Guardar trabalho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </WorkspaceLayout>
  );
}

const inputClass = "w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-sm text-white outline-none transition focus:border-[#B89A84]/60";

function Field({ label, children }) {
  return <label className="block"><span className="block text-xs text-white/45 mb-2">{label}</span>{children}</label>;
}

function FilterButton({ active, onClick, children }) {
  return <button type="button" onClick={onClick} className={active ? "rounded-full px-4 py-2 text-sm border bg-white text-[#151515] border-white" : "rounded-full px-4 py-2 text-sm border border-white/10 text-white/40 hover:text-white transition"}>{children}</button>;
}

function Metric({ label, value }) {
  return <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5"><p className="text-sm text-white/40">{label}</p><p className="mt-3 text-3xl font-semibold">{value}</p></div>;
}

function PaymentBadge({ value }) {
  const labels = { paid: "Pago", partial: "Parcial", unpaid: "Por pagar" };
  return <span className="inline-flex rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/50">{labels[value] || value}</span>;
}

function money(value) {
  return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(value || 0));
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value + "T12:00:00"));
}
