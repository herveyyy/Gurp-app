import type { Metadata } from "next";
import { Suspense } from "react";
import { CustomerLanding } from "@/components/organisms/CustomerLanding/CustomerLanding";
import { getSession } from "@/lib/domain/services/auth.service";

export const metadata: Metadata = {
  title: "Gurp | Sub-50ms Incident Decision & SLA Triage Engine",
  description:
    "Enterprise customer incident classification, urgency SLA scoring, and queue dispatching in under 50ms using ModernBERT.",
};

function LandingFallback() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface font-sans">
      <main className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl btn-primary-gradient flex items-center justify-center text-white font-mono font-bold text-xl animate-pulse">
          G
        </div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
          Gurp Incident Decision Engine
        </h1>
        <p className="text-sm font-mono text-on-surface-muted">Initializing Customer Platform...</p>
      </main>
    </div>
  );
}

async function LandingContent() {
  const session = await getSession();

  return <CustomerLanding session={session} />;
}

export default function LandingPage() {
  return (
    <Suspense fallback={<LandingFallback />}>
      <LandingContent />
    </Suspense>
  );
}
