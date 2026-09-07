"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="h-10 rounded-sm border border-fa-black px-5 text-xs font-medium uppercase tracking-wide text-fa-black hover:bg-fa-black hover:text-fa-white print:hidden"
    >
      Imprimir / Salvar em PDF
    </button>
  );
}
