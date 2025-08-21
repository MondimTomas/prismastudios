import heroVideo from "../assets/videoapresentacao.mp4";

export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* vídeo */}
      <video autoPlay muted playsInline loop preload="auto"
       className="absolute inset-0 w-full h-full object-cover"
       poster="/poster.jpg">
  <source src="/hero.webm" type="video/webm" />
  <source src="/hero.mp4"  type="video/mp4" />
</video>


      {/* overlay para legibilidade */}
      <div className="absolute inset-0 z-10 bg-black/35 pointer-events-none" />
    </div>
  );
}
