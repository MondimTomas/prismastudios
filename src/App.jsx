import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";
import ServicosFotosEventos from "./pages/ServicosFotosEventos"; // 👈
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
<Route path="/servicos/marketing/leads" element={<MarketingLeads />} />

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/servicos" element={<ServicesPage />} />
      <Route
        path="/servicos/fotografia/eventos"
        element={<ServicosFotosEventos />}
      />
      <Route
        path="/servicos/fotografia/desporto"
        element={<ServicosFotosDesporto />}
      />
      <Route
        path="/servicos/fotografia/retratos"
        element={<ServicosFotosRetratos />}
      />
      <Route
        path="/servicos/fotografia/restauracao"
        element={<ServicosFotosRestauracao />}
      />
      <Route
        path="/servicos/fotografia/publicidade"
        element={<ServicosFotosPublicidade />}
      />
      <Route path="/servicos/fotografia/drone" element={<ServicosFotosDrone />} />
        <Route path="/servicos/fotografia/imobiliarias" element={<ServicosFotosImobiliarias />} />
        <Route path="/servicos/video/eventos" element={<ServicosVideoEventos />} />
        <Route path="/servicos/video/imobiliario" element={<ServicosVideoImobiliario />} />
        <Route path="/servicos/video/dj-sets" element={<ServicosVideoDJSets />} />
        <Route path="/servicos/video/desporto" element={<ServicosVideoDesporto />} />
        <Route path="/servicos/video/youtube" element={<ServicosVideoYouTube />} />
          <Route path="/servicos/marketing/redes-sociais" element={<MarketingRedesSociais />} />
          <Route path="/servicos/marketing/web" element={<MarketingDesenvolvimentoWeb />} />
    </Routes>
  );
}
