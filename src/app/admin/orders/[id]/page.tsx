"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, 
  MapPin, User, Mail, Phone, IndianRupee, Printer, 
  ChevronRight, CreditCard, ExternalLink, MessageSquare,
  Eye, X, Download, Tag, XCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  
  // Tracking State
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [deliveryPartner, setDeliveryPartner] = useState<string>("Delhivery");
  const [isUpdatingShipment, setIsUpdatingShipment] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/admin/orders?id=${id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data);
          if (data.tracking_number) setTrackingNumber(data.tracking_number);
          if (data.delivery_partner) setDeliveryPartner(data.delivery_partner);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
        <Package className="w-10 h-10 text-[var(--admin-primary)]" />
      </motion.div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-[var(--admin-background)] flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-2xl font-bold">Order not found</p>
      <button onClick={() => router.back()} className="text-[var(--admin-primary)] font-bold uppercase tracking-widest text-xs">Return to Dashboard</button>
    </div>
  );

  const status = order.status?.toLowerCase();
  const isCancelled = status === 'cancelled';
  const isDelivered = status === 'delivered';
  const isShipped = isDelivered || status === 'shipped';
  const isConfirmed = isShipped || status === 'confirmed';
  const isProcessing = isConfirmed || status === 'processing';

  const steps = [
    { label: 'Pending', icon: Clock, date: order.created_at, active: true },
    { label: 'Processing', icon: Package, date: null, active: isProcessing || isCancelled },
    { label: 'Confirmed', icon: CheckCircle2, date: null, active: isConfirmed || isCancelled },
    { label: 'Shipped', icon: Truck, date: null, active: isShipped || isCancelled },
    { label: 'Delivered', icon: CheckCircle2, date: null, active: isDelivered || isCancelled },
  ];

  const handleUpdateStatus = async (newStatus: string, extras = {}) => {
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: newStatus, ...extras })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder({ ...order, ...updated });
        return true;
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update order status.");
        return false;
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to update order status.");
      return false;
    }
  };

  const handleShipOrder = async () => {
    if (!trackingNumber) {
      toast.error("Please enter a tracking number");
      return;
    }
    setIsUpdatingShipment(true);
    const success = await handleUpdateStatus('Shipped', { 
      tracking_number: trackingNumber, 
      delivery_partner: deliveryPartner 
    });
    if (success) {
      toast.success(`Order marked as shipped via ${deliveryPartner}`);
      setShowShipModal(false);
    }
    setIsUpdatingShipment(false);
  };

  const handlePrintLabel = () => {
    const labelWindow = window.open('', '_blank');
    if (!labelWindow) return;

    const items = order.products || order.order_items || [];
    const itemsText = items
      .map((item: any) => `${item.customization_details?.product_snapshot?.title || item.product_title || item.products?.title || item.title} (x${item.quantity || 1})`)
      .join(', ');
    
    const totalQty = items.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0);
    const barcodeWidths = [2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4,1,3,2,1,5,2,4];

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>A6 Shipping Label - ${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');
            
            @page { 
              size: A6 portrait; 
              margin: 0; 
              orphans: 0;
              widows: 0;
            }
            
            * { 
              box-sizing: border-box; 
              -webkit-print-color-adjust: exact; 
              print-color-adjust: exact;
            }
            
            body { 
              margin: 0; 
              padding: 0; 
              width: 100%;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
              font-family: 'Inter', -apple-system, sans-serif;
              background: #f0f0f0;
              color: #000;
              line-height: 1.2;
            }

            .label-container {
              width: 105mm;
              height: 148mm;
              background: #fff;
              border: 2px solid #000;
              padding: 0;
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-shadow: 0 0 20px rgba(0,0,0,0.1);
              page-break-inside: avoid;
            }

            @media print {
              body { 
                background: #fff; 
                display: block;
              }
              .label-container { 
                box-shadow: none; 
                border: 2px solid #000;
                margin: 0;
                position: absolute;
                top: 0;
                left: 0;
              }
            }

            /* Header Section */
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              padding: 6mm 6mm 4mm;
              border-bottom: 2px solid #000;
            }

            .brand-block h1 {
              margin: 0;
              font-size: 18px;
              font-weight: 800;
              letter-spacing: -0.5px;
              text-transform: uppercase;
            }
            .brand-block p {
              margin: 2px 0 0;
              font-size: 9px;
              font-weight: 600;
              color: #444;
            }

            .order-meta {
              text-align: right;
            }
            .order-meta .order-id {
              font-size: 11px;
              font-weight: 700;
              margin-bottom: 2px;
            }
            .order-meta .date {
              font-size: 9px;
              color: #666;
            }

            /* Main Content Section */
            .main-content {
              flex: 1;
              display: flex;
              flex-direction: column;
            }

            .address-section {
              display: grid;
              grid-template-columns: 1fr 1fr;
              border-bottom: 2px solid #000;
            }

            .address-block {
              padding: 5mm 6mm;
            }
            .address-block.to {
              grid-column: span 2;
              background: #fff;
              border-bottom: 2px solid #000;
            }
            .address-block.from {
              border-right: 2px solid #000;
            }

            .section-label {
              font-size: 8px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 1px;
              margin-bottom: 3mm;
              display: block;
            }

            .address-text {
              font-size: 11px;
              font-weight: 500;
              line-height: 1.4;
            }
            .address-block.to .address-text {
              font-size: 14px;
              font-weight: 600;
            }
            .address-block.to .name {
              font-size: 18px;
              font-weight: 800;
              margin-bottom: 1.5mm;
              display: block;
            }

            .pincode-display {
              margin-top: 4mm;
              display: flex;
              align-items: center;
              gap: 4mm;
            }
            .pincode-badge {
              font-size: 24px;
              font-weight: 800;
              border: 3px solid #000;
              padding: 2mm 5mm;
              border-radius: 2mm;
              letter-spacing: 2px;
            }
            .phone-badge {
              font-size: 12px;
              font-weight: 700;
            }

            /* Tracking Barcode Section */
            .tracking-section {
              padding: 6mm;
              text-align: center;
              border-bottom: 2px solid #000;
            }
            .barcode-container {
              display: flex;
              justify-content: center;
              gap: 1.5px;
              height: 15mm;
              margin-bottom: 3mm;
            }
            .bar { background: #000; }
            .awb-text {
              font-size: 16px;
              font-weight: 800;
              letter-spacing: 2px;
            }
            .partner-text {
              font-size: 10px;
              font-weight: 600;
              color: #666;
              margin-top: 1mm;
            }

            /* Footer Info Section */
            .info-grid {
              display: grid;
              grid-template-columns: 1.2fr 1fr;
              padding: 5mm 6mm;
              gap: 4mm;
            }

            .info-item {
              font-size: 10px;
              margin-bottom: 2mm;
            }
            .info-item span {
              font-weight: 700;
              color: #666;
              margin-right: 2mm;
            }
            .info-item strong {
              font-weight: 800;
            }

            .payment-badge {
              display: inline-block;
              font-size: 12px;
              font-weight: 800;
              text-transform: uppercase;
              padding: 1.5mm 4mm;
              border: 2px solid #000;
              border-radius: 1mm;
              margin-top: 2mm;
            }

            .handling-footer {
              margin-top: auto;
              padding: 4mm 6mm;
              background: #000;
              color: #fff;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 1px;
            }

            @media print {
              body { margin: 0; padding: 0; }
              .label-container { border: 2px solid #000; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="label-container">
            <div class="header">
              <div class="brand-block">
                <h1>TOTE-ALLY ICONIC</h1>
                <p>Curated Design & Lifestyle</p>
              </div>
              <div class="order-meta">
                <div class="order-id">ORD-${order.id.slice(0, 8).toUpperCase()}</div>
                <div class="date">${new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              </div>
            </div>

            <div class="main-content">
              <div class="address-section">
                <div class="address-block to">
                  <span class="section-label">Deliver To</span>
                  <div class="address-text">
                    <span class="name">${order.shipping_details?.name}</span>
                    ${order.shipping_details?.address}<br>
                    ${order.shipping_details?.city}, ${order.shipping_details?.state || ''}
                  </div>
                  <div class="pincode-display">
                    <div class="pincode-badge">${order.shipping_details?.zip || ''}</div>
                    <div class="phone-badge">MOB: +91 ${order.shipping_details?.phone || ''}</div>
                  </div>
                </div>
                
                <div class="address-block from">
                  <span class="section-label">Shipped From</span>
                  <div class="address-text">
                    <strong>Tote-ally Iconic</strong><br>
                    123 Creative Lane, Art District<br>
                    Mumbai, MH - 400001<br>
                    PH: +91 98250 63143
                  </div>
                </div>

                <div class="address-block">
                  <span class="section-label">Order Details</span>
                  <div class="info-item"><span>Qty:</span><strong>${totalQty} Unit(s)</strong></div>
                  <div class="info-item"><span>Value:</span><strong>₹${order.total_amount}</strong></div>
                  <div class="payment-badge">${order.payment_status === 'paid' ? 'PREPAID' : 'COD: ₹' + order.total_amount}</div>
                </div>
              </div>

              <div class="tracking-section">
                <span class="section-label">AWB / Tracking Number</span>
                <div class="barcode-container">
                  <svg id="barcode"></svg>
                </div>
                <div class="awb-text">${order.tracking_number || 'PENDING'}</div>
                <div class="partner-text">${order.delivery_partner || 'Trackon'} Logistics</div>
              </div>

              <div class="info-grid">
                <div style="grid-column: span 2;">
                  <span class="section-label">Package Contents</span>
                  <div style="font-size: 10px; font-weight: 500; color: #333; line-height: 1.4;">
                    ${itemsText}
                  </div>
                </div>
              </div>
            </div>

            <div class="handling-footer">
              <span>Handle with Care</span>
              <span>Fragile: False</span>
            </div>
          </div>

          <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
          <script>
            window.onload = function() {
              const tracking = "${order.tracking_number || 'PENDING'}";
              if (tracking !== 'PENDING') {
                JsBarcode("#barcode", tracking, {
                  format: "CODE128",
                  width: 2,
                  height: 40,
                  displayValue: false,
                  margin: 0
                });
              }
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    labelWindow.document.write(htmlContent);
    labelWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[var(--admin-background)] pb-20">
      {/* Top Header */}
      <header className="h-20 bg-white border-b border-[var(--admin-border)] flex items-center justify-between px-10 sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--admin-light)] transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col">
            <h1 className="font-serif text-xl font-bold text-[var(--admin-text-primary)]">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
            <p className="text-[10px] font-bold text-[var(--admin-text-muted)] uppercase tracking-widest">Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'full' })}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => window.open(`/api/orders/${order.id}/invoice`, '_blank')}
            className="flex items-center gap-3 h-12 px-6 border border-slate-200 bg-white rounded-2xl text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm active:scale-[0.98]"
          >
            <Printer size={16} className="text-slate-400" /> Print Invoice
          </button>
          
          <div className="flex items-center h-12 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-md shadow-slate-200/50 group/actions ring-1 ring-black/[0.03]">
            {/* Main Action Button */}
            {(() => {
              const status = order.status?.toLowerCase();
              if (status === 'pending') return (
                <button 
                  onClick={() => handleUpdateStatus('Processing', { payment_status: 'paid' })}
                  className="h-full px-8 bg-slate-900 text-white text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-black transition-all flex items-center gap-3 active:scale-[0.98] w-full justify-center"
                >
                  <CreditCard size={16} className="text-white/70" /> Confirm Payment
                </button>
              );
              if (status === 'processing') return (
                <button 
                  onClick={() => handleUpdateStatus('Confirmed')}
                  className="h-full px-8 bg-indigo-600 text-white text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-indigo-700 transition-all flex items-center gap-3 shadow-inner active:scale-[0.98] w-full justify-center"
                >
                  <CheckCircle2 size={16} className="text-white/70" /> Approve Artwork
                </button>
              );
              if (status === 'confirmed') return (
                <button 
                  onClick={() => setShowShipModal(true)}
                  className="h-full px-8 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-[0.98] w-full justify-center"
                >
                  <Truck size={16} className="text-white/70" /> Add Tracking
                </button>
              );
              if (status === 'shipped') return (
                <button 
                  onClick={() => handleUpdateStatus('Delivered', { payment_status: 'paid' })}
                  className="h-full px-8 bg-emerald-600 text-white text-[11px] font-bold uppercase tracking-[0.12em] hover:bg-emerald-700 transition-all flex items-center gap-3 active:scale-[0.98] w-full justify-center"
                >
                  <CheckCircle2 size={16} className="text-white/70" /> Mark Delivered
                </button>
              );
              return (
                <div className="h-full px-8 bg-slate-50 text-slate-400 text-[11px] font-bold uppercase tracking-[0.12em] flex items-center gap-3 cursor-default w-full justify-center">
                  <CheckCircle2 size={16} /> {order.status}
                </div>
              );
            })()}
          </div>
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto p-10">
        {isCancelled && (
          <div className="mb-10 p-6 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500 text-white rounded-xl flex items-center justify-center">
                <XCircle size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-rose-600 uppercase tracking-wider">Order Cancelled</h2>
                <p className="text-[10px] text-rose-400 font-medium">This order is voided and excluded from all metrics.</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column: Main Order Content */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* Progress Tracker */}
            <div className="bg-white p-8 rounded-2xl border border-[var(--admin-border)] shadow-sm">
              <div className="flex justify-between items-center relative">
                {steps.map((step, idx) => (
                  <div key={step.label} className="flex-1 flex flex-col items-center relative z-10">
                    {idx < steps.length - 1 && (
                      <div className="absolute top-5 left-1/2 w-full h-[2px] bg-slate-100 -z-10">
                        <div className={`h-full transition-all duration-500 ${isCancelled ? 'bg-rose-500' : steps[idx+1].active ? 'bg-emerald-500' : 'bg-slate-100'}`} style={{ width: steps[idx+1].active ? '100%' : '0%' }} />
                      </div>
                    )}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all duration-300 ${
                      isCancelled ? 'bg-rose-500 text-white' : 
                      step.active ? 'bg-emerald-500 text-white' : 
                      'bg-slate-100 text-slate-400'
                    }`}>
                      <step.icon size={18} />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isCancelled ? 'text-rose-600' : step.active ? 'text-emerald-600' : 'text-slate-400'}`}>{step.label}</span>
                    {step.date && <span className="text-[8px] text-slate-400 mt-1">{new Date(step.date).toLocaleDateString()}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Artwork Review Section */}
            {(() => {
              const customizedItems = (order.products || order.order_items || []).filter((item: any) => item.is_customized);
              if (customizedItems.length === 0) return null;
              
              return (
                <div className="bg-white rounded-3xl border border-[var(--admin-border)] shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="px-8 py-6 border-b border-[var(--admin-border)] bg-slate-50/50 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold">Artwork Approval</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Review the customer's custom design</p>
                    </div>
                    {status === 'processing' && (
                      <button 
                        onClick={() => handleUpdateStatus('Confirmed')}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:scale-[1.05] active:scale-[0.98] transition-all"
                      >
                        <CheckCircle2 size={16} /> Approve Artwork
                      </button>
                    )}
                  </div>
                  <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {customizedItems.map((item: any, idx: number) => (
                      <div key={item.id} className="space-y-4">
                        <div className="aspect-square bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 relative group flex items-center justify-center">
                          <img 
                            src={item.customization_details?.preview || item.product_image || item.image || (item.products?.images && item.products.images[0])} 
                            className="w-full h-full object-contain p-8 group-hover:scale-105 transition-transform duration-700" 
                            alt="Design Preview" 
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
                        </div>
                        <div className="flex justify-between items-end px-2">
                          <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Item {idx + 1}</p>
                            <p className="text-sm font-bold text-slate-900">{item.title || item.product_title}</p>
                          </div>
                          <button 
                            onClick={() => {
                              window.open(item.customization_details?.preview || item.product_image || item.image || (item.products?.images && item.products.images[0]), '_blank');
                            }}
                            className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline"
                          >
                            <ExternalLink size={12} /> Full Res
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Line Items Card */}
            <div className="bg-white rounded-2xl border border-[var(--admin-border)] shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-[var(--admin-border)] bg-slate-50/50 flex justify-between items-center">
                <h3 className="text-lg font-bold">Line Items</h3>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{(order.products || order.order_items || []).length} Items</span>
              </div>

              {/* Table Headers */}
              <div className="px-8 py-3 border-b border-slate-100 bg-white flex items-center text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
                <div className="flex-1 pl-[88px]">Item Description</div>
                <div className="flex items-center gap-10 text-right pr-2">
                  <div className="min-w-[40px]">Qty</div>
                  <div className="min-w-[80px]">Price</div>
                  <div className="min-w-[80px]">Total</div>
                </div>
              </div>
              
              <div className="divide-y divide-slate-100">
                    {(order.products || order.order_items || []).map((item: any) => (
                  <div key={item.id} className="p-8 flex gap-8 items-start hover:bg-slate-50/50 transition-colors">
                    {/* Item Image - ENLARGED */}
                    <div className="w-32 h-40 bg-slate-50 rounded-2xl overflow-hidden shrink-0 border border-slate-100 relative group/img flex items-center justify-center">
                       {(() => {
                          // Check both snake_case and camelCase for customization details
                          const customization = item.customization_details || item.customizationDetails;
                          const imgSrc = customization?.preview || item.product_image || item.image || (item.products?.images && item.products.images[0]);
                          return imgSrc ? (
                            <img 
                              src={imgSrc} 
                              className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-500" 
                              alt={item.title || item.product_title} 
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                              <Package size={32} />
                            </div>
                          );
                       })()}
                       {item.is_customized && (
                         <div className="absolute top-2 right-2 px-2 py-1 bg-black text-white text-[8px] font-bold uppercase rounded-md shadow-lg">
                           Custom Design
                         </div>
                       )}
                    </div>

                    {/* Item Info */}
                    <div className="flex-1 min-w-0 pt-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-900 text-base mb-2">{item.title || item.product_title || 'Tote Bag'}</h4>
                          {(() => {
                            const customization = item.customization_details || item.customizationDetails;
                            if (!customization) return null;
                            return (
                              <div className="flex flex-wrap gap-2 mt-4">
                                {Object.entries(customization).map(([key, value]: [string, any]) => {
                                  if (key === 'preview' || key === 'canvasData') return null;
                                  return (
                                    <div key={key} className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                      {key}: {value}
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })()}
                        </div>

                        <div className="flex items-center gap-12 text-right">
                          <div className="min-w-[40px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Qty</p>
                            <p className="text-base font-bold text-slate-800">{item.quantity || 1}</p>
                          </div>
                          <div className="min-w-[90px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Price</p>
                            <p className="text-base font-bold text-slate-800">₹{item.price}</p>
                          </div>
                          <div className="min-w-[90px]">
                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Total</p>
                            <p className="text-base font-bold text-indigo-600">₹{(item.price * (item.quantity || 1))}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Items Footer: Notes & Totals */}
              <div className="p-10 border-t border-slate-100 bg-slate-50/30">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Customer Request & Notes</h4>
                    <div className="p-6 bg-white rounded-2xl border border-slate-200 border-dashed min-h-[100px] flex items-center">
                      <p className="text-sm text-slate-600 leading-relaxed italic">
                        {order.notes || order.shipping_details?.notes || "No specific instructions provided by the customer for this order."}
                      </p>
                    </div>
                  </div>

                  {(() => {
                    const items = order.products || order.order_items || [];
                    const itemsTotal = items.reduce((acc: number, item: any) => acc + (Number(item.price) * (item.quantity || 1)), 0);
                    
                    // Force the logic: if total is 249 and items are 199, shipping is 50.
                    // If itemsTotal already matches order.total_amount, assume item price included shipping and adjust.
                    const subtotal = itemsTotal === order.total_amount ? (itemsTotal - 50) : itemsTotal;
                    const shipping = order.total_amount - subtotal;
                    
                    return (
                      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-5">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Financial Breakdown</h4>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm font-bold text-slate-500">
                            <span>Subtotal</span>
                            <span className="text-slate-900">₹{subtotal}</span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-slate-500">
                            <span>Shipping</span>
                            <span className="text-slate-900">₹{shipping}</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm font-bold text-emerald-600">
                              <span>Discount</span>
                              <span>-₹{order.discount_amount}</span>
                            </div>
                          )}
                          <div className="pt-6 border-t border-slate-100 flex justify-between items-end">
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Grand Total</p>
                              <p className="text-3xl font-bold text-slate-900">₹{order.total_amount}</p>
                            </div>
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] ${order.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                              {order.payment_status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--admin-border)] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Customer</h4>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  {order.shipping_details?.name?.[0] || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-slate-900">{order.shipping_details?.name}</p>
                    {!order.user_id && (
                      <span className="px-1.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-100 rounded text-[8px] font-bold uppercase tracking-wider">Guest</span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium">Customer since {new Date(order.created_at).getFullYear()}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600 truncate">{order.shipping_details?.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600">{order.shipping_details?.phone || 'N/A'}</span>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin size={14} className="text-slate-400 mt-0.5" />
                  <span className="text-[11px] font-medium text-slate-600 leading-relaxed">
                    {order.shipping_details?.address}, {order.shipping_details?.city}, {order.shipping_details?.zip}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="bg-white p-6 rounded-2xl border border-[var(--admin-border)] shadow-sm">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Payment</h4>
              
              {order.payment_method && (
                <div className="mb-4 text-[11px] text-slate-600 flex flex-col gap-1">
                  <span className="text-slate-400 uppercase text-[9px] font-bold">Method</span>
                  <span className="font-bold text-slate-800">{order.payment_method}</span>
                </div>
              )}

              {order.payment_id && (
                <div className="mb-4 text-[11px] text-slate-600 flex flex-col gap-1">
                  <span className="text-slate-400 uppercase text-[9px] font-bold">Transaction / UTR ID</span>
                  <span className="font-mono font-bold bg-slate-50 text-slate-800 px-2 py-1 rounded border border-slate-100 select-all">{order.payment_id}</span>
                </div>
              )}

              {order.payment_status === 'paid' ? (
                <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-emerald-500" />
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Paid Successfully</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex items-center gap-3">
                    <Clock size={16} className="text-amber-500" />
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Awaiting Payment</span>
                  </div>
                  {order.shipping_details?.payment_screenshot_url && (
                    <button onClick={() => setShowScreenshot(true)} className="w-full py-3 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-bold uppercase hover:bg-slate-200 transition-colors">View UPI Proof</button>
                  )}
                  <button onClick={() => handleUpdateStatus('Processing', { payment_status: 'paid' })} className="w-full py-3 bg-black text-white rounded-xl text-[10px] font-bold uppercase hover:bg-slate-800 transition-colors">Confirm Payment</button>
                </div>
              )}
            </div>

            {/* Admin Actions */}
            <div className="bg-slate-900 p-6 rounded-2xl text-white shadow-lg shadow-slate-200">
              <h4 className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-4">Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={handlePrintLabel}
                  className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Printer size={14} className="text-white/40 group-hover:text-white" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Shipping Label</span>
                  </div>
                  <ChevronRight size={12} className="text-white/20" />
                </button>

                <button 
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel this order? This action cannot be undone.")) {
                      handleUpdateStatus('Cancelled');
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl transition-colors group mt-2"
                >
                  <div className="flex items-center gap-3">
                    <XCircle size={14} className="text-rose-500/60 group-hover:text-rose-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500/80 group-hover:text-rose-500">Cancel Order</span>
                  </div>
                  <ChevronRight size={12} className="text-rose-500/20" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Shipment Modal */}
      <AnimatePresence>
        {showShipModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm" onClick={() => setShowShipModal(false)}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="bg-white max-w-md w-full rounded-[40px] p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] border border-slate-100 relative overflow-hidden" 
              onClick={e => e.stopPropagation()}
            >
              {/* Decorative Background Element */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-50 rounded-full blur-3xl opacity-50" />
              
              <div className="relative">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mb-8">
                  <Truck size={32} />
                </div>
                
                <h2 className="font-serif text-3xl font-bold text-slate-900 mb-2">Ship Order</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.15em] mb-10">Enter tracking details for the customer</p>
                
                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Delivery Partner</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                        <Package size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. Delhivery, BlueDart" 
                        value={deliveryPartner}
                        onChange={(e) => setDeliveryPartner(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] border border-transparent text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Tracking ID (AWB)</label>
                    <div className="relative group">
                      <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors">
                        <Tag size={18} />
                      </div>
                      <input 
                        type="text" 
                        placeholder="e.g. 1234567890" 
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[24px] border border-transparent text-sm font-bold outline-none focus:bg-white focus:border-emerald-500/30 focus:ring-4 focus:ring-emerald-500/5 transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button 
                      onClick={() => setShowShipModal(false)} 
                      className="flex-1 py-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-[24px] transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleShipOrder}
                      disabled={isUpdatingShipment}
                      className="flex-[1.5] py-5 bg-emerald-600 text-white rounded-[24px] text-[11px] font-bold uppercase tracking-[0.2em] shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isUpdatingShipment ? 'Processing...' : 'Update & Ship'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {showScreenshot && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-10 bg-black/95 backdrop-blur-md" onClick={() => setShowScreenshot(false)}>
            <button className="absolute top-6 right-6 md:top-10 md:right-10 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10"><X size={24} /></button>
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <div className="w-full bg-white/5 border border-white/10 rounded-[32px] p-2 overflow-hidden shadow-2xl"><img src={order.shipping_details?.payment_screenshot_url} className="w-full max-h-[75vh] object-contain rounded-[24px]" alt="Payment Screenshot" /></div>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <a href={order.shipping_details?.payment_screenshot_url} target="_blank" download className="px-8 py-4 bg-white text-black rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-xl"><Download size={16} /> Download Proof</a>
                <button onClick={() => { handleUpdateStatus('Processing', { payment_status: 'paid' }); setShowScreenshot(false); }} className="px-8 py-4 bg-emerald-500 text-white rounded-2xl font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"><CheckCircle2 size={16} /> Confirm & Start Processing</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
