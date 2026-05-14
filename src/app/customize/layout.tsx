import { Metadata } from "next";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Design Your Own Tote | Tote-ally Iconic",
  description: "Use our live canvas studio to personalise your tote bag with text, art, and colour. Your bag, your rules.",
  path: "/customize",
});

export default function CustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
