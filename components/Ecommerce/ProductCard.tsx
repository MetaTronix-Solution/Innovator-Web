"use client";

import React, { useState } from "react";
import { ShoppingCart, Check, Ban, Loader2 } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product";
import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

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
  const router = useRouter();

  const handleCartClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartLoading) return;
    setCartLoading(true);
    try {
      if (isInCart) {
        await fetch(`/api/cart-items/${product.id}`, { method: "DELETE" });
        dispatch(removeFromCart(product.id));
        onCartUpdate(product, "remove");
      } else {
        await fetch("/api/cart-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product.id }),
        });
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
  const price = parseFloat(String(product.price)).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="group bg-white dark:bg-zinc-900 rounded-[2rem] p-4 flex flex-col transition-all duration-500 
                 shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] 
                 border border-zinc-100 dark:border-zinc-800 hover:-translate-y-2 cursor-pointer"
    >
      <div className="relative aspect-square mb-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800 overflow-hidden">
        <Image
          src={getMediaUrl(product.image) || "/placeholder-product.png"}
          alt={product.name}
          fill
          loading="eager"
          className="object-contain p-4 group-hover:scale-110 transition-transform duration-500"
          unoptimized
        />
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-lg leading-tight text-zinc-900 dark:text-zinc-50 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-foreground text-sm">
          {product.category_details?.name}
        </p>

        <div className="text-xl font-bold mt-2 font-mono text-zinc-900 dark:text-white">
          Rs {price}
        </div>
      </div>

      {/* Action Area */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="text-xs font-medium text-zinc-400">
          {isOutOfStock ? (
            <span className="text-red-500">Out of Stock</span>
          ) : (
            <span className="text-emerald-500">In Stock</span>
          )}
        </div>

        <Button
          onClick={handleCartClick}
          disabled={cartLoading || isOutOfStock}
          className={`w-full h-12 rounded-2xl font-bold transition-all duration-300 ${
            isInCart ? "bg-zinc-800 text-white hover:bg-zinc-700" : "bg-primary"
          }`}
        >
          {cartLoading ? (
            <Loader2 className="animate-spin" />
          ) : isInCart ? (
            <span className="flex items-center gap-2">
              <Check size={16} /> Added!
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <ShoppingCart size={16} /> Add to Cart
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
