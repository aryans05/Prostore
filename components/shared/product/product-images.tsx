"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="w-full aspect-square relative">
        <Image
          src={images[current]}
          alt={`Product image ${current + 1}`}
          fill
          className="object-cover object-center rounded-lg"
          priority
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {images.map((image, index) => (
          <button
            key={image}
            onClick={() => setCurrent(index)}
            className={cn(
              "relative w-20 h-20 rounded-lg overflow-hidden border",
              current === index ? "ring-2 ring-primary" : "hover:opacity-75"
            )}
          >
            <Image
              src={image}
              alt={`Thumbnail ${index + 1}`}
              fill
              className="object-cover object-center"
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
