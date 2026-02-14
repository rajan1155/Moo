export default function DebugPage() {
  return (
    <div className="min-h-screen p-10 font-mono text-xl flex items-center justify-center">
      <div className="glass-card p-8 rounded-[32px] shadow-sm text-[var(--text)]">
        <h1 className="font-bold mb-4 font-serif">Debug Page</h1>
        <p>Check your Network tab for response header: <strong>x-mw-hit: 1</strong></p>
      </div>
    </div>
  );
}
