// "use client";

// import React, { useState, useEffect, useRef } from "react";
// import { useDispatch } from "react-redux";
// import {
//   Minus,
//   Plus,
//   Trash2,
//   ShoppingBag,
//   ArrowLeft,
//   Loader2,
//   X,
//   ChevronRight,
// } from "lucide-react";
// import Image from "next/image";
// import {
//   removeFromCart,
//   addToCart,
//   syncCart,
// } from "@/lib/store/features/cartSlice";
// import { Product } from "@/types/product";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { getMediaUrl } from "@/lib/utils/getMediaUrl";

// interface CartItem {
//   id: string;
//   cart: string;
//   product: string;
//   product_name: string;
//   price: number;
//   quantity: number;
//   total: number;
//   product_image?: string;
// }

// const CACHE_KEY = "cart_cache";

// interface CartCache {
//   items: CartItem[];
//   timestamp: number;
// }

// const readCartCache = (): CartCache | null => {
//   try {
//     const raw = localStorage.getItem(CACHE_KEY);
//     if (!raw) return null;
//     return JSON.parse(raw) as CartCache;
//   } catch {
//     return null;
//   }
// };

// const writeCartCache = (items: CartItem[]) => {
//   try {
//     localStorage.setItem(
//       CACHE_KEY,
//       JSON.stringify({ items, timestamp: Date.now() }),
//     );
//   } catch {}
// };

// const clearCartCache = () => {
//   try {
//     localStorage.removeItem(CACHE_KEY);
//   } catch {}
// };

// export default function CartPage() {
//   const dispatch = useDispatch();
//   const router = useRouter();

//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [bootstrapping, setBootstrapping] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const fetchDone = useRef(false);

//   useEffect(() => {
//     if (fetchDone.current) return;
//     fetchDone.current = true;

//     const bootstrap = async () => {
//       const cache = readCartCache();

//       if (cache?.items?.length) {
//         setCartItems(cache.items);
//         syncToStore(cache.items);
//         setBootstrapping(false); // show cached items instantly
//       }

//       try {
//         const res = await fetch("/api/cart-items");
//         if (!res.ok) throw new Error("Could not fetch cart.");
//         const data: CartItem[] = await res.json();
//         setCartItems(data);
//         syncToStore(data);
//         writeCartCache(data);
//       } catch (err: any) {
//         if (!cache?.items?.length) {
//           setError(err.message || "Something went wrong.");
//         }
//       } finally {
//         setBootstrapping(false);
//       }
//     };

//     bootstrap();
//   }, []);

//   const syncToStore = (items: CartItem[]) => {
//     const mapped = items.map((item) => ({
//       id: item.product,
//       name: item.product_name,
//       description: "",
//       price: item.price,
//       stock: 0,
//       is_active: true,
//       category: "",
//       image: item.product_image ?? "",
//       quantity: item.quantity,
//     }));
//     dispatch(syncCart(mapped));
//   };

//   const handleIncrease = async (item: CartItem) => {
//     setLoadingItemId(item.id);
//     const updated = cartItems.map((i) =>
//       i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
//     );
//     setCartItems(updated);
//     writeCartCache(updated);

//     try {
//       const res = await fetch(`/api/cart-items/${item.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ quantity: item.quantity + 1 }),
//       });
//       if (!res.ok) throw new Error("Failed to update quantity");
//       dispatch(
//         addToCart({
//           id: item.product,
//           name: item.product_name,
//           price: item.price,
//         } as Product),
//       );
//     } catch (error) {
//       setCartItems(cartItems);
//       writeCartCache(cartItems);
//       console.error("Increase failed:", error);
//     } finally {
//       setLoadingItemId(null);
//     }
//   };

//   const handleDecrease = async (item: CartItem) => {
//     if (item.quantity === 1) {
//       setDeleteTarget(item);
//       return;
//     }
//     setLoadingItemId(item.id);
//     const updated = cartItems.map((i) =>
//       i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
//     );
//     setCartItems(updated);
//     writeCartCache(updated);

//     try {
//       const res = await fetch(`/api/cart-items/${item.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ quantity: item.quantity - 1 }),
//       });
//       if (!res.ok) throw new Error("Failed to update quantity");
//       dispatch(removeFromCart(item.product));
//     } catch (error) {
//       setCartItems(cartItems);
//       writeCartCache(cartItems);
//       console.error("Decrease failed:", error);
//     } finally {
//       setLoadingItemId(null);
//     }
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     const updated = cartItems.filter((i) => i.id !== deleteTarget.id);
//     setCartItems(updated);
//     writeCartCache(updated);

//     try {
//       const res = await fetch(`/api/cart-items/${deleteTarget.id}`, {
//         method: "DELETE",
//       });
//       if (!res.ok) throw new Error("Failed to delete item");
//       dispatch(removeFromCart(deleteTarget.product));
//       if (updated.length === 0) clearCartCache();
//       setDeleteTarget(null);
//     } catch (error) {
//       setCartItems(cartItems);
//       writeCartCache(cartItems);
//       console.error("Delete failed:", error);
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   const totalPrice = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );

//   const SkeletonCart = () => (
//     <div className="flex flex-col gap-4">
//       {Array.from({ length: 3 }).map((_, i) => (
//         <div
//           key={i}
//           className="flex gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-pulse"
//         >
//           <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
//           <div className="flex flex-col justify-between flex-1 py-1">
//             <div>
//               <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
//               <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
//             </div>
//             <div className="flex items-center justify-between">
//               <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
//               <div className="h-8 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );

//   if (error) {
//     return (
//       <div className="p-20 text-center text-destructive text-sm">
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-2xl mx-auto px-4 py-8 min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
//           <div
//             className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//             onClick={() => !deleteLoading && setDeleteTarget(null)}
//           />
//           <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
//             <button
//               onClick={() => !deleteLoading && setDeleteTarget(null)}
//               disabled={deleteLoading}
//               className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all disabled:opacity-40"
//             >
//               <X size={14} />
//             </button>

//             <div className="flex items-center gap-3 mb-5 pr-6">
//               <div className="relative w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
//                 <Image
//                   src={
//                     getMediaUrl(deleteTarget.product_image) ||
//                     "/placeholder-product.png"
//                   }
//                   alt={deleteTarget.product_name}
//                   fill
//                   className="object-contain p-1.5"
//                   unoptimized
//                 />
//               </div>
//               <div className="min-w-0">
//                 <p className="text-xs text-zinc-500 mb-0.5">Remove item</p>
//                 <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
//                   {deleteTarget.product_name}
//                 </p>
//               </div>
//             </div>

//             <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 mb-5">
//               <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
//                 <Trash2 size={15} className="text-red-500" />
//               </div>
//               <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
//                 Are you sure you want to remove this item from your cart? This
//                 action cannot be undone.
//               </p>
//             </div>

//             <div className="flex gap-3">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 disabled={deleteLoading}
//                 className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 disabled={deleteLoading}
//                 className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
//               >
//                 {deleteLoading ? (
//                   <Loader2 size={15} className="animate-spin" />
//                 ) : (
//                   <Trash2 size={15} />
//                 )}
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Header */}
//       <div className="flex items-center justify-between mb-8">
//         <Button
//           variant="secondary"
//           onClick={() => router.back()}
//           className="p-2 rounded-full"
//         >
//           <ArrowLeft size={20} />
//         </Button>
//         <h1 className="text-xl font-bold tracking-tight">My Cart</h1>
//         <div className="w-10" />
//       </div>

//       {/* Content */}
//       {bootstrapping ? (
//         <SkeletonCart />
//       ) : cartItems.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-20 text-center">
//           <div className="w-24 h-24 mb-6 rounded-3xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
//             <ShoppingBag size={40} className="text-primary" />
//           </div>
//           <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
//           <p className="text-zinc-500 mb-8 max-w-xs text-sm">
//             Looks like you haven't added anything to your cart yet.
//           </p>
//           <Button onClick={() => router.back()} className="px-24 py-6">
//             Start Shopping
//           </Button>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-6">
//           <div className="flex flex-col gap-4">
//             {cartItems.map((item) => (
//               <div
//                 key={item.id}
//                 className="group flex gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md"
//               >
//                 <div className="relative w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
//                   <Image
//                     src={
//                       getMediaUrl(item.product_image) ||
//                       "/placeholder-product.png"
//                     }
//                     alt={item.product_name}
//                     fill
//                     className="object-contain p-2"
//                     unoptimized
//                   />
//                 </div>

//                 <div className="flex flex-col justify-between flex-1">
//                   <div>
//                     <h3 className="text-sm font-semibold leading-tight mb-1">
//                       {item.product_name}
//                     </h3>
//                     <p className="text-sm font-bold text-orange-600 font-mono">
//                       Rs {item.price.toLocaleString()}
//                     </p>
//                   </div>

//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-1 rounded-xl p-1">
//                       <Button
//                         variant="outline"
//                         onClick={() => handleDecrease(item)}
//                         disabled={loadingItemId === item.id}
//                         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
//                       >
//                         {loadingItemId === item.id ? (
//                           <Loader2 size={13} className="animate-spin" />
//                         ) : (
//                           <Minus size={14} />
//                         )}
//                       </Button>
//                       <span className="text-sm font-bold w-8 text-center">
//                         {item.quantity}
//                       </span>
//                       <Button
//                         variant="outline"
//                         onClick={() => handleIncrease(item)}
//                         disabled={loadingItemId === item.id}
//                         className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
//                       >
//                         {loadingItemId === item.id ? (
//                           <Loader2 size={13} className="animate-spin" />
//                         ) : (
//                           <Plus size={14} />
//                         )}
//                       </Button>
//                     </div>
//                     <Button
//                       variant="destructive"
//                       onClick={() => setDeleteTarget(item)}
//                       disabled={loadingItemId === item.id}
//                     >
//                       <Trash2 size={17} />
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Order Summary */}
//           <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
//             <h3 className="font-bold mb-4">Order Summary</h3>
//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between text-sm text-zinc-500">
//                 <span>Subtotal</span>
//                 <span className="font-mono text-zinc-900 dark:text-zinc-100">
//                   Rs {totalPrice.toLocaleString()}
//                 </span>
//               </div>
//               <div className="flex justify-between text-sm text-zinc-500">
//                 <span>Shipping</span>
//                 <span className="text-emerald-600 font-medium">Free</span>
//               </div>
//               <div className="flex justify-between text-base font-bold pt-3 border-t border-zinc-100 dark:border-zinc-800">
//                 <span>Total</span>
//                 <span className="font-mono text-orange-600">
//                   Rs {totalPrice.toLocaleString()}
//                 </span>
//               </div>
//             </div>
//             <Button className="w-full p-6">
//               Proceed to Checkout <ChevronRight size={18} />
//             </Button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Loader2,
  X,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import {
  removeFromCart,
  addToCart,
  syncCart,
} from "@/lib/store/features/cartSlice";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getMediaUrl } from "@/lib/utils/getMediaUrl";

interface CartItem {
  id: string;
  cart: string;
  product: string;
  product_name: string;
  price: number;
  quantity: number;
  total: number;
  product_image?: string;
}

const CACHE_KEY = "cart_cache";

interface CartCache {
  items: CartItem[];
  timestamp: number;
}

const readCartCache = (): CartCache | null => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CartCache;
  } catch {
    return null;
  }
};

const writeCartCache = (items: CartItem[]) => {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ items, timestamp: Date.now() }),
    );
  } catch {}
};

const clearCartCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {}
};

// ── Skeleton (outside component to avoid render-time creation error) ──────────
const SkeletonCart = () => (
  <div className="flex flex-col gap-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <div
        key={i}
        className="flex gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 animate-pulse"
      >
        <div className="w-24 h-24 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
        <div className="flex flex-col justify-between flex-1 py-1">
          <div>
            <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded w-3/4 mb-2" />
            <div className="h-3 bg-zinc-200 dark:bg-zinc-700 rounded w-1/3" />
          </div>
          <div className="flex items-center justify-between">
            <div className="h-8 w-24 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
            <div className="h-8 w-10 bg-zinc-200 dark:bg-zinc-700 rounded-xl" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export default function CartPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDone = useRef(false);

  useEffect(() => {
    if (fetchDone.current) return;
    fetchDone.current = true;

    const bootstrap = async () => {
      const cache = readCartCache();

      if (cache?.items?.length) {
        setCartItems(cache.items);
        syncToStore(cache.items);
        setBootstrapping(false);
      }

      try {
        const res = await fetch("/api/cart-items");
        if (!res.ok) throw new Error("Could not fetch cart.");
        const data: CartItem[] = await res.json();
        setCartItems(data);
        syncToStore(data);
        writeCartCache(data);
      } catch (err: any) {
        if (!cache?.items?.length) {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        setBootstrapping(false);
      }
    };

    bootstrap();
  }, []);

  const syncToStore = (items: CartItem[]) => {
    const mapped = items.map((item) => ({
      id: item.product,
      name: item.product_name,
      description: "",
      price: item.price,
      stock: 0,
      is_active: true,
      category: "",
      image: item.product_image ?? "",
      quantity: item.quantity,
    }));
    dispatch(syncCart(mapped));
  };

  const handleIncrease = async (item: CartItem) => {
    setLoadingItemId(item.id);
    const updated = cartItems.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
    );
    setCartItems(updated);
    writeCartCache(updated);

    try {
      const res = await fetch(`/api/cart-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      dispatch(
        addToCart({
          id: item.product,
          name: item.product_name,
          description: "",
          price: item.price,
          stock: 0,
          is_active: true,
          category: "",
          image: item.product_image ?? "",
        } as Product),
      );
    } catch (error) {
      setCartItems(cartItems);
      writeCartCache(cartItems);
      console.error("Increase failed:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const handleDecrease = async (item: CartItem) => {
    if (item.quantity === 1) {
      setDeleteTarget(item);
      return;
    }
    setLoadingItemId(item.id);
    const updated = cartItems.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
    );
    setCartItems(updated);
    writeCartCache(updated);

    try {
      const res = await fetch(`/api/cart-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      });
      if (!res.ok) throw new Error("Failed to update quantity");
      dispatch(removeFromCart(item.product));
    } catch (error) {
      setCartItems(cartItems);
      writeCartCache(cartItems);
      console.error("Decrease failed:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const updated = cartItems.filter((i) => i.id !== deleteTarget.id);
    setCartItems(updated);
    writeCartCache(updated);

    try {
      const res = await fetch(`/api/cart-items/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete item");
      dispatch(removeFromCart(deleteTarget.product));
      if (updated.length === 0) clearCartCache();
      setDeleteTarget(null);
    } catch (error) {
      setCartItems(cartItems);
      writeCartCache(cartItems);
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (error) {
    return (
      <div className="p-20 text-center text-destructive text-sm">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          />
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              onClick={() => !deleteLoading && setDeleteTarget(null)}
              disabled={deleteLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all disabled:opacity-40"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-3 mb-5 pr-6">
              <div className="relative w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                <Image
                  src={
                    getMediaUrl(deleteTarget.product_image) ||
                    "/placeholder-product.png"
                  }
                  alt={deleteTarget.product_name}
                  fill
                  className="object-contain p-1.5"
                  unoptimized
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 mb-0.5">Remove item</p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 line-clamp-2 leading-snug">
                  {deleteTarget.product_name}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 mb-5">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 size={15} className="text-red-500" />
              </div>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                Are you sure you want to remove this item from your cart? This
                action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-500/20"
              >
                {deleteLoading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button
          variant="secondary"
          onClick={() => router.back()}
          className="p-2 rounded-full"
        >
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">My Cart</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      {bootstrapping ? (
        <SkeletonCart />
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <ShoppingBag size={40} className="text-primary" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 mb-8 max-w-xs text-sm">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button onClick={() => router.back()} className="px-24 py-6">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="group flex gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md"
              >
                <div className="relative w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                  <Image
                    src={
                      getMediaUrl(item.product_image) ||
                      "/placeholder-product.png"
                    }
                    alt={item.product_name}
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                </div>

                <div className="flex flex-col justify-between flex-1">
                  <div>
                    <h3 className="text-sm font-semibold leading-tight mb-1">
                      {item.product_name}
                    </h3>
                    <p className="text-sm font-bold text-orange-600 font-mono">
                      Rs {item.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 rounded-xl p-1">
                      <Button
                        variant="outline"
                        onClick={() => handleDecrease(item)}
                        disabled={loadingItemId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
                      >
                        {loadingItemId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Minus size={14} />
                        )}
                      </Button>
                      <span className="text-sm font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => handleIncrease(item)}
                        disabled={loadingItemId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
                      >
                        {loadingItemId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setDeleteTarget(item)}
                      disabled={loadingItemId === item.id}
                    >
                      <Trash2 size={17} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Subtotal</span>
                <span className="font-mono text-zinc-900 dark:text-zinc-100">
                  Rs {totalPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm text-zinc-500">
                <span>Shipping</span>
                <span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <span>Total</span>
                <span className="font-mono text-orange-600">
                  Rs {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
            <Button className="w-full p-6">
              Proceed to Checkout <ChevronRight size={18} />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
