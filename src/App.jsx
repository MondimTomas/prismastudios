import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PortfolioPage from "./pages/PortfolioPage";
import AboutPage from "./pages/AboutPage";
import ServicesPage from "./pages/ServicesPage";   // 👈

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/servicos" element={<ServicesPage />} /> {/* 👈 nova rota */}
    </Routes>
  );
}
