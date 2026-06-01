"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  ShoppingCart,
  Check,
  Loader2,
  Package,
  Tag,
  Clock,
  Ban,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";
import { ur } from "zod/v4/locales";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isInCart = cartItems.some((item) => item.product === id);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, cartRes] = await Promise.all([
          fetch(`/api/products/${id}`),
          fetch("/api/cart-items"),
        ]);

        if (!productRes.ok) throw new Error("Product not found.");
        const productData = await productRes.json();
        setProduct(productData);

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData);
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCartClick = async () => {
    if (!product || cartLoading) return;
    setCartLoading(true);
    try {
      if (isInCart) {
        const cartItem = cartItems.find((item) => item.product === id);
        const response = await fetch(`/api/cart-items/${cartItem.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove from cart");
        setCartItems((prev) => prev.filter((item) => item.product !== id));
        dispatch(removeFromCart(product.id));
      } else {
        const response = await fetch("/api/cart-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!response.ok) throw new Error("Failed to add to cart");
        setCartItems((prev) => [...prev, { product: id, quantity: 1 }]);
        dispatch(addToCart(product));
      }
    } catch (error) {
      console.error("Cart action failed:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getImages = (product: Product): string[] => {
    const imgs = (product as any).images;
    if (Array.isArray(imgs) && imgs.length > 0) {
      return imgs
        .map((img: any) =>
          typeof img === "string"
            ? getMediaUrl(img)
            : getMediaUrl(img.image ?? img.url ?? ""),
        )
        .filter((url): url is string => url !== null);
    }
    const single = getMediaUrl(product.image);
    return single ? [single] : ["/placeholder-product.png"];
  };

  const scrollToImage = (index: number, images: string[]) => {
    if (!scrollRef.current) return;
    const next = Math.max(0, Math.min(index, images.length - 1));
    setActiveImageIndex(next);
    const child = scrollRef.current.children[next] as HTMLElement;
    child?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-200 dark:border-zinc-800 border-t-orange-500 animate-spin" />
          <p className="text-xs text-zinc-400 tracking-wide">
            Loading product…
          </p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-zinc-50 dark:bg-zinc-950">
        <p className="text-destructive text-sm">
          {error || "Product not found."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOutOfStock = product.stock === 0;
  const price = parseFloat(String(product.price)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  const images = getImages(product);
  const hasMultipleImages = images.length > 1;

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-secondary/90 text-zinc-900 dark:text-zinc-100">
      <div className="md:hidden text-foreground" onClick={() => router.back()}>
        <ArrowLeft />
      </div>
      <div className="relative bg-secondary/90">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none"
          style={{ scrollbarWidth: "none" }}
          onScroll={(e) => {
            const el = e.currentTarget;
            const index = Math.round(el.scrollLeft / el.clientWidth);
            setActiveImageIndex(index);
          }}
        >
          {images.map((src, i) => (
            <div
              key={i}
              className="relative shrink-0 w-full aspect-square snap-center"
              style={{ height: "480px" }}
            >
              <Image
                src={src || "/placeholder-product.png"}
                alt={`${product.name} – image ${i + 1}`}
                fill
                className="object-contain p-6"
                unoptimized
                priority={i === 0}
              />
            </div>
          ))}
        </div>

        <div className="absolute top-4 left-4 z-10">
          {isOutOfStock ? (
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/60 backdrop-blur-sm">
              Out of stock
            </span>
          ) : (
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/60 backdrop-blur-sm">
              In stock
            </span>
          )}
        </div>

        {hasMultipleImages && (
          <>
            <button
              onClick={() => scrollToImage(activeImageIndex - 1, images)}
              disabled={activeImageIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm backdrop-blur-sm disabled:opacity-30 transition-opacity"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => scrollToImage(activeImageIndex + 1, images)}
              disabled={activeImageIndex === images.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-sm backdrop-blur-sm disabled:opacity-30 transition-opacity"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => scrollToImage(i, images)}
                className={`rounded-full transition-all duration-200 ${
                  i === activeImageIndex
                    ? "w-5 h-1.5 bg-orange-500"
                    : "w-1.5 h-1.5 bg-zinc-300 dark:bg-zinc-600 hover:bg-zinc-400 dark:hover:bg-zinc-500"
                }`}
              />
            ))}
          </div>
        )}

        {hasMultipleImages && (
          <div className="absolute top-4 right-4 z-10 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-black/30 text-white backdrop-blur-sm">
            {activeImageIndex + 1} / {images.length}
          </div>
        )}

        {hasMultipleImages && (
          <div
            className="flex gap-2 overflow-x-auto px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => scrollToImage(i, images)}
                className={`relative shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-150 ${
                  i === activeImageIndex
                    ? "border-orange-500 scale-105 shadow-md"
                    : "border-zinc-200 dark:border-zinc-700 opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={src || "/placeholder-product.png"}
                  alt={`Thumbnail ${i + 1}`}
                  fill
                  className="object-contain p-1"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="self-start text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            {product.category_details?.name || "General"}
          </span>
          <h1 className="text-xl font-bold leading-snug tracking-tight">
            {product.name}
          </h1>
        </div>

        <div className="flex items-stretch gap-3">
          <div className="flex-1 bg-card border hover:border-primary rounded-2xl px-4 py-3">
            <p className="text-[11px] text-secondary-foreground font-medium mb-0.5 uppercase tracking-wider">
              Price
            </p>
            <p className="text-2xl font-bold font-mono text-primary/90 leading-none">
              <span className="text-sm font-normal text-zinc-400 mr-1">Rs</span>
              {price}
            </p>
          </div>
          <div className="flex-1 bg-card border hover:border-primary rounded-2xl px-4 py-3">
            <p className="text-[11px] text-secondary-foreground font-medium mb-0.5 uppercase tracking-wider">
              Stock
            </p>
            <p
              className={`text-2xl font-bold font-mono leading-none ${isOutOfStock ? "text-red-500" : "text-emerald-600"}`}
            >
              {product.stock.toLocaleString()}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="bg-card  border border-border rounded-2xl p-4">
            <p className="text-[11px] font-semibold text-secondary-foreground uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-0">
          <p className="text-[11px] font-semibold text-secondary-foreground uppercase tracking-wider mb-3">
            Details
          </p>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <Tag size={14} className="text-zinc-400 shrink-0" />
              <span className="text-zinc-500">Category</span>
              <span className="ml-auto font-medium text-zinc-800 dark:text-zinc-200">
                {product.category_details?.name || "General"}
              </span>
            </div>
            <div className="flex items-center gap-3 py-2.5 text-sm">
              <Package size={14} className="text-zinc-400 shrink-0" />
              <span className="text-zinc-500">Stock available</span>
              <span className="ml-auto font-medium text-zinc-800 dark:text-zinc-200">
                {product.stock.toLocaleString()} units
              </span>
            </div>
            {(product as any).created_at && (
              <div className="flex items-center gap-3 py-2.5 text-sm">
                <Clock size={14} className="text-zinc-400 shrink-0" />
                <span className="text-zinc-500">Added on</span>
                <span className="ml-auto font-medium text-zinc-800 dark:text-zinc-200">
                  {formatDate((product as any).created_at)}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-2xl px-4 pb-6 pt-3  pointer-events-auto">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-4 rounded-2xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed text-sm"
            >
              <Ban size={17} /> Out of Stock
            </button>
          ) : isInCart ? (
            <Button
              variant="secondary"
              onClick={handleCartClick}
              disabled={cartLoading}
              className="w-full py-4 rounded-2xl h-auto text-sm font-semibold cursor-pointer"
            >
              {cartLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Check size={17} className="text-emerald-600" />
              )}
              Added to Cart
            </Button>
          ) : (
            <Button
              onClick={handleCartClick}
              disabled={cartLoading}
              className="w-full py-4 rounded-2xl h-auto text-sm font-semibold cursor-pointer bg-orange-500 hover:bg-orange-600 active:scale-[0.98] transition-all"
            >
              {cartLoading ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <ShoppingCart size={17} />
              )}
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
