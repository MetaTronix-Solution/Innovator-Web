"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, History, ShoppingBag } from "lucide-react";

import ProductCard from "@/components/Ecommerce/ProductCard";
import { RootState } from "@/lib/store/store";
import { syncCart } from "@/lib/store/features/cartSlice";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";

type CategoryFilter = "All" | "Multimeters" | "Electronics";

export default function EcommercePage() {
  const dispatch = useDispatch();

  const totalQuantity = useSelector(
    (state: RootState) => state.cart.totalQuantity,
  );

  const [products, setProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);

        const [productsRes, cartRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/cart-items"),
        ]);

        if (!productsRes.ok)
          throw new Error("Could not fetch inventory layout.");
        const productsData: Product[] = await productsRes.json();
        setProducts(productsData);

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData);

          const mappedItems = cartData
            .map((item: any) => {
              const fullProduct = productsData.find(
                (p) => p.id === item.product,
              );
              return fullProduct
                ? { ...fullProduct, quantity: item.quantity ?? 1 }
                : null;
            })
            .filter(Boolean);

          dispatch(syncCart(mappedItems));
        }
      } catch (err: any) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleCartUpdate = (product: Product, action: "add" | "remove") => {
    if (action === "add") {
      // store as same shape backend returns: { product: id, ... }
      setCartItems((prev) => [...prev, { product: product.id, quantity: 1 }]);
    } else {
      setCartItems((prev) =>
        prev.filter((item) => item.product !== product.id),
      );
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const prodName = product.name?.toLowerCase() || "";
      const prodCat = product.category_details?.name?.toLowerCase() || "";
      const query = searchQuery.toLowerCase();

      const matchesSearch = prodName.includes(query) || prodCat.includes(query);
      if (activeCategory === "All") return matchesSearch;

      const matchesCategory = prodCat === activeCategory.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-20 text-center text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 bg-background font-sans min-h-screen relative">
      {/* Search Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-card border border-border/70 rounded-full py-3 pl-12 pr-4 text-sm focus:border-orange-500/60 shadow-sm transition-all"
          />
        </div>
        <button className="p-3 bg-card border border-border/70 rounded-xl">
          <SlidersHorizontal size={18} />
        </button>
        <button className="p-3 bg-card border border-border/70 rounded-xl">
          <History size={18} />
        </button>
      </div>

      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
        {(["All", "Multimeters", "Electronics"] as CategoryFilter[]).map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-foreground text-background"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {cat}
            </button>
          ),
        )}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-border rounded-2xl">
          <p className="text-muted-foreground text-xs">No items found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isInCart={cartItems.some((item) => item.product === product.id)}
              onCartUpdate={handleCartUpdate}
            />
          ))}
        </div>
      )}

      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => router.push("/cart")}
          className="bg-orange-500 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all"
        >
          <div className="relative">
            <ShoppingBag size={24} />
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-orange-500">
                {totalQuantity > 99 ? "99+" : totalQuantity}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
