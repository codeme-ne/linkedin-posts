export function DecorativeBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden z-[-1]">
      <div className="absolute -left-40 -top-40 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-pulse" style={{ animationDuration: '15s' }} />
      <div className="absolute right-0 top-1/4 w-[30rem] h-[30rem] rounded-full bg-accent/10 blur-3xl animate-pulse" style={{ animationDuration: '20s', animationDelay: '2s' }} />
      <div className="absolute left-1/3 bottom-0 w-96 h-96 rounded-full bg-secondary/10 blur-3xl animate-pulse" style={{ animationDuration: '18s', animationDelay: '1s' }} />
      <div className="absolute right-1/4 bottom-1/4 w-64 h-64 rounded-full bg-primary/5 blur-3xl animate-pulse" style={{ animationDuration: '25s', animationDelay: '0.5s' }} />
    </div>
  );
}
