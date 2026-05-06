import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Design Your Own Tote",
  description: "Use our live canvas designer to create a unique tote bag. Add text, stickers, and your personal touch.",
};

export default function CustomizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
