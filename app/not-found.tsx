import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden bg-ink">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-1/2 h-[44rem] w-[44rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/15 blur-[140px]" />
      </div>
      <div className="container-x text-center">
        <LogoMark height={72} className="mx-auto opacity-90" />
        <p className="eyebrow mt-10 justify-center">Error 404</p>
        <h1 className="display-1 mt-6">Page not found.</h1>
        <p className="lead mx-auto mt-6 max-w-md">The page you&apos;re after has moved or never existed. Let&apos;s get you back on track.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Button href="/">Back home</Button>
          <Button href="/contact/" variant="ghost" arrow={false}>
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
}
