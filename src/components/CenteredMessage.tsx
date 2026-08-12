export default function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-2 px-6 text-center"
      style={{ background: "var(--ground)", color: "var(--ink-faint)" }}
    >
      <p className="text-[0.92rem] font-semibold">{children}</p>
    </div>
  );
}
