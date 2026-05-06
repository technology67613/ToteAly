import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shop the Collection",
  description: "Browse our iconic collection of premium tote bags. From plain classics to fully customized masterpieces.",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
