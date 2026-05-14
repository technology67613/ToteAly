"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as fabric from "fabric";
import { 
  Trash2, Type, Image as ImageIcon, 
  Download, ShoppingBag, Sparkles, 
  RotateCcw, Palette, ArrowLeft, Loader2,
  Maximize, FlipHorizontal, FlipVertical,
  Layers, Lock, Unlock, Copy, Scissors,
  Plus, Sparkles as SparklesIcon
} from "lucide-react";
import { removeBackground } from "@imgly/background-removal";
import { useCartStore, CartItem } from "@/store/cartStore";
import { toast } from "sonner";
import { FALLBACK_PRODUCTS } from "@/lib/catalog";

const FONTS = [
  { name: "Retro Serif", value: "Noto Serif" },
  { name: "Modern Sans", value: "Inter" },
  { name: "Elegant Script", value: "Dancing Script" },
  { name: "Classic Mono", value: "Courier New" },
];

const COLORS = [
  "#900C3F", "#FF69B4", "#000000", "#FFFFFF", 
  "#2D5A27", "#1A3A5F", "#E63946", "#F4A261"
];

type CustomizableProduct = {
  id: string;
  title: string;
  price: number;
  images?: string[];
  is_customizable?: boolean;
  isCustomizable?: boolean;
};

export default function Customize() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<fabric.Canvas | null>(null);
  const [textInput, setTextInput] = useState("");
  const [selectedFont, setSelectedFont] = useState(FONTS[0].value);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [selectedObject, setSelectedObject] = useState<fabric.Object | null>(null);
  const [products, setProducts] = useState<CustomizableProduct[]>([]);
  const [selectedBag, setSelectedBag] = useState<CustomizableProduct | null>(null);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [activeTab, setActiveTab] = useState<"text" | "style" | "assets">("text");
  const [isMobile, setIsMobile] = useState(false);
  const [toolbarPos, setToolbarPos] = useState({ top: 0, left: 0, visible: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  
  const { addItem, openCart } = useCartStore();

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/products");
        if (!res.ok) throw new Error("Products could not be loaded.");
        const data = await res.json();
        const customizable = Array.isArray(data)
          ? data.filter((product) => product.is_customizable || product.isCustomizable)
          : [];
        const source = customizable.length
          ? customizable
          : FALLBACK_PRODUCTS.filter((product) => product.isCustomizable);
        const requestedProduct = new URLSearchParams(window.location.search).get("product");

        setProducts(source);
        setSelectedBag(source.find((product) => product.id === requestedProduct || product._id === requestedProduct) || source[0] || null);
        setProductsError("");
      } catch (error: any) {
        const fallbackProducts = FALLBACK_PRODUCTS.filter((product) => product.isCustomizable);
        const requestedProduct = new URLSearchParams(window.location.search).get("product");

        setProducts(fallbackProducts);
        setSelectedBag(fallbackProducts.find((product) => product.id === requestedProduct || product._id === requestedProduct) || fallbackProducts[0] || null);
        setProductsError("");
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !canvasRef.current || !containerRef.current) return;
    
    const containerWidth = containerRef.current.offsetWidth;
      const size = Math.min(containerWidth, 500);

      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: size,
        height: size,
        backgroundColor: "#fcf9f2",
      });
      
      if (selectedBag?.images?.[0]) {
        loadBagMockup(initCanvas, selectedBag.images[0], size);
      }

      // Selection Events
      const updateToolbar = () => {
        const active = initCanvas.getActiveObject();
        if (active) {
          const rect = active.getBoundingRect();
          setToolbarPos({
            top: rect.top - 60,
            left: rect.left + rect.width / 2,
            visible: true
          });
          setSelectedObject(active);
        } else {
          setToolbarPos(prev => ({ ...prev, visible: false }));
          setSelectedObject(null);
        }
      };

      initCanvas.on("selection:created", updateToolbar);
      initCanvas.on("selection:updated", updateToolbar);
      initCanvas.on("selection:cleared", () => {
        setToolbarPos(prev => ({ ...prev, visible: false }));
        setSelectedObject(null);
      });
      initCanvas.on("object:moving", updateToolbar);
      initCanvas.on("object:scaling", updateToolbar);

      setCanvas(initCanvas);

      return () => {
        initCanvas.dispose();
      };
  }, [selectedBag]);

  const loadBagMockup = (targetCanvas: fabric.Canvas, url: string, size?: number) => {
    const canvasSize = size || targetCanvas.width || 500;
    fabric.FabricImage.fromURL(url).then((img) => {
      img.scaleToWidth(canvasSize);
      targetCanvas.set({
        backgroundImage: img
      });
      targetCanvas.centerObject(targetCanvas.backgroundImage!);
      targetCanvas.renderAll();
    });
  };

  const changeBag = (bag: CustomizableProduct) => {
    setSelectedBag(bag);
    if (canvas && bag.images?.[0]) {
      loadBagMockup(canvas, bag.images[0]);
    }
  };

  const addText = () => {
    if (!canvas || !selectedBag) return;
    const text = new fabric.IText((textInput || "Your Design").slice(0, 40), {
      left: 125,
      top: 200,
      fontFamily: selectedFont,
      fill: selectedColor,
      fontSize: 40,
      fontWeight: "bold",
      textAlign: "center",
      cursorColor: "#FF69B4",
    });
    canvas.add(text);
    canvas.centerObjectH(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    setTextInput("");
  };

  // Toolbar Actions
  const flipX = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.set("flipX", !obj.flipX);
      canvas.renderAll();
    }
  };

  const flipY = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.set("flipY", !obj.flipY);
      canvas.renderAll();
    }
  };

  const updateActiveFont = (font: string) => {
    setSelectedFont(font);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set("fontFamily", font);
      canvas.renderAll();
    }
  };

  const updateActiveColor = (color: string) => {
    setSelectedColor(color);
    if (!canvas) return;
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'i-text') {
      activeObject.set("fill", color);
      canvas.renderAll();
    }
  };

  const duplicateObject = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      obj.clone().then((cloned: fabric.Object) => {
        cloned.set({
          left: obj.left! + 20,
          top: obj.top! + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  };

  const toggleLock = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      const isLocked = obj.lockMovementX;
      obj.set({
        lockMovementX: !isLocked,
        lockMovementY: !isLocked,
        lockScalingX: !isLocked,
        lockScalingY: !isLocked,
        lockRotation: !isLocked,
        hasControls: isLocked,
      });
      canvas.renderAll();
      setSelectedObject(obj); // trigger re-render
    }
  };

  const bringToFront = () => {
    if (!canvas) return;
    const obj = canvas.getActiveObject();
    if (obj) {
      canvas.bringObjectToFront(obj);
      canvas.renderAll();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas || !e.target.files || !e.target.files[0]) return;
    if (e.target.files[0].size > 5 * 1024 * 1024) {
      alert("Please upload an image under 5 MB.");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result;
      if (typeof data === "string") {
        try {
          const img = await fabric.FabricImage.fromURL(data, {
            crossOrigin: 'anonymous'
          });
          img.scaleToWidth(150);
          canvas.add(img);
          canvas.centerObject(img);
          canvas.setActiveObject(img);
          canvas.renderAll();
        } catch (error) {
          console.error("Error loading image", error);
        }
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  };

  const deleteSelected = () => {
    if (!canvas) return;
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
      activeObjects.forEach((obj: fabric.Object) => {
        // Don't remove the background mockup (it's the backgroundImage now, but safety check)
        if (obj !== canvas.backgroundImage) {
          canvas.remove(obj);
        }
      });
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  };

  const removeBackgroundHandler = async () => {
    if (!canvas || isRemovingBg) return;
    const activeObject = canvas.getActiveObject();
    if (!activeObject || !(activeObject instanceof fabric.FabricImage)) {
      toast.error("Please select an image first!");
      return;
    }

    try {
      setIsRemovingBg(true);
      const img = activeObject as fabric.FabricImage;
      
      // Get the image data
      const dataUrl = img.toDataURL({ format: 'png' });

      toast.info("Removing background... 🪄", { duration: 2000 });

      // Use client-side library (free and no add-on required)
      const blob = await removeBackground(dataUrl);
      const url = URL.createObjectURL(blob);

      // Replace old image with the new transparent one
      const newImg = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      newImg.set({
          left: img.left, top: img.top, scaleX: img.scaleX, scaleY: img.scaleY,
          angle: img.angle, flipX: img.flipX, flipY: img.flipY,
          originX: img.originX, originY: img.originY,
      });

      canvas.remove(img);
      canvas.add(newImg);
      canvas.setActiveObject(newImg);
      canvas.renderAll();
      setSelectedObject(newImg);
      toast.success("Background removed! ✨");
    } catch (err: any) {
      console.error("BG Removal Error:", err);
      toast.error("Background removal failed. Try another image.");
    } finally {
      setIsRemovingBg(false);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach((obj: fabric.Object) => {
      // Don't remove the background mockup
      if (obj !== canvas.backgroundImage) {
        canvas.remove(obj);
      }
    });
    canvas.renderAll();
  };

  const handleAddToCart = () => {
    if (!canvas || !selectedBag) return;
    setIsAddingToCart(true);
    const bag = selectedBag;
    
    // Create a high-quality capture of the design
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });

    const item: CartItem = {
      id: `custom-${Date.now()}`,
      productId: bag.id,
      title: bag.title,
      price: bag.price,
      quantity: 1,
      isCustomized: true,
      customizationDetails: {
        bagType: bag.title,
        canvasData: dataUrl,
        preview: dataUrl
      }
    };

    setTimeout(() => {
      addItem(item);
      setIsAddingToCart(false);
      toast.success("Custom design added to cart!", { duration: 1000 });
      openCart();
    }, 800);
  };

  const downloadDesign = () => {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({
      format: 'png',
      quality: 1,
      multiplier: 1
    });
    const link = document.createElement('a');
    link.download = `tote-aly-design-${selectedBag?.id || "design"}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <main className="min-h-screen bg-[#FFF8F0] text-[#900C3F] flex flex-col items-center">
      {/* Premium Header */}
      <div className="w-full bg-white border-b border-[#F5ECD7] py-4 lg:py-6 px-4 lg:px-8 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3 lg:gap-6">
          <Link href="/shop" className="p-2 hover:bg-[#F5ECD7] rounded-full transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col">
            <p className="text-[8px] lg:text-[10px] font-bold text-[#FF69B4] uppercase tracking-[0.3em]">Studio</p>
            <h1 className="font-serif text-lg lg:text-2xl font-bold">Canvas</h1>
          </div>
        </div>
        
        <div className="flex gap-2 lg:gap-4">
          <button onClick={downloadDesign} className="flex items-center gap-2 px-3 lg:px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-[#FF69B4] transition-colors border border-[#F5ECD7] rounded-xl">
            <Download size={14} /> <span className="hidden sm:inline">Save</span>
          </button>
          <button onClick={clearCanvas} className="hidden md:flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:text-red-600 transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
          <button 
            onClick={handleAddToCart}
            disabled={isAddingToCart || !selectedBag}
            className="flex items-center gap-2 lg:gap-3 px-4 lg:px-8 py-2 lg:py-3 bg-[#900C3F] text-white rounded-xl lg:rounded-2xl font-bold text-[10px] lg:text-sm shadow-lg shadow-[#900C3F]/20 hover:bg-[#FF69B4] transition-all active:scale-95 disabled:opacity-50"
          >
            {isAddingToCart ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
            {isAddingToCart ? "..." : selectedBag ? `Add • ₹${selectedBag.price}` : "No Product"}
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:h-[calc(100vh-80px)]">
        {/* Mobile Tabs */}
        <div className="lg:hidden flex border-b border-[#F5ECD7] bg-white sticky top-[68px] z-30">
          {(["text", "style", "assets"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-4 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 ${
                activeTab === tab ? "border-[#FF69B4] text-[#900C3F]" : "border-transparent text-[#900C3F]/40"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar Left (Desktop & Mobile Content) */}
        <div className={`lg:col-span-3 border-r border-[#F5ECD7] bg-white p-6 lg:p-8 flex flex-col gap-8 lg:gap-10 overflow-y-auto ${!isMobile ? 'block' : activeTab === 'text' || activeTab === 'style' ? 'block' : 'hidden'}`}>
          
          {(activeTab === 'text' || !isMobile) && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#900C3F] font-bold text-xs uppercase tracking-widest">
                <Type size={16} className="text-[#FF69B4]" /> Typography
              </div>
              <div className="flex flex-col gap-3">
                <input 
                  type="text" 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  maxLength={40}
                  placeholder="Type something..." 
                  className="w-full px-4 py-3 lg:px-5 lg:py-4 rounded-xl lg:rounded-2xl bg-[#FFF8F0] border border-[#F5ECD7] text-sm focus:outline-none focus:border-[#FF69B4] transition-all" 
                />
                <button 
                  onClick={addText}
                  className="w-full py-3 lg:py-4 bg-[#900C3F] text-white font-bold text-xs uppercase tracking-widest rounded-xl lg:rounded-2xl hover:bg-[#FF69B4] transition-all"
                >
                  Place Text
                </button>
              </div>
            </div>
          )}

          {(activeTab === 'style' || !isMobile) && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">Font Family</label>
                <div className="grid grid-cols-1 gap-2">
                  {FONTS.map(f => (
                    <button
                      key={f.value}
                      onClick={() => updateActiveFont(f.value)}
                      className={`px-4 py-2.5 text-left rounded-xl border text-sm transition-all ${
                        selectedFont === f.value 
                          ? "bg-[#900C3F] text-white border-[#900C3F]" 
                          : "bg-white text-[#900C3F] border-[#F5ECD7]"
                      }`}
                      style={{ fontFamily: f.value }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#900C3F]/40">Ink Color</label>
                <div className="grid grid-cols-4 lg:grid-cols-4 gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => updateActiveColor(c)}
                      className={`aspect-square rounded-full border-2 transition-all p-0.5 ${selectedColor === c ? 'border-[#FF69B4] scale-110' : 'border-transparent'}`}
                    >
                      <div className="w-full h-full rounded-full border border-black/5" style={{ backgroundColor: c }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="lg:col-span-6 bg-[#F5ECD7]/30 flex items-center justify-center relative overflow-hidden p-4 md:p-10 min-h-[400px] lg:min-h-0" ref={containerRef}>
          {/* Bag Background Aura */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF69B4]/5 to-transparent" />
          
          {/* Stable Wrapper for Canvas + Toolbar */}
          <div className="relative" style={{ 
            width: canvas?.width || 500, 
            height: canvas?.height || 500 
          }}>
            {/* Floating Contextual Toolbar */}
            {toolbarPos.visible && selectedObject && (
              <div 
                className="absolute z-[60] flex items-center gap-0.5 bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-xl shadow-2xl border border-[#F5ECD7] animate-in fade-in zoom-in-95 duration-200"
                style={{ 
                  top: toolbarPos.top < 0 ? 10 : toolbarPos.top, 
                  left: toolbarPos.left,
                  transform: "translateX(-50%)",
                  maxWidth: '90vw'
                }}
              >
                {/* Contextual Tools */}
                {(selectedObject as any).src !== "/mockups/bag.png" && (
                  <>
                    {selectedObject instanceof fabric.FabricImage && (
                      <button 
                        onClick={removeBackgroundHandler} 
                        className="p-2 hover:bg-[#FF69B4]/10 rounded-lg text-[#900C3F] transition-all relative"
                        disabled={isRemovingBg}
                      >
                        {isRemovingBg ? <Loader2 size={16} className="animate-spin text-[#FF69B4]" /> : <Scissors size={16} />}
                        {isRemovingBg && (
                          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#900C3F] text-white text-[10px] px-2 py-1 rounded-md shadow-xl whitespace-nowrap z-[100]">
                            AI Removing Background...
                          </span>
                        )}
                      </button>
                    )}
                    <button onClick={flipX} className="p-2 hover:bg-[#F5ECD7] rounded-lg text-[#900C3F] transition-all"><FlipHorizontal size={16} /></button>
                    <button onClick={duplicateObject} className="p-2 hover:bg-[#F5ECD7] rounded-lg text-[#900C3F] transition-all"><Copy size={16} /></button>
                    <button onClick={toggleLock} className={`p-2 rounded-lg transition-all ${selectedObject.lockMovementX ? 'bg-[#900C3F] text-white' : 'hover:bg-[#F5ECD7] text-[#900C3F]'}`}>
                      {selectedObject.lockMovementX ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <button onClick={deleteSelected} className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-all"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            )}

            {/* Main Work Area */}
            <div className="relative shadow-2xl rounded-[32px] md:rounded-[40px] overflow-hidden bg-white border border-[#F5ECD7] flex items-center justify-center z-50">
              <canvas ref={canvasRef} />
              
              {!toolbarPos.visible && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#F5ECD7] flex items-center gap-2 shadow-sm pointer-events-none">
                  <p className="text-[8px] font-bold text-[#900C3F]/40 uppercase tracking-widest">Tap to edit</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assets Right (Desktop & Mobile Content) */}
        <div className={`lg:col-span-3 border-l border-[#F5ECD7] bg-white p-6 lg:p-8 flex flex-col gap-6 lg:gap-8 overflow-y-auto ${!isMobile ? 'block' : activeTab === 'assets' ? 'block' : 'hidden'}`}>
           <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 text-[#900C3F] font-bold text-xs uppercase tracking-widest">
                <ImageIcon size={16} className="text-[#FF69B4]" /> Assets
              </div>
              <label className="w-full py-8 lg:py-10 border-2 border-[#F5ECD7] border-dashed rounded-2xl lg:rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#FF69B4] hover:bg-[#FF69B4]/5 transition-all group">
                <Download size={18} className="text-[#FF69B4]" />
                <span className="text-[8px] font-bold uppercase tracking-widest text-[#900C3F]/60 text-center">Upload Art</span>
                <input type="file" accept="image/png,image/jpeg" onChange={handleImageUpload} className="hidden" />
              </label>
           </div>

           {/* Bag Selection Section */}
           <div className="flex flex-col gap-4 mt-4">
              <div className="flex items-center gap-2 text-[#900C3F] font-bold text-xs uppercase tracking-widest">
                <Palette size={16} className="text-[#FF69B4]" /> Bag Type
              </div>
              <div className="grid grid-cols-2 gap-2">
                {productsLoading && (
                  <div className="col-span-2 rounded-xl border border-[#F5ECD7] p-4 text-xs font-bold uppercase tracking-widest text-[#900C3F]/50">
                    Loading designs...
                  </div>
                )}
                {!productsLoading && productsError && (
                  <div className="col-span-2 rounded-xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-600">
                    {productsError}
                  </div>
                )}
                {products.map(bag => (
                  <button
                    key={bag.id}
                    onClick={() => changeBag(bag)}
                    className={`flex flex-col p-3 rounded-xl border transition-all text-left ${
                      selectedBag?.id === bag.id 
                        ? "bg-[#900C3F] border-[#900C3F] text-white shadow-md" 
                        : "bg-white border-[#F5ECD7] text-[#900C3F] hover:border-[#FF69B4]"
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-widest mb-1 opacity-80">{bag.title}</span>
                    <span className="text-sm font-bold font-serif">₹{bag.price}</span>
                  </button>
                ))}
              </div>
           </div>

            <div className="mt-auto bg-[#F5ECD7]/30 p-5 lg:p-6 rounded-2xl lg:rounded-3xl flex flex-col gap-3 lg:gap-4">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-bold text-[#900C3F]/40 uppercase tracking-widest">Total</span>
                <span className="font-serif text-2xl lg:text-3xl font-bold">{selectedBag ? `₹${selectedBag.price}` : "₹0"}</span>
              </div>
              <p className="text-[8px] text-[#900C3F]/40 leading-tight">{selectedBag ? `Includes ${selectedBag.title} + Custom AI Print.` : "Select a bag style to get started."}</p>
           </div>
        </div>
      </div>
    </main>
  );
}
