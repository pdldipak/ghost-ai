import { AuthControls } from "@/components/auth-controls";

export default function Home() {
  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-end border-b border-surface-border bg-surface px-4">
        <AuthControls />
      </header>
      <div className="flex flex-1 items-center justify-center">
        <p>ghost AI</p>
      </div>
    </>
  );
}
