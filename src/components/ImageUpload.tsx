"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  useDropzone,
  type FileRejection,
  type DropzoneOptions,
} from "react-dropzone";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

function firstRejectionError(rejections: FileRejection[]): string | null {
  if (!rejections.length) return null;
  const code = rejections[0].errors[0]?.code;
  if (code === "file-too-large") return "Image must be under 2MB.";
  if (code === "file-invalid-type") return "Unsupported file type.";
  if (code === "too-many-files") return "Too many files selected.";
  return rejections[0].errors[0]?.message ?? "File rejected.";
}

// ─────────────────────────────────────────────
// Hook: single file upload (logo, payment QR, etc.)
// ─────────────────────────────────────────────

export function useSingleUpload(
  accept?: DropzoneOptions["accept"],
  maxSizeBytes: number = MAX_IMAGE_BYTES,
) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);

  const clear = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setFile(null);
    setPreview(null);
    setError(null);
  }, []);

  const applyFile = useCallback((picked: File) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    const url = URL.createObjectURL(picked);
    urlRef.current = url;
    setError(null);
    setFile(picked);
    setPreview(url);
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        setError(firstRejectionError(rejections));
        return;
      }
      const picked = accepted[0];
      if (picked) applyFile(picked);
    },
    [applyFile],
  );

  // For components that own their own click/avatar UI (e.g. an avatar
  // picker) instead of rendering the dropzone's root/input themselves.
  // Mirrors the same validation onDrop applies.
  const selectFile = useCallback(
    (picked: File | null) => {
      if (!picked) {
        clear();
        return;
      }
      if (picked.size > maxSizeBytes) {
        setError(
          `Image must be under ${Math.round(maxSizeBytes / (1024 * 1024))}MB.`,
        );
        return;
      }
      applyFile(picked);
    },
    [applyFile, clear, maxSizeBytes],
  );

  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  const dropzone = useDropzone({
    onDrop,
    accept: accept ?? { "image/png": [], "image/jpeg": [], "image/jpg": [] },
    maxSize: maxSizeBytes,
    maxFiles: 1,
    multiple: false,
  });

  return { file, preview, error, clear, selectFile, dropzone };
}

// ─────────────────────────────────────────────
// Hook: multi file upload (gallery)
// ─────────────────────────────────────────────

export function useMultiUpload(
  max: number,
  accept?: DropzoneOptions["accept"],
) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<Set<string>>(new Set());
  // keep latest file count available inside the stable onDrop callback
  const filesLenRef = useRef(0);
  filesLenRef.current = files.length;

  const remove = useCallback((index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      urlsRef.current.delete(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      setError(null);

      const remaining = max - filesLenRef.current;
      if (remaining <= 0) {
        setError(`You can upload up to ${max} images.`);
        return;
      }

      if (rejections.length) {
        setError(firstRejectionError(rejections));
      }

      const toAdd = accepted.slice(0, remaining);
      if (accepted.length > remaining) {
        setError(
          `Only ${remaining} more image(s) could be added (${max} max).`,
        );
      }
      if (!toAdd.length) return;

      const newUrls = toAdd.map((f) => {
        const u = URL.createObjectURL(f);
        urlsRef.current.add(u);
        return u;
      });
      setFiles((prev) => [...prev, ...toAdd]);
      setPreviews((prev) => [...prev, ...newUrls]);
    },
    [max],
  );

  useEffect(() => {
    return () => urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const dropzone = useDropzone({
    onDrop,
    accept: accept ?? { "image/png": [], "image/jpeg": [], "image/webp": [] },
    maxSize: MAX_IMAGE_BYTES,
    disabled: files.length >= max,
  });

  return { files, previews, error, remove, dropzone };
}

// ─────────────────────────────────────────────
// Component: DropZone (shared upload area UI)
// ─────────────────────────────────────────────

interface DropZoneProps {
  dropzone: ReturnType<typeof useDropzone>;
  hint: string;
}

export function DropZone({ dropzone, hint }: DropZoneProps) {
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div
      {...getRootProps()}
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-border hover:border-primary/50"
      } data-[disabled=true]:opacity-50 data-[disabled=true]:pointer-events-none`}
    >
      <input {...getInputProps()} />
      <div className="space-y-3">
        <div className="flex justify-center">
          <div className="rounded-lg bg-muted p-3">
            <Upload className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
        <div>
          <p className="text-sm font-medium">
            Click to upload or drag and drop
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <Button type="button" variant="secondary" size="sm" tabIndex={-1}>
          Browse
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Component: SingleImageUpload
// ─────────────────────────────────────────────

interface SingleImageUploadProps {
  label: string;
  preview: string | null;
  error: string | null;
  hint: string;
  previewClass?: string;
  previewAlt: string;
  dropzone: ReturnType<typeof useDropzone>;
  onRemove: () => void;
  removeLabel: string;
}

export function SingleImageUpload({
  label,
  preview,
  error,
  hint,
  previewClass = "h-32 w-32",
  previewAlt,
  dropzone,
  onRemove,
  removeLabel,
}: SingleImageUploadProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-foreground">{label}</label>

      {!preview ? (
        <DropZone dropzone={dropzone} hint={hint} />
      ) : (
        <div className="flex flex-col items-center gap-3">
          <div
            className={`relative overflow-hidden rounded-lg border border-border ${previewClass}`}
          >
            <Image
              src={preview}
              alt={previewAlt}
              fill
              unoptimized
              className="object-cover"
            />
            <button
              type="button"
              onClick={onRemove}
              className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground hover:bg-destructive/90"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onRemove}>
            {removeLabel}
          </Button>
        </div>
      )}

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
