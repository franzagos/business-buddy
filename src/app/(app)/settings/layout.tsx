import { SettingsTabNav } from "@/components/settings/settings-tab-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mx-auto max-w-6xl px-6 pt-8">
        <SettingsTabNav />
      </div>
      {children}
    </div>
  );
}
