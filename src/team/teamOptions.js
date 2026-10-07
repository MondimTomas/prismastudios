export const skillOptions = [
  { id: "photo_football", label: "Fotografia de futebol" },
  { id: "video_football", label: "Vídeo de futebol" },
  { id: "photo_events", label: "Fotografia de eventos" },
  { id: "video_events", label: "Vídeo de eventos" },
  { id: "weddings", label: "Casamentos e batizados" },
  { id: "real_estate", label: "Imobiliário e decoração" },
  { id: "portraits", label: "Retratos" },
  { id: "social_content", label: "Conteúdo para redes sociais" },
  { id: "drone", label: "Drone" },
  { id: "photo_editing", label: "Edição de fotografia" },
  { id: "video_editing", label: "Edição de vídeo" },
];

export const transportOptions = [
  { id: "car", label: "Carro próprio" },
  { id: "motorcycle", label: "Mota" },
  { id: "public_transport", label: "Transportes públicos" },
  { id: "other", label: "Outro" },
];

export function skillLabel(id) {
  return skillOptions.find((item) => item.id === id)?.label || id;
}

export function transportLabel(id) {
  return transportOptions.find((item) => item.id === id)?.label || id || "—";
}
