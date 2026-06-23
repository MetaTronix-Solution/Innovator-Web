"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, ShoppingBag, Bell, PackageSearch } from "lucide-react";

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
import NotificationDrawer from "@/components/Ecommerce/NotificationDrawer";
import useDebounce from "@/lib/hooks/useDebounce";
import useLocalCache from "@/lib/hooks/useLocalCache";
import useInfiniteScroll from "@/lib/hooks/useInfiniteScroll";

type CategoryFilter = "All" | "Multimeters" | "Electronics";

const LIMIT = 10;

interface ProductCacheData {
  products: Product[];
  hasMore: boolean;
}

export default function EcommercePage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const totalQuantity = useSelector(
    (state: RootState) => state.cart.totalQuantity,
  );
  const products = useSelector((state: RootState) => state.products.items);
  const hasMore = useSelector((state: RootState) => state.products.hasMore);
  const page = useSelector((state: RootState) => state.products.page);

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [bootstrapping, setBootstrapping] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("All");
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const hasMoreRef = useRef(hasMore);
  const loadingMoreRef = useRef(loadingMore);
  const pageRef = useRef(page);
  const initialFetchDone = useRef(false);

  const debouncedSearch = useDebounce(searchQuery, 500);
  const cache = useLocalCache<ProductCacheData>(
    "products_cache",
    5 * 60 * 1000,
  );

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);
  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    const bootstrap = async () => {
      const cached = cache.read();

      if (cached?.products?.length) {
        dispatch(setProducts(cached.products));
        dispatch(setHasMore(cached.hasMore ?? false));
        dispatch(setPage(2));
        setBootstrapping(false);
      }

      const shouldRefetch = !cache.isFresh();

      try {
        const [productsJson, cartRes] = await Promise.all([
          shouldRefetch
            ? fetch(`/api/products?page=1&limit=${LIMIT}`).then((res) => {
                if (!res.ok) throw new Error("Could not fetch inventory.");
                return res.json();
              })
            : Promise.resolve(null),
          fetch("/api/cart-items"),
        ]);

        const notifRes = await fetch(
          "/api/notifications/?is_read=false&limit=1",
        );
        if (notifRes.ok) {
          const notifData = await notifRes.json();
          setUnreadCount(notifData.count ?? 0);
        }

        let currentProducts = cached?.products ?? [];

        if (productsJson) {
          const fresh: Product[] = productsJson.results ?? [];
          const freshHasMore: boolean = productsJson.hasMore ?? false;
          dispatch(setProducts(fresh));
          dispatch(setHasMore(freshHasMore));
          dispatch(setPage(2));
          currentProducts = fresh;
          cache.write({ products: fresh, hasMore: freshHasMore });
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
        if (!cached?.products?.length) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const fetchMore = useCallback(async () => {
    if (loadingMoreRef.current || !hasMoreRef.current) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/products?page=${pageRef.current}&limit=${LIMIT}`,
      );
      if (!res.ok) return;
      const json = await res.json();
      const newProducts: Product[] = json.results ?? [];
      const newHasMore: boolean = json.next !== null;

      dispatch(appendProducts(newProducts));
      dispatch(setHasMore(newHasMore));
      dispatch(setPage(pageRef.current + 1));

      const cached = cache.read();
      if (cached) {
        cache.write({
          products: [...cached.products, ...newProducts],
          hasMore: newHasMore,
        });
      }
    } catch (err) {
      console.error("Failed to fetch more products:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [dispatch]);

  const sentinelRef = useInfiniteScroll(fetchMore);

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
      const query = debouncedSearch.toLowerCase();
      const matchesSearch = prodName.includes(query) || prodCat.includes(query);
      if (activeCategory === "All") return matchesSearch;
      return matchesSearch && prodCat === activeCategory.toLowerCase();
    });
  }, [products, debouncedSearch, activeCategory]);

  const SkeletonGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {Array.from({ length: LIMIT }).map((_, i) => (
        <div
          key={i}
          className="rounded-[2rem] bg-card border border-border/60 p-4 animate-pulse"
        >
          <div className="aspect-square rounded-3xl bg-muted mb-4" />
          <div className="h-4 bg-muted rounded w-3/4 mb-2" />
          <div className="h-3 bg-muted rounded w-1/2 mb-4" />
          <div className="h-6 bg-muted rounded w-1/3 mb-4" />
          <div className="h-12 bg-muted rounded-2xl w-full" />
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div className="p-20 text-center text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-2 py:1 md:py-2 bg-background font-sans min-h-screen relative">
      <div className="sticky top-0 z-30 -mx-2 px-2 pt-2 md:static md:mx-0 md:px-0 md:pt-0 bg-background/95 backdrop-blur-md md:bg-transparent md:backdrop-blur-none">
        <div className="flex items-center gap-2 mb-4">
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

          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-3 bg-card border border-border/70 rounded-xl"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <NotificationDrawer
            open={notifOpen}
            onClose={() => setNotifOpen(false)}
          />
        </div>

        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
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
      </div>

      {bootstrapping ? (
        <SkeletonGrid />
      ) : filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-border rounded-2xl space-y-3">
          <div className="p-4 rounded-full bg-muted">
            <PackageSearch className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-foreground font-semibold text-md">
            No products found
          </p>
          <p className="text-muted-foreground text-sm text-center max-w-[200px]">
            {debouncedSearch
              ? `No results for "${debouncedSearch}". Try a different name or category.`
              : "No products available in this category yet."}
          </p>
          {debouncedSearch && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-xs text-orange-500 font-semibold hover:underline"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

      {loadingMore && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-[2rem] bg-card border border-border/60 p-4 animate-pulse"
            >
              <div className="aspect-square rounded-3xl bg-muted mb-4" />
              <div className="h-4 bg-muted rounded w-3/4 mb-2" />
              <div className="h-3 bg-muted rounded w-1/2 mb-4" />
              <div className="h-6 bg-muted rounded w-1/3 mb-4" />
              <div className="h-12 bg-muted rounded-2xl w-full" />
            </div>
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-1" />

      <div className="fixed bottom-20 md:bottom-8 right-8 z-40">
        <button
          onClick={() => router.push("/my-cart")}
          className={`bg-primary text-white rounded-full shadow-lg hover:scale-105 transition-all flex items-center justify-center ${
            isMobile ? "p-3" : "p-4"
          }`}
        >
          <div className="relative">
            <ShoppingBag size={isMobile ? 16 : 24} />
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full border-2 border-orange-500">
                {cartItems.length > 99 ? "99+" : cartItems.length}
              </span>
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
