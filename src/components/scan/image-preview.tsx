"use client";

import Image from "next/image";

import { Button } from "@/components/ui/button";

type ImagePreviewProps = {
  file: File;
  previewUrl: string;
  onRetake: () => void;
  onSubmit: () => void;
  disabled?: boolean;
};

export function ImagePreview({ previewUrl, onRetake, onSubmit, disabled }: ImagePreviewProps) {
  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-lg border border-border">
        <Image
          src={previewUrl}
          alt="Preview da nota fiscal"
          width={800}
          height={600}
          unoptimized
          className="max-h-96 w-full object-contain"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={onRetake} disabled={disabled}>
          Tirar outra
        </Button>
        <Button type="button" onClick={onSubmit} disabled={disabled}>
          Enviar para análise
        </Button>
      </div>
    </div>
  );
}
