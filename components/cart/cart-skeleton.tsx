import { Card } from "@/components/home/ui/card";

export function CartSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <div className="space-y-4">
        {Array.from({ length: 2 }).map((_, idx) => (
          <Card key={idx} className="animate-pulse p-4 sm:p-5">
            <div className="flex gap-4">
              <div className="h-28 w-32 rounded-lg bg-neutral-200" />
              <div className="flex-1 space-y-3">
                <div className="h-3 w-20 rounded bg-neutral-200" />
                <div className="h-4 w-2/3 rounded bg-neutral-200" />
                <div className="h-3 w-1/4 rounded bg-neutral-200" />
                <div className="h-8 w-28 rounded bg-neutral-200" />
              </div>
            </div>
          </Card>
        ))}
      </div>
      <Card className="animate-pulse p-5 sm:p-6">
        <div className="space-y-3">
          <div className="h-5 w-32 rounded bg-neutral-200" />
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-4 w-full rounded bg-neutral-200" />
          <div className="h-10 w-full rounded bg-neutral-200" />
        </div>
      </Card>
    </div>
  );
}
