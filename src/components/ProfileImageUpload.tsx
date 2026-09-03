"use client";
import React, { useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { toast } from "sonner";
import {
  ALLOWED_IMAGE_TYPES,
  validateImageMime,
  validateImageSize,
} from "@/lib/utils"; // adjust path to wherever these live

type ProfileImageUploadProps = {
  image: string | null;
  onChange: (file: File | null) => void;
  title?: string;
  maxSize?: number;
};

export default function ProfileImageUpload({
  image,
  onChange,
  title,
  maxSize = 2,
}: ProfileImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset immediately so re-selecting the same rejected file re-fires
    // onChange (browsers only fire it on a value change).
    e.target.value = "";

    if (!file) return;

    const mimeError = validateImageMime(file);
    if (mimeError) {
      toast.error(mimeError);
      return;
    }

    const sizeError = validateImageSize(file, maxSize);
    if (sizeError) {
      toast.error(sizeError);
      return;
    }

    onChange(file);
  };

  return (
    <div className="flex items-center gap-5 pb-5">
      <div className="relative">
        <Avatar className="w-24 h-24 ring-4 ring-background shadow-md">
          <AvatarImage src={image || undefined} alt="profile_image" />
          <AvatarFallback className="bg-primary/10">
            <User className="w-10 h-10 text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
        <label
          className="absolute -bottom-1 -right-1 flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-sm"
          title="Upload photo"
        >
          <Upload className="w-3.5 h-3.5" />
          <input
            ref={fileInputRef}
            type="file"
            accept={[...ALLOWED_IMAGE_TYPES].join(",")}
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">
          {title ?? "Profile photo"}
        </p>
        <p>JPG, PNG or WEBP · max {maxSize}MB</p>
      </div>
    </div>
  );
}
