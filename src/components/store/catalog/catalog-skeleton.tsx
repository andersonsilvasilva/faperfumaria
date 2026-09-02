import { Container } from "@/components/ui/container";

export function CatalogSkeleton() {
  return (
    <Container className="animate-pulse py-10">
      <div className="h-3 w-40 bg-fa-stone/20" />
      <div className="mt-3 h-8 w-64 bg-fa-stone/20" />

      <div className="mt-8 grid grid-cols-1 gap-10 md:grid-cols-[240px_1fr]">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-fa-stone/10" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-fa-stone/10" />
          ))}
        </div>
      </div>
    </Container>
  );
}
