"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, SlidersHorizontal, History, ShoppingBag } from "lucide-react";

import ProductCard from "@/components/Ecommerce/ProductCard";
import { RootState } from "@/lib/store/store";
import { syncCart } from "@/lib/store/features/cartSlice";
import {
  setProducts,
  appendProducts,
  setHasMore,
  setPage,
} from "@/lib/store/features/productsSlice";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CategoryFilter = "All" | "Multimeters" | "Electronics";

const LIMIT = 10;
const CACHE_TTL = 5 * 60 * 1000;

export default function EcommercePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const totalQuantity = useSelector(
    (state: RootState) => state.cart.totalQuantity,
  );

  const products = useSelector((state: RootState) => state.products.items);
  const hasMore = useSelector((state: RootState) => state.products.hasMore);
  const page = useSelector((state: RootState) => state.products.page);
  const lastFetched = useSelector((state: RootState) => state.products.lastFetched);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");

  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      const isCacheFresh = lastFetched && Date.now() - lastFetched < CACHE_TTL;

      try {
        if (!isCacheFresh || products.length === 0) {
          setLoading(true);
        }

        const fetchProductsPromise = (!isCacheFresh || products.length === 0)
          ? fetch(`/api/products?page=1&limit=${LIMIT}`).then((res) => {
              if (!res.ok) throw new Error("Could not fetch inventory layout.");
              return res.json();
            })
          : Promise.resolve(null);

        const [productsJson, cartRes] = await Promise.all([
          fetchProductsPromise,
          fetch("/api/cart-items"),
        ]);

        let currentProducts = products;

        if (productsJson) {
          const productsData: Product[] = productsJson.results ?? [];
          dispatch(setProducts(productsData));
          dispatch(setHasMore(productsJson.hasMore ?? false));
          dispatch(setPage(2));
          currentProducts = productsData;
        }

        if (cartRes.ok) {
          const cartData = await cartRes.json();
          setCartItems(cartData);

          const mappedItems = cartData
            .map((item: any) => {
              const fullProduct = currentProducts.find(
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
  }, [dispatch, lastFetched, products, CACHE_TTL]);

  // fetch next page
  const fetchMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/products?page=${page}&limit=${LIMIT}`);
      if (!res.ok) return;
      const json = await res.json();
      const newProducts: Product[] = json.results ?? [];
      dispatch(appendProducts(newProducts));
      dispatch(setHasMore(json.hasMore ?? false));
      dispatch(setPage(page + 1));
    } catch (err) {
      console.error("Failed to fetch more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, dispatch]);

  // intersection observer on sentinel div
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchMore();
        }
      },
      { threshold: 0.1 },
    );

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [fetchMore, hasMore, loadingMore]);

  const handleCartUpdate = (product: Product, action: "add" | "remove") => {
    if (action === "add") {
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
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
      {/* Search */}
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

      {/* Category Filter */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1 no-scrollbar">
        {(["All", "Multimeters", "Electronics"] as CategoryFilter[]).map(
          (cat) => (
            <Button
              variant="outline"
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-4 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${
                activeCategory === cat
                  ? "text-primary hover:bg-primary"
                  : "bg-card text-muted-foreground"
              }`}
            >
              {cat}
            </Button>
          ),
        )}
      </div>

      {/* Grid */}
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

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="py-6 flex items-center justify-center">
        {loadingMore && (
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500" />
        )}
        {!hasMore && products.length > 0 && (
          <p className="text-xs text-muted-foreground">All products loaded</p>
        )}
      </div>

      {/* Cart FAB */}
      <div className="fixed bottom-8 right-8 z-40">
        <button
          onClick={() => router.push("/cart")}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all"
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
