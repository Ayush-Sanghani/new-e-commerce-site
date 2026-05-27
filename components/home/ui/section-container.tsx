import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionContainerProps = {
  children: ReactNode;
  className?: string;
  id?: string;
};

export function SectionContainer({ children, className, id }: SectionContainerProps) {
  return (
    <section id={id} className={cn("section-spacing", className)}>
      {children}
    </section>
  );
}
