"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductDetailData } from "@/modules/catalog/queries";

export function ProductGallery({ images, productName }: { images: ProductDetailData["images"]; productName: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = images[activeIndex];

  if (!active) return null;

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden bg-fa-off-white">
        <Image
          src={active.url}
          alt={active.altText ?? productName}
          fill
          priority
          className="object-cover"
          sizes="(min-width: 768px) 50vw, 100vw"
        />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative h-16 w-16 overflow-hidden border ${
                index === activeIndex ? "border-fa-gold" : "border-fa-stone/30"
              }`}
            >
              <Image src={image.url} alt={image.altText ?? productName} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
