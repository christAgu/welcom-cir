import { cn } from "@/lib/utils";

type DashboardPageProps = {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
};

export function DashboardPage({
  children,
  className,
  narrow = false,
}: DashboardPageProps) {
  return (
    <div
      className={cn(
        "livento-page-content mx-auto w-full",
        narrow ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
