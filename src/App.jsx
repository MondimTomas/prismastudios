import { Navigate, Route, Routes, useParams } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServicosFotosEventos from "./pages/ServicosFotosEventos";
import ServicosFotosDesporto from "./pages/ServicosFotosDesporto";
import ServicosFotosRetratos from "./pages/ServicosFotosRetratos";
import ServicosFotosRestauracao from "./pages/ServicosFotosRestauracao";
import ServicosFotosPublicidade from "./pages/ServicosFotosPublicidade";
import ServicosFotosDrone from "./pages/ServicosFotosDrone";
import ServicosFotosImobiliarias from "./pages/ServicosFotosImobiliarias";
import ServicosVideoEventos from "./pages/ServicosVideoEventos";
import ServicosVideoImobiliario from "./pages/ServicosVideoImobiliario";
import ServicosVideoDJSets from "./pages/ServicosVideoDJSets";
import ServicosVideoDesporto from "./pages/ServicosVideoDesporto";
import ServicosVideoYouTube from "./pages/ServicosVideoYoutube";
import MarketingRedesSociais from "./pages/MarketingRedesSociais";
import MarketingDesenvolvimentoWeb from "./pages/MarketingDesenvolvimentoWeb";
import MarketingLeads from "./pages/MarketingLeads";
import StudioPage from "./pages/StudioPage";
import AluguerPage from "./pages/AluguerPage";
import BlogPage from "./pages/BlogPage";
import BlogPostPage from "./pages/BlogPostPage";
import ContactPage from "./pages/ContactPage";
import LookbookConcertos from "./pages/LookbookConcertos";
import LookbookCasamentosBatizados from "./pages/LookbookCasamentos";
import LookbookRetratos from "./pages/LookbookRetratos";
import LookbookRestauracao from "./pages/LookbookRestauracao";
import LookbookFestas from "./pages/LookbookFestas";
import LookbookDesporto from "./pages/LookbookDesporto";

import Login from "./private/pages/Login";
import Dashboard from "./private/pages/Dashboard";
import BusinessLinePage from "./private/pages/BusinessLinePage";
import ClientsPage from "./private/pages/ClientsPage";
import TasksPage from "./private/pages/TasksPage";
import FinancePage from "./private/pages/FinancePage";
import PlaybookPage from "./private/pages/PlaybookPage";
import CalendarPage from "./private/pages/CalendarPage";
import JobsPage from "./private/pages/JobsPage";
import FootballTeamPage from "./private/pages/FootballTeamPage";
import TeamManagementPage from "./private/pages/TeamManagementPage";
import ProtectedRoute from "./private/ProtectedRoute";
import TeamDashboard from "./team/TeamDashboard";
import TeamProfile from "./team/TeamProfile";

function PrivatePage({ children }) {
  return <ProtectedRoute requiredRole="owner">{children}</ProtectedRoute>;
}

function TeamPage({ children }) {
  return <ProtectedRoute requiredRole="collaborator">{children}</ProtectedRoute>;
}

function LegacyLineRedirect() {
  const { lineId, section } = useParams();
  const suffix = section ? "/" + section : "";
  return <Navigate to={"/tomasmondim/admin/ramo/" + lineId + suffix} replace />;
}

function LegacyFootballTeamRedirect() {
  const { teamId } = useParams();
  return <Navigate to={"/tomasmondim/admin/futebol/equipas/" + teamId} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/servicos" element={<ServicesPage />} />

      <Route path="/lookbook/concertos" element={<LookbookConcertos />} />
      <Route path="/lookbook/retratos" element={<LookbookRetratos />} />
      <Route path="/lookbook/restauracao" element={<LookbookRestauracao />} />
      <Route path="/lookbook/festas" element={<LookbookFestas />} />
      <Route path="/lookbook/desporto" element={<LookbookDesporto />} />
      <Route path="/lookbook/casamentos" element={<LookbookCasamentosBatizados />} />

      <Route path="/servicos/fotografia/eventos" element={<ServicosFotosEventos />} />
      <Route path="/servicos/fotografia/desporto" element={<ServicosFotosDesporto />} />
      <Route path="/servicos/fotografia/retratos" element={<ServicosFotosRetratos />} />
      <Route path="/servicos/fotografia/restauracao" element={<ServicosFotosRestauracao />} />
      <Route path="/servicos/fotografia/publicidade" element={<ServicosFotosPublicidade />} />
      <Route path="/servicos/fotografia/drone" element={<ServicosFotosDrone />} />
      <Route path="/servicos/fotografia/imobiliarias" element={<ServicosFotosImobiliarias />} />

      <Route path="/servicos/video/eventos" element={<ServicosVideoEventos />} />
      <Route path="/servicos/video/imobiliario" element={<ServicosVideoImobiliario />} />
      <Route path="/servicos/video/dj-sets" element={<ServicosVideoDJSets />} />
      <Route path="/servicos/video/desporto" element={<ServicosVideoDesporto />} />
      <Route path="/servicos/video/youtube" element={<ServicosVideoYouTube />} />

      <Route path="/servicos/marketing/redes-sociais" element={<MarketingRedesSociais />} />
      <Route path="/servicos/marketing/web" element={<MarketingDesenvolvimentoWeb />} />
      <Route path="/servicos/marketing/leads" element={<MarketingLeads />} />

      <Route path="/estudio" element={<StudioPage />} />
      <Route path="/aluguer" element={<AluguerPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/contactos" element={<ContactPage />} />

      <Route path="/tomasmondim/login" element={<Login />} />

      <Route
        path="/tomasmondim/admin"
        element={<PrivatePage><Dashboard /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/ramo/:lineId"
        element={<PrivatePage><BusinessLinePage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/ramo/:lineId/:section"
        element={<PrivatePage><BusinessLinePage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/trabalhos"
        element={<PrivatePage><JobsPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/futebol/equipas/:teamId"
        element={<PrivatePage><FootballTeamPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/clientes"
        element={<PrivatePage><ClientsPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/tarefas"
        element={<PrivatePage><TasksPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/calendario"
        element={<PrivatePage><CalendarPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/financeiro"
        element={<PrivatePage><FinancePage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/playbook"
        element={<PrivatePage><PlaybookPage /></PrivatePage>}
      />
      <Route
        path="/tomasmondim/admin/equipa"
        element={<PrivatePage><TeamManagementPage /></PrivatePage>}
      />

      <Route
        path="/tomasmondim/:workspaceSlug"
        element={<TeamPage><TeamDashboard /></TeamPage>}
      />
      <Route
        path="/tomasmondim/:workspaceSlug/perfil"
        element={<TeamPage><TeamProfile /></TeamPage>}
      />

      <Route path="/tomasmondim" element={<Navigate to="/tomasmondim/admin" replace />} />
      <Route path="/tomasmondim/ramo/:lineId" element={<LegacyLineRedirect />} />
      <Route path="/tomasmondim/ramo/:lineId/:section" element={<LegacyLineRedirect />} />
      <Route path="/tomasmondim/trabalhos" element={<Navigate to="/tomasmondim/admin/trabalhos" replace />} />
      <Route path="/tomasmondim/futebol/equipas/:teamId" element={<LegacyFootballTeamRedirect />} />
      <Route path="/tomasmondim/clientes" element={<Navigate to="/tomasmondim/admin/clientes" replace />} />
      <Route path="/tomasmondim/tarefas" element={<Navigate to="/tomasmondim/admin/tarefas" replace />} />
      <Route path="/tomasmondim/calendario" element={<Navigate to="/tomasmondim/admin/calendario" replace />} />
      <Route path="/tomasmondim/financeiro" element={<Navigate to="/tomasmondim/admin/financeiro" replace />} />
      <Route path="/tomasmondim/playbook" element={<Navigate to="/tomasmondim/admin/playbook" replace />} />
      <Route path="/tomasmondim/equipa" element={<Navigate to="/tomasmondim/admin/equipa" replace />} />

      <Route path="/equipa/login" element={<Navigate to="/tomasmondim/login" replace />} />
      <Route path="/equipa/registo" element={<Navigate to="/tomasmondim/login?modo=registo" replace />} />
      <Route path="/equipa" element={<Navigate to="/tomasmondim/login" replace />} />
      <Route path="/equipa/perfil" element={<Navigate to="/tomasmondim/login" replace />} />
    </Routes>
  );
}
