"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  ShoppingCart,
  Check,
  Loader2,
  Package,
  Tag,
  Clock,
  Ban,
} from "lucide-react";
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

export default function ProductDetailPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive text-sm">
          {error || "Product not found."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-orange-500 text-white text-sm"
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

  return (
    <div className="w-full max-w-2xl mx-auto min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pb-32">
      {/* <div className="flex items-center justify-between px-4 py-4">
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-orange-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <p className="text-sm font-semibold">Product Details</p>
        <div className="w-10" />
      </div> */}

      <div className="relative mx-4 aspect-square rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden mb-6">
        <Image
          src={getMediaUrl(product.image) || "/placeholder-product.png"}
          alt={product.name}
          fill
          className="object-contain p-8"
          unoptimized
          priority
        />

        <div className="absolute top-3 left-3">
          {isOutOfStock ? (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
              Out of stock
            </span>
          ) : (
            <span className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900">
              In stock
            </span>
          )}
        </div>
      </div>

      <div className="px-4 flex flex-col gap-5">
        <div>
          <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
            {product.category_details?.name || "General"}
          </span>
          <h1 className="text-xl font-bold mt-2 leading-snug">
            {product.name}
          </h1>
        </div>

        <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3">
          <div>
            <p className="text-xs text-zinc-500 mb-0.5">Price</p>
            <p className="text-2xl font-bold font-mono text-orange-500">
              <span className="text-sm font-normal text-zinc-500 mr-1">Rs</span>
              {price}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-zinc-500 mb-0.5">Stock</p>
            <p
              className={`text-lg font-bold font-mono ${isOutOfStock ? "text-red-500" : "text-green-600"}`}
            >
              {product.stock.toLocaleString()}
            </p>
          </div>
        </div>

        {product.description && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex flex-col gap-3">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Details
          </p>
          <div className="flex items-center gap-3 text-sm">
            <Tag size={15} className="text-zinc-400 shrink-0" />
            <span className="text-zinc-500">Category</span>
            <span className="ml-auto font-medium">
              {product.category_details?.name || "General"}
            </span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Package size={15} className="text-zinc-400 shrink-0" />
            <span className="text-zinc-500">Stock available</span>
            <span className="ml-auto font-medium">
              {product.stock.toLocaleString()} units
            </span>
          </div>
          {(product as any).created_at && (
            <div className="flex items-center gap-3 text-sm">
              <Clock size={15} className="text-zinc-400 shrink-0" />
              <span className="text-zinc-500">Added on</span>
              <span className="ml-auto font-medium">
                {formatDate((product as any).created_at)}
              </span>
            </div>
          )}
        </div>
        <div className="w-full">
          {isOutOfStock ? (
            <button
              disabled
              className="w-full py-4 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-400 font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
            >
              <Ban size={18} /> Out of Stock
            </button>
          ) : isInCart ? (
            <Button
              variant="secondary"
              onClick={handleCartClick}
              disabled={cartLoading}
              className="w-full p-6 cursor-pointer"
            >
              {cartLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Check size={18} />
              )}
              Added to Cart
            </Button>
          ) : (
            <Button
              onClick={handleCartClick}
              disabled={cartLoading}
              className="w-full p-6 cursor-pointer"
            >
              {cartLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <ShoppingCart size={18} />
              )}
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
