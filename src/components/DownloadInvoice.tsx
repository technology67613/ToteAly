"use client";

import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  order: any;
}

export default function DownloadInvoice({ order }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // We import html2pdf dynamically to keep bundle size small
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;

      // We get the invoice HTML from our API or generate it here
      // For simplicity and speed, we fetch the HTML from a utility route
      const res = await fetch(`/api/orders/${order.id}/invoice`);
      const html = await res.text();

      // Create a temporary container
      const element = document.createElement("div");
      element.innerHTML = html;
      element.style.width = "800px";
      element.style.padding = "0";
      
      // PDF Options
      const opt = {
        margin: 0,
        filename: `Invoice_${order.id.slice(-8).toUpperCase()}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      // Generate PDF
      await html2pdf().from(element).set(opt).save();
      
      toast.success("Invoice downloaded successfully!");
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="flex items-center gap-2 px-6 py-3 bg-[#900C3F] text-white rounded-xl font-bold hover:bg-[#6B0930] transition-all disabled:opacity-50 shadow-lg shadow-rose-900/20"
    >
      {isGenerating ? (
        <>
          <Loader2 className="animate-spin" size={18} />
          Generating PDF...
        </>
      ) : (
        <>
          <Download size={18} />
          Download PDF Invoice
        </>
      )}
    </button>
  );
}
