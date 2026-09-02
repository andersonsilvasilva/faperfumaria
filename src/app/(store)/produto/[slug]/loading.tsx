import { Container } from "@/components/ui/container";

export default function Loading() {
  return (
    <Container className="animate-pulse py-10">
      <div className="h-3 w-40 bg-fa-stone/20" />
      <div className="mt-6 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div className="aspect-square bg-fa-stone/10" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-fa-stone/20" />
          <div className="h-8 w-3/4 bg-fa-stone/20" />
          <div className="h-6 w-32 bg-fa-stone/20" />
        </div>
      </div>
    </Container>
  );
}
