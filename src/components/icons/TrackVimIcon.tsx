import Image from "next/image";
import { cn } from "@/lib/utils";

interface TrackVimIconProps {
  className?: string;
  size?: number;
  alt?: string;
}

export function TrackVimIcon({
  className,
  size = 24,
  alt = "TrackVim",
}: TrackVimIconProps) {
  return (
    <Image
      src="/branding/trackvim-icon.svg"
      alt={alt}
      width={size}
      height={size}
      priority
      className={cn("inline-block shrink-0 object-contain p-0.5", className)}
    />
  );
}
