import { SettingsModal } from "@/components/settings-modal";

export function ChatHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-10 flex justify-between items-center p-4 border-b bg-white/80 backdrop-blur-md">
      <h1 className="text-xl font-semibold text-zinc-900">shricodev.</h1>
      <SettingsModal />
    </header>
  );
}
