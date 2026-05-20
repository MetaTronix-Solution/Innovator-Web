"use client";

import React, { useState } from "react";
import { ShoppingCart, Check, Ban, Loader2 } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product";
import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";

interface ProductCardProps {
  product: Product;
  isInCart: boolean;
  onCartUpdate: (product: Product, action: "add" | "remove") => void;
}

export default function ProductCard({
  product,
  isInCart,
  onCartUpdate,
}: ProductCardProps) {
  const dispatch = useDispatch();
  const [cartLoading, setCartLoading] = useState(false);

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartLoading) return;

    setCartLoading(true);
    try {
      if (isInCart) {
        const response = await fetch(`/api/cart-items/${product.id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove from cart");
        dispatch(removeFromCart(product.id));
        onCartUpdate(product, "remove");
      } else {
        const response = await fetch("/api/cart-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
        if (!response.ok) throw new Error("Failed to add to cart");
        dispatch(addToCart(product));
        onCartUpdate(product, "add");
      }
    } catch (error) {
      console.error("Cart action failed:", error);
    } finally {
      setCartLoading(false);
    }
  };

  const isOutOfStock = product.stock === 0;
  const categoryName =
    product.category_details?.name || product.category || "General";
  const price = parseFloat(String(product.price)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  return (
    <div className="group bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col hover:border-border hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden p-6">
        <div className="relative w-full h-full">
          <Image
            src={product.image || "/placeholder-product.png"}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        </div>

        {/* Stock badge on image */}
        <div className="absolute top-2.5 left-2.5">
          {isOutOfStock ? (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              Out of stock
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900">
              In stock
            </span>
          )}
        </div>
      </div>

      <div className="px-4 pt-3 pb-2 flex flex-col gap-3 flex-1">
        <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[40px]">
          {product.name}
        </p>

        {product.description && (
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
            {product.description}
          </p>
        )}

        <span className="self-start text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
          {categoryName}
        </span>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground">Price</span>
            <div className="text-base font-semibold text-foreground font-mono">
              <span className="text-xs font-normal text-muted-foreground mr-0.5">
                Rs
              </span>
              {price}
            </div>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground">Stock</span>
            <span
              className={`text-sm font-semibold font-mono ${
                isOutOfStock ? "text-red-500" : "text-green-600"
              }`}
            >
              {isOutOfStock ? "0" : product.stock}
            </span>
          </div>
        </div>

        {isOutOfStock ? (
          <button
            disabled
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium opacity-40 cursor-not-allowed bg-muted text-muted-foreground"
          >
            <Ban size={15} /> Sold out
          </button>
        ) : isInCart ? (
          <button
            onClick={handleCartClick}
            disabled={cartLoading}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-secondary/90 transition-all hover:bg-secondary disabled:opacity-60"
          >
            {cartLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Check size={15} />
            )}
            Added to Cart
          </button>
        ) : (
          <button
            onClick={handleCartClick}
            disabled={cartLoading}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-medium bg-primary/90 hover:bg-primary text-white transition-all active:scale-95 disabled:opacity-60"
          >
            {cartLoading ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ShoppingCart size={15} />
            )}
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}
