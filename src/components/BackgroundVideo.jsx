export default function BackgroundVideo() {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* vídeo (block + overscan 1px) */}
        <video
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          poster="/poster.jpg"
          className="block absolute -inset-[2px] object-cover w-[calc(100%+2px)] h-[calc(100%+2px)]"
        >
          <source src="/hero.webm" type="video/webm" />
          <source src="/hero.mp4"  type="video/mp4" />
        </video>
  
        {/* overlay também com overscan 1px */}
        <div className="absolute -inset-[2px] z-10 bg-black/35 pointer-events-none" />
      </div>
    );
  }
  