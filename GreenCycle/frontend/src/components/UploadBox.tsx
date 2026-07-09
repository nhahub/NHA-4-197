"use client";

import { useCallback, useRef, useState } from "react";

interface UploadBoxProps {
  onFileSelected: (file: File) => void;
  previewUrl: string | null;
  disabled?: boolean;
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024;

export default function UploadBox({
  onFileSelected,
  previewUrl,
  disabled,
}: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSend = useCallback(
    (file: File) => {
      if (!ACCEPTED.includes(file.type)) {
        setError("Unsupported file type. Use JPEG, PNG, or WEBP.");
        return;
      }
      if (file.size > MAX_BYTES) {
        setError("File is too large. Max size is 8MB.");
        return;
      }
      setError(null);
      onFileSelected(file);
    },
    [onFileSelected]
  );

  return (
    <div>
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (disabled) return;
          const file = e.dataTransfer.files?.[0];
          if (file) validateAndSend(file);
        }}
        className={`focus-ring flex min-h-[240px] cursor-pointer flex-col items-center justify-center border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-moss bg-moss/5" : "border-line"
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Selected upload preview"
            className="max-h-56 max-w-full object-contain"
          />
        ) : (
          <>
            <p className="font-display text-lg text-canopy">
              Drop a photo here
            </p>
            <p className="mt-1 text-sm text-ink/60">
              or click to browse — JPEG, PNG, WEBP, up to 8MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) validateAndSend(file);
          }}
        />
      </div>
      {error && <p className="mt-2 text-sm text-clay">{error}</p>}
    </div>
  );
}
