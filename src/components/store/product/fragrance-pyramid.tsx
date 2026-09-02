import type { ProductDetailData } from "@/modules/catalog/queries";

const LAYER_LABELS: Record<string, string> = {
  TOP: "Notas de saída",
  HEART: "Notas de coração",
  BASE: "Notas de fundo",
};

export function FragrancePyramid({ notes }: { notes: ProductDetailData["fragranceNotes"] }) {
  if (notes.length === 0) return null;

  const layers = ["TOP", "HEART", "BASE"] as const;

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {layers.map((layer) => {
        const layerNotes = notes.filter((note) => note.layer === layer);
        if (layerNotes.length === 0) return null;

        return (
          <div key={layer}>
            <p className="text-xs font-semibold uppercase tracking-wide text-fa-gold">
              {LAYER_LABELS[layer]}
            </p>
            <p className="mt-2 text-sm text-fa-black/70">
              {layerNotes.map((note) => note.note.name).join(", ")}
            </p>
          </div>
        );
      })}
    </div>
  );
}
