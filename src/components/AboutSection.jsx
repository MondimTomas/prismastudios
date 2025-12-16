export default function AboutSection() {
  return (
    <section className="w-full py-24 bg-white text-black" id="sobre">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Somos um Estúdio de Imagem <br />
          <span className="text-[#d4b996]">que eleva o digital</span>
        </h2>

        {/* Quem somos */}
        <p className="mt-6 text-lg md:text-xl leading-relaxed text-gray-700">
          A <strong>Prisma Studios</strong> é um estúdio criativo especializado em fotografia, videografia e conteúdo digital.
          Com um olhar atento e uma abordagem colaborativa, capturamos momentos, histórias e marcas com criatividade e impacto visual.
        </p>

        {/* Missão */}
        <p className="mt-4 text-lg md:text-xl leading-relaxed text-gray-700">
          <strong>A nossa missão:</strong> Criar imagens e vídeos autênticos que elevem a tua presença — desde celebrações pessoais a campanhas profissionais.
        </p>

        {/* Método */}
        <p className="mt-4 text-lg md:text-xl leading-relaxed text-gray-700">
          <strong>O nosso método:</strong> Escutamos as tuas ideias, alinhamos objetivos e produzimos resultados que conectam contigo e com o teu público.
        </p>
      </div>
    </section>
  );
}
