import { UsersRoundIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GroupImageProps {
  src: string | null;
  alt: string;
  className?: string;
  sizes?: string;
}

export function GroupImage({ src, alt, className, sizes }: GroupImageProps) {
  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden rounded-xl bg-muted",
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          unoptimized
          sizes={sizes ?? "(min-width: 768px) 50vw, 100vw"}
          className="object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <UsersRoundIcon aria-hidden="true" className="size-8" />
          <span className="sr-only">No photo for {alt}</span>
        </div>
      )}
    </div>
  );
}
