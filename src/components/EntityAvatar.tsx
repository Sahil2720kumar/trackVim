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
  size?: "sm" | "md";
  className?: string;
}) {
  const sz = size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm";

  return (
    <Avatar className={cn(sz, "shrink-0", className)}>
      <AvatarImage src={photoUrl ?? undefined} alt={name} />
      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
