export default function PortfolioSection() {
    return (
      <section
        id="portfolio"
        className="relative w-full py-24 px-6 bg-[#EBEBEB]"
        style={{
          backgroundImage: `radial-gradient(#D1D1D1 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      >
        <h2
          className="text-4xl md:text-6xl font-extrabold text-[#2D2C2A] text-center"
          style={{
            filter: 'url(#wobble)',
            fontFamily: '"Inter Display", sans-serif',
            letterSpacing: '0em',
            lineHeight: '1em',
          }}
        >
          Created Here.
        </h2>
  
        <section className="w-full py-16 px-4 flex justify-center gap-6 bg-[#EBEBEB]">
          {['/img1.jpg', '/img2.jpg', '/img3.jpg'].map((src, idx) => (
            <img
              key={src}
              src={src}
              alt={`exemplo-${idx + 1}`}
              className={`
                w-48 h-48 object-cover rounded-xl border-4 border-white shadow-xl
                ${idx === 0 ? 'float-1' : idx === 2 ? 'float-3' : 'float-2'}
              `}
            />
          ))}
        </section>
      </section>
    );
  }
  