export function AboutSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2
          className={`
            scroll-m-20 pb-2 text-3xl font-semibold tracking-tight
            first:mt-0
          `}
        >
          About
        </h2>
        <p className="text-sm text-muted-foreground">
          Information about NullTab
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Version</span>
          <span>0.1.0</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Website</span>
          <a
            href="https://github.com/stevezhu/nulltab"
            target="_blank"
            rel="noopener noreferrer"
            className={`
              text-primary
              hover:underline
            `}
          >
            GitHub
          </a>
        </div>
      </div>
    </div>
  );
}
