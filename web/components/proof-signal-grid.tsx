import type { GrowthProofSignal } from "@/lib/growth-commerce";

export function ProofSignalGrid({
  items,
}: {
  items: GrowthProofSignal[];
}) {
  return (
    <div className="proof-signal-grid">
      {items.map((item) => (
        <article className="storefront-trust-card proof-signal-card" key={item.title}>
          <strong>{item.title}</strong>
          <p>{item.body}</p>
        </article>
      ))}
    </div>
  );
}
