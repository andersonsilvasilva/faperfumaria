"use client";

import { useState } from "react";

export function ImageUploadField({
  name,
  value,
  onChange,
  folder,
  placeholder = "URL da imagem ou envie um arquivo",
}: {
  name?: string;
  value: string;
  onChange: (url: string) => void;
  folder: "produtos" | "marcas" | "banners" | "configuracoes";
  placeholder?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      formData.set("folder", folder);

      const response = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Falha no upload.");
      }
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha no upload.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-10 flex-1 min-w-0 rounded-sm border border-fa-stone/40 px-3 text-sm focus:border-fa-gold focus:outline-none"
        />
        <label className="flex h-10 shrink-0 cursor-pointer items-center rounded-sm border border-fa-stone/40 px-3 text-xs font-medium uppercase tracking-wide text-fa-black hover:border-fa-gold has-disabled:cursor-not-allowed has-disabled:opacity-50">
          {isUploading ? "Enviando..." : "Enviar arquivo"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />
        </label>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="h-20 w-20 rounded-sm border border-fa-stone/20 object-cover"
        />
      )}
    </div>
  );
}
