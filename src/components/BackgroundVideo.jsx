import heroVideo from "../assets/videoapresentacao.mp4";

export default function BackgroundVideo() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      {/* vídeo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>

      {/* overlay para legibilidade */}
      <div className="absolute inset-0 z-10 bg-black/35 pointer-events-none" />
    </div>
  );
}
