import { Link, Navigate, useParams } from "react-router-dom";
import WorkspaceLayout from "../components/WorkspaceLayout";
import BusinessLineTabs from "../components/BusinessLineTabs";
import { getBusinessLine } from "../workspaceData";

export default function BusinessLinePage() {
  const { lineId, section } = useParams();
  const line = getBusinessLine(lineId);

  if (!line) {
    return <Navigate to="/tomasmondim" replace />;
  }

  const activeSection = section || "overview";
  const sectionExists = line.sections.some((item) => item.id === activeSection);

  if (!sectionExists) {
    return <Navigate to={`/tomasmondim/ramo/${line.id}`} replace />;
  }

  return (
    <WorkspaceLayout title={line.name} eyebrow={line.eyebrow}>
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5 mb-6">
        <div className="max-w-2xl">
          <p className="text-white/45">{line.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Oferta: {line.offer}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 text-white/45">
            Preço: {line.pricing}
          </span>
        </div>
      </div>

      <BusinessLineTabs line={line} activeSection={activeSection} />

      {activeSection === "overview" && <Overview line={line} />}
      {activeSection === "leads" && <Leads line={line} />}
      {activeSection === "work" && <Work line={line} />}
      {activeSection === "recurring" && <RecurringClients line={line} />}
      {activeSection === "active" && <ActiveClients line={line} />}
      {activeSection === "lost" && <LostClients />}
      {activeSection === "calendar" && <LineCalendar line={line} />}
      {activeSection === "sops" && <Sops line={line} />}
    </WorkspaceLayout>
  );
}

function Overview({ line }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {line.metrics.map((metric) => (
          <Metric key={metric.label} {...metric} />
        ))}
      </div>

      <section className="mt-10">
        <SectionTitle eyebrow="Pipeline" title="Processo comercial" />
        <Pipeline line={line} />
      </section>

      <section className="grid xl:grid-cols-3 gap-5 mt-10">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Atividade" title="Histórico recente" />
          <EmptyState>
            Quando começares a trabalhar neste ramo, contactos, propostas, mudanças de estado,
            trabalhos e pagamentos ficam registados aqui por ordem cronológica.
          </EmptyState>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Próxima ação" title="Não deixar leads parar" />
          <div className="p-5">
            <p className="text-sm text-white/45 leading-relaxed">
              Cada lead ativa terá uma próxima ação obrigatória: ligar, enviar proposta,
              fazer follow-up ou marcar reunião.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}

function Leads({ line }) {
  return (
    <>
      <SectionTitle eyebrow="Leads" title="Pipeline comercial" />
      <Pipeline line={line} />

      <section className="grid xl:grid-cols-3 gap-5 mt-8">
        <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Oportunidades" title="Leads ativas" />
          <EmptyState>
            Ainda não existem leads em {line.name}. O botão “+ Novo” já assume este ramo como contexto.
          </EmptyState>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
          <PanelHeader eyebrow="Ficha" title="Campos deste ramo" />
          <div className="p-5 space-y-2">
            {line.fields.map((field) => (
              <div
                key={field}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-sm text-white/50"
              >
                {field}
              </div>
            ))}
            <div className="rounded-xl border border-[#B89A84]/20 bg-[#B89A84]/[0.06] px-4 py-3 text-sm text-[#C7AA95]">
              Próxima ação + data
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Work({ line }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Execução" title={line.workLabel} />
      <div className="p-5">
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <MiniMetric label="Ativos" value="0" />
          <MiniMetric label="Este mês" value="0" />
          <MiniMetric label="Receita" value="0 €" />
        </div>
        <EmptyState compact>
          Cada trabalho nasce de uma lead ganha ou pode ser criado diretamente. Terá datas,
          tarefas, custos, estado, cliente e histórico.
        </EmptyState>
      </div>
    </section>
  );
}

function RecurringClients() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Recorrência" title="Clientes mensais" />
      <div className="p-5">
        <div className="grid sm:grid-cols-3 gap-3 mb-5">
          <MiniMetric label="Clientes ativos" value="0" />
          <MiniMetric label="MRR" value="0 €" />
          <MiniMetric label="Próximas renovações" value="0" />
        </div>
        <EmptyState compact>
          Aqui ficam as avenças de conteúdo, com entregas previstas, próxima captação e renovação.
        </EmptyState>
      </div>
    </section>
  );
}

function ActiveClients() {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Retenção" title="Clientes ativos" />
      <EmptyState>
        Atualmente não existem clientes ativos de gestão de redes sociais. Quando houver,
        esta área acompanha avença, entregas, renovação e último contacto.
      </EmptyState>
    </section>
  );
}

function LostClients() {
  const reasons = ["Preço", "Resultados", "Comunicação", "Deixou de precisar", "Concorrência", "Expectativas"];

  return (
    <section className="grid xl:grid-cols-3 gap-5">
      <div className="xl:col-span-2 rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <PanelHeader eyebrow="Churn" title="Clientes perdidos" />
        <EmptyState>
          Tens 2 clientes recentes para documentar. Quando ligarmos os dados, vamos registar a razão,
          data de saída e aprendizagem de cada perda.
        </EmptyState>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
        <PanelHeader eyebrow="Análise" title="Motivos de saída" />
        <div className="p-5 flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <span
              key={reason}
              className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-white/40"
            >
              {reason}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function LineCalendar({ line }) {
  return (
    <section className="rounded-2xl border border-white/[0.08] bg-white/[0.025]">
      <PanelHeader eyebrow="Disponibilidade" title={`Calendário de ${line.name}`} />
      <div className="p-5">
        <EmptyState compact>
          Aqui vais ver apenas compromissos deste ramo. O calendário global junta os quatro ramos
          para evitar conflitos de datas.
        </EmptyState>
        <div className="mt-4 text-right">
          <Link
            to="/tomasmondim/calendario"
            className="text-sm text-[#B89A84] hover:text-white transition"
          >
            Abrir calendário global →
          </Link>
        </div>
      </div>
    </section>
  );
}

function Sops({ line }) {
  return (
    <>
      <SectionTitle eyebrow="Playbook" title={`SOPs de ${line.name}`} />
      <div className="grid md:grid-cols-3 gap-3">
        {line.nextActions.map((action) => (
          <div
            key={action}
            className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-5 py-5"
          >
            <div className="h-5 w-5 rounded-md border border-white/15 mb-4" />
            <p className="text-sm text-white/55">{action}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-sm text-white/40 leading-relaxed">
          O objetivo é que um trabalho novo possa aplicar um SOP e gerar automaticamente
          as tarefas certas para esse tipo de serviço.
        </p>
      </div>
    </>
  );
}

function Pipeline({ line }) {
  return (
    <div className="grid md:grid-cols-5 gap-3">
      {line.pipeline.map((stage, index) => (
        <div
          key={stage}
          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 min-h-[118px]"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-white/30">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-white/35">
              0
            </span>
          </div>
          <p className="font-medium mt-6">{stage}</p>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
      <p className="text-sm text-white/40">{label}</p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function MiniMetric({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-xs text-white/30">{label}</p>
      <p className="text-xl font-semibold mt-2">{value}</p>
    </div>
  );
}

function SectionTitle({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">{eyebrow}</p>
      <h2 className="text-xl font-semibold mt-1">{title}</h2>
    </div>
  );
}

function PanelHeader({ eyebrow, title }) {
  return (
    <div className="px-5 py-4 border-b border-white/[0.06]">
      <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">{eyebrow}</p>
      <h2 className="font-semibold mt-1">{title}</h2>
    </div>
  );
}

function EmptyState({ children, compact = false }) {
  return (
    <div className={compact ? "" : "p-5"}>
      <div
        className={[
          "rounded-xl border border-dashed border-white/10 px-5 text-center",
          compact ? "py-10" : "py-12",
        ].join(" ")}
      >
        <p className="text-sm text-white/35 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
