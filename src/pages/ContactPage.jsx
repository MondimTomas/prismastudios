// src/pages/ContactPage.jsx
import { useState } from "react";
import Navbar from "../components/Navbar";
import MobileMenu from "../components/MobileMenu";
import Footer from "../components/Footer";
import { NAV_ITEMS } from "../navItems";

// Paleta PRISMA (igual às restantes páginas)
const BRAND_BG = "#2D2C2A";
const TEXT_MAIN = "#EBEBEB";
const TILE_GRADIENT = ["#C7C2BC", "#A78C79"]; // para o cartão do form

const SUBJECTS = [
  { value: "", label: "Escolher assunto..." },
  { value: "aluguer_estudio", label: "Aluguer de estúdio" },
  { value: "aluguer_material", label: "Aluguer de material" },
  { value: "trabalho_fotografia", label: "Trabalho de fotografia" },
  { value: "trabalho_video", label: "Trabalho de vídeo" },
  { value: "desenvolvimento_web", label: "Desenvolvimento web" },
];

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    name: "",
    email: "",
    phone: "",
    message: "",
    botField: "", // honeypot anti-bot (fica escondido)
  });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(false);

  const emailError =
    touched.email &&
    (!form.email
      ? "O e-mail é obrigatório."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      ? "Formato de e-mail inválido."
      : "");

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onBlur = (e) => {
    const { name } = e.target;
    setTouched((t) => ({ ...t, [name]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTouched({ email: true }); // força validação do único obrigatório

    if (emailError) return;

    // 👉 Simulação de envio (substitui por request à tua API quando quiseres)
    console.log("Contact form:", form);

    // Exemplo de mailto (opcional). Podes remover se fores usar API:
    // const mailto = new URL(`mailto:contacto@prismastudios.pt`);
    // mailto.searchParams.set("subject", `[PRISMA] ${SUBJECTS.find(s => s.value===form.subject)?.label || "Contacto"}`);
    // mailto.searchParams.set("body",
    //   `Nome: ${form.name}\nEmail: ${form.email}\nTelefone: ${form.phone}\n\n${form.message}`.slice(0, 1800)
    // );
    // window.location.href = mailto.toString();

    setSent(true);
    // limpa o formulário
    setForm({ subject: "", name: "", email: "", phone: "", message: "", botField: "" });
    setTouched({});
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_BG, color: TEXT_MAIN }}>
      <header className="sticky top-0 z-50" style={{ backgroundColor: BRAND_BG }}>
        <div className="max-w-6xl mx-auto px-6">
          <Navbar navItems={NAV_ITEMS} onOpenMenu={() => setMenuOpen(true)} />
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} navItems={NAV_ITEMS} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-10 pb-16">
        <section className="max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">Contactos</h1>
          <p className="mt-3 text-white/85">
            Fala connosco sobre alugueres, trabalhos ou colaborações. Respondemos normalmente em 24–48h.
          </p>
        </section>

        <section className="mt-8">
          <div
            className="rounded-2xl p-6 sm:p-8 shadow-[0_14px_28px_rgba(0,0,0,.35)]"
            style={{
              background: `linear-gradient(180deg, ${TILE_GRADIENT[0]} 0%, ${TILE_GRADIENT[1]} 100%)`,
            }}
          >
            {/* mensagem de sucesso */}
            {sent && (
              <div
                className="mb-6 rounded-lg px-4 py-3 text-sm font-medium"
                style={{ background: "rgba(0,0,0,.35)", color: "#fff" }}
                role="status"
              >
                ✨ Obrigado! A tua mensagem foi enviada. Entraremos em contacto em breve.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              {/* honeypot anti-bot */}
              <input
                type="text"
                name="botField"
                value={form.botField}
                onChange={onChange}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Assunto */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="subject" className="block text-sm font-medium text-white/90">
                    Assunto
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="mt-1 block w-full rounded-xl bg-black/20 text-white/90 placeholder-white/50
                               focus:outline-none focus:ring-2 focus:ring-white/40
                               border border-white/15 px-3 py-2"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Nome */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-white/90">
                    Nome
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="mt-1 block w-full rounded-xl bg-black/20 text-white/90 placeholder-white/50
                               focus:outline-none focus:ring-2 focus:ring-white/40
                               border border-white/15 px-3 py-2"
                    placeholder="O teu nome"
                    autoComplete="name"
                  />
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-white/90">
                    Telefone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="mt-1 block w-full rounded-xl bg-black/20 text-white/90 placeholder-white/50
                               focus:outline-none focus:ring-2 focus:ring-white/40
                               border border-white/15 px-3 py-2"
                    placeholder="(opcional)"
                    autoComplete="tel"
                  />
                </div>

                {/* Email (único obrigatório) */}
                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-white/90">
                    E-mail <span className="text-white/70">(obrigatório)</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    onBlur={onBlur}
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={`mt-1 block w-full rounded-xl bg-black/20 text-white/90 placeholder-white/50
                               focus:outline-none focus:ring-2 border px-3 py-2
                               ${emailError ? "border-red-400 focus:ring-red-400" : "border-white/15 focus:ring-white/40"}`}
                    placeholder="o.teu@email.pt"
                    autoComplete="email"
                    required
                  />
                  {emailError && (
                    <p id="email-error" className="mt-1 text-sm text-red-300">
                      {emailError}
                    </p>
                  )}
                </div>

                {/* Mensagem */}
                <div className="sm:col-span-2">
                  <label htmlFor="message" className="block text-sm font-medium text-white/90">
                    Mensagem
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={6}
                    value={form.message}
                    onChange={onChange}
                    onBlur={onBlur}
                    className="mt-1 block w-full rounded-xl bg-black/20 text-white/90 placeholder-white/50
                               focus:outline-none focus:ring-2 focus:ring-white/40
                               border border-white/15 px-3 py-2 resize-y"
                    placeholder="Escreve aqui a tua mensagem…"
                  />
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold text-black bg-white hover:bg-white/90
                             transition focus:outline-none focus:ring-2 focus:ring-white/40"
                >
                  Enviar
                </button>
                <span className="text-sm text-white/70">* Apenas o e-mail é obrigatório</span>
              </div>
            </form>
          </div>
        </section>

        {/* Info alternativa */}
        <section className="mt-8 text-white/80 text-sm">
          <p>
            Prefere e-mail? Envia para <span className="font-medium text-white">contacto@prismastudios.pt</span>.
          </p>
        </section>
      </main>

      <Footer navItems={NAV_ITEMS} />
    </div>
  );
}
