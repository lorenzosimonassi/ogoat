import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm">
            og
          </span>
          <span className="text-lg">
            ogoat<span className="text-primary">.</span>
          </span>
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link href="/novo" className="transition-colors hover:text-foreground">
            Nova carreira
          </Link>
        </nav>
      </div>
    </header>
  );
}
