"use client";
import React, { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";

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
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert("File size must be less than 2MB");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("File must be JPG, PNG, or WEBP");
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
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      <div className="text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Profile photo</p>
        <p>JPG, PNG or WEBP · max {maxSize}MB</p>
      </div>
    </div>
  );
}
