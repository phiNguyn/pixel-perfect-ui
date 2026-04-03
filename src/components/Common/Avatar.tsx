import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import fallback from "@/assets/fallback.png";
const AvatarComponent = () => {
  return (
    <div className="flex items-center gap-3">
      <Link href={"/"} className="flex items-center gap-2">
        <Avatar>
          <AvatarImage
            src={fallback.src}
            className="object-cover"
            alt="Pinuss Flix"
          />
          <AvatarFallback className="bg-muted text-muted-foreground text-xs">
            PF
          </AvatarFallback>
        </Avatar>
        <span className="text-foreground font-bold text-lg tracking-tight">
          Pinuss Flix
        </span>
      </Link>
    </div>
  );
};

export default AvatarComponent;
