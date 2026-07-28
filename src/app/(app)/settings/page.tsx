import { redirect } from "next/navigation";

// /settings has no content of its own — "Profilo advisor" is the default tab.
export default function SettingsIndexPage() {
  redirect("/settings/advisor-profile");
}
