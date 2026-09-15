import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function EntityAvatar({
  name,
  photoUrl,
  size = "md",
  className,
}: {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sz =
    size === "sm"
      ? "h-8 w-8 text-xs"
      : size === "lg"
        ? "h-10 w-10 text-sm"
        : "h-9 w-9 text-sm";

  return (
    <Avatar className={cn(sz, "shrink-0", className)}>
      <AvatarImage
        src={photoUrl ?? undefined}
        alt={name}
        className="object-cover"
      />
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
