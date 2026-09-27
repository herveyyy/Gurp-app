import Link from "next/link";
import { Suspense } from "react";
import { useButtonStyles } from "@/components/atoms/Button/button.hooks";
import { LayaDashboard } from "@/components/organisms/LayaDashboard/LayaDashboard";
import { signOutAction } from "@/lib/domain/actions/auth.actions";
import { getSession } from "@/lib/domain/services/auth.service";

function HomeFallback() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-surface font-(family-name:--font-inter)">
      <main className="flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-6 py-20 text-center">
        <h1 className="font-display mb-4 text-4xl font-bold tracking-tight text-on-surface">
          Tiyakaloud Decision Engine
        </h1>
        <p className="text-base text-on-surface-muted">Connecting to ModernBERT inference server...</p>
      </main>
    </div>
  );
}

async function HomeContent() {
  const session = await getSession();
  const secondaryLinkClass = useButtonStyles("secondary");

  return (
    <div className="min-h-screen flex flex-col bg-surface font-(family-name:--font-inter)">
      {/* Top Navbar */}
      <header className="w-full border-b border-outline-variant/15 bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl btn-primary-gradient flex items-center justify-center text-white font-bold text-sm shadow-sm">
              T
            </span>
            <span className="font-display font-extrabold text-lg text-on-surface tracking-tight">
              Tiyakaloud <span className="text-primary font-normal text-sm">/ Laya</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-on-surface-muted hidden sm:inline">
                  Signed in as <strong className="text-on-surface">{session.user.name}</strong>
                </span>
                <Link href="/users" className="text-xs font-semibold text-primary hover:underline">
                  Users Directory
                </Link>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="text-xs px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="text-xs px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container-high text-on-surface font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link href="/landing" className={secondaryLinkClass}>
                  Install PWA
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Dashboard Experience */}
      <main className="flex-1">
        <LayaDashboard />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-outline-variant/15 py-6 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-on-surface-muted">
          Tiyakaloud System 1 Microservice · Non-autoregressive ModernBERT Decision Engine · Sub-50ms CPU Inference
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeContent />
    </Suspense>
  );
}
