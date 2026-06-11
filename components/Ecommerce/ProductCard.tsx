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

  const buttonState = cartLoading
    ? "loading"
    : isOutOfStock
      ? "out-of-stock"
      : isInCart
        ? "in-cart"
        : "default";

  return (
    <div
      onClick={() => router.push(`/products/${product.id}`)}
      className="group bg-card rounded-md p-2 flex flex-col transition-all duration-500 
                 border border-border hover:-translate-y-2 hover:border-primary "
    >
      <div className="relative aspect-square mb-2 rounded-xl overflow-hidden">
        <Image
          src={getMediaUrl(product.image) || "/placeholder-product.png"}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          unoptimized
          className="object-contain p-2 group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold text-md leading-tight text-foreground line-clamp-1">
          {product.name}
        </h3>
        <p className="text-foreground text-xs">
          {product.category_details?.name}
        </p>

        <div className="text-md font-bold mt-2 font-mono text-foreground">
          Rs {price}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <div className="text-xs font-medium">
          {isOutOfStock ? (
            <span className="text-destructive">Out of Stock</span>
          ) : (
            <span className="text-emerald-500">In Stock</span>
          )}
        </div>

        <Button
          onClick={handleCartClick}
          disabled={buttonState === "loading" || buttonState === "out-of-stock"}
          className={`w-full h-12 rounded-sm md:rounded-md font-bold transition-all duration-300 cursor-pointer ${
            buttonState === "out-of-stock"
              ? "bg-muted text-muted-foreground cursor-not-allowed"
              : buttonState === "in-cart"
                ? "bg-foreground text-secondary hover:bg-secondary-foreground/90"
                : "bg-primary"
          }`}
        >
          {buttonState === "loading" ? (
            <Loader2 className="animate-spin" />
          ) : buttonState === "out-of-stock" ? (
            <span className="flex items-center gap-2">
              <Ban size={16} /> Out of Stock
            </span>
          ) : buttonState === "in-cart" ? (
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
