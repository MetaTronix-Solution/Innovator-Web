// "use client";

// import React, { useState, useEffect } from "react";
// import { useDispatch } from "react-redux";
// import {
//   Minus,
//   Plus,
//   Trash2,
//   ShoppingBag,
//   ArrowLeft,
//   Loader2,
//   X,
// } from "lucide-react";
// import Image from "next/image";
// import Link from "next/link";
// import {
//   removeFromCart,
//   addToCart,
//   syncCart,
// } from "@/lib/store/features/cartSlice";
// import { Product } from "@/types/product";
// import { useRouter } from "next/navigation";

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

// export default function CartPage() {
//   const dispatch = useDispatch();
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
//   const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const router = useRouter();

//   useEffect(() => {
//     fetchCart();
//   }, []);

//   const fetchCart = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch("/api/cart-items");
//       if (!response.ok) throw new Error("Could not fetch cart.");
//       const data = await response.json();
//       setCartItems(data);

//       const mapped = data.map((item: CartItem) => ({
//         id: item.product,
//         name: item.product_name,
//         price: item.price,
//         quantity: item.quantity,
//         image: item.product_image ?? "",
//       }));
//       dispatch(syncCart(mapped));
//     } catch (err: any) {
//       setError(err.message || "Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleIncrease = async (item: CartItem) => {
//     setLoadingItemId(item.id);
//     try {
//       const response = await fetch(`/api/cart-items/${item.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ quantity: item.quantity + 1 }),
//       });
//       if (!response.ok) throw new Error("Failed to update quantity");
//       setCartItems((prev) =>
//         prev.map((i) =>
//           i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
//         ),
//       );
//       dispatch(
//         addToCart({
//           id: item.product,
//           name: item.product_name,
//           price: item.price,
//         } as Product),
//       );
//     } catch (error) {
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
//     try {
//       const response = await fetch(`/api/cart-items/${item.id}`, {
//         method: "PATCH",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ quantity: item.quantity - 1 }),
//       });
//       if (!response.ok) throw new Error("Failed to update quantity");
//       setCartItems((prev) =>
//         prev.map((i) =>
//           i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
//         ),
//       );
//       dispatch(removeFromCart(item.product));
//     } catch (error) {
//       console.error("Decrease failed:", error);
//     } finally {
//       setLoadingItemId(null);
//     }
//   };

//   const confirmDelete = async () => {
//     if (!deleteTarget) return;
//     setDeleteLoading(true);
//     try {
//       const response = await fetch(`/api/cart-items/${deleteTarget.id}`, {
//         method: "DELETE",
//       });
//       if (!response.ok) throw new Error("Failed to delete item");
//       setCartItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
//       dispatch(removeFromCart(deleteTarget.product));
//       setDeleteTarget(null);
//     } catch (error) {
//       console.error("Delete failed:", error);
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   const totalPrice = cartItems.reduce(
//     (sum, item) => sum + item.price * item.quantity,
//     0,
//   );

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-20 text-center text-destructive text-sm">
//         Error: {error}
//       </div>
//     );
//   }

//   return (
//     <div className="w-full max-w-2xl mx-auto px-4 py-6 min-h-screen font-sans">
//       {deleteTarget && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
//           <div
//             className="absolute inset-0 bg-black/40 backdrop-blur-sm"
//             onClick={() => !deleteLoading && setDeleteTarget(null)}
//           />

//           <div className="relative z-10 w-full max-w-sm bg-card border border-border/60 rounded-2xl p-5 shadow-xl">
//             <button
//               onClick={() => !deleteLoading && setDeleteTarget(null)}
//               disabled={deleteLoading}
//               className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-all"
//             >
//               <X size={16} />
//             </button>

//             <div className="w-12 h-12 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900 flex items-center justify-center mb-4">
//               <Trash2 size={20} className="text-red-500" />
//             </div>

//             <p className="text-sm font-semibold text-foreground mb-1">
//               Remove item?
//             </p>
//             <p className="text-xs text-muted-foreground mb-5 leading-relaxed">
//               <span className="font-medium text-foreground">
//                 {deleteTarget.product_name}
//               </span>{" "}
//               will be removed from your cart.
//             </p>

//             <div className="flex gap-2">
//               <button
//                 onClick={() => setDeleteTarget(null)}
//                 disabled={deleteLoading}
//                 className="flex-1 py-2.5 rounded-xl border border-border/70 bg-background text-sm font-medium text-foreground hover:bg-secondary/50 transition-all disabled:opacity-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={confirmDelete}
//                 disabled={deleteLoading}
//                 className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
//               >
//                 {deleteLoading ? (
//                   <Loader2 size={14} className="animate-spin" />
//                 ) : (
//                   <Trash2 size={14} />
//                 )}
//                 Remove
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="flex items-center gap-3 mb-6">
//         <button
//           onClick={() => router.back()}
//           className="p-2 rounded-xl bg-card border border-border/70 hover:border-border transition-all"
//         >
//           <ArrowLeft size={18} />
//         </button>
//         <h1 className="text-lg font-bold text-foreground">My Cart</h1>
//         {cartItems.length > 0 && (
//           <span className="ml-auto text-xs text-muted-foreground">
//             {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
//           </span>
//         )}
//       </div>

//       {cartItems.length === 0 ? (
//         <div className="flex flex-col items-center justify-center py-24 gap-4">
//           <div className="p-6 rounded-full bg-card border border-border/50">
//             <ShoppingBag size={32} className="text-muted-foreground/40" />
//           </div>
//           <p className="text-sm text-muted-foreground">Your cart is empty</p>
//           <Link
//             href="/"
//             className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium transition-all"
//           >
//             Browse Products
//           </Link>
//         </div>
//       ) : (
//         <div className="flex flex-col gap-3">
//           {cartItems.map((item) => (
//             <div
//               key={item.id}
//               className="flex gap-3 bg-card border border-border/50 rounded-2xl p-3 transition-all"
//             >
//               <div className="relative w-20 h-20 rounded-xl bg-secondary/40 overflow-hidden flex-shrink-0">
//                 <Image
//                   src={item.product_image || "/placeholder-product.png"}
//                   alt={item.product_name}
//                   fill
//                   className="object-contain p-1"
//                   unoptimized
//                 />
//               </div>

//               {/* Details */}
//               <div className="flex flex-col flex-1 gap-1 min-w-0">
//                 <p className="text-sm font-medium text-foreground leading-snug line-clamp-2">
//                   {item.product_name}
//                 </p>
//                 <p className="text-base font-semibold text-foreground font-mono">
//                   <span className="text-xs font-normal text-muted-foreground mr-0.5">
//                     Rs
//                   </span>
//                   {(item.price * item.quantity).toLocaleString("en-IN", {
//                     maximumFractionDigits: 0,
//                   })}
//                 </p>

//                 {/* Quantity Controls */}
//                 <div className="flex items-center justify-between mt-auto pt-1">
//                   <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-2 py-1">
//                     <button
//                       onClick={() => handleDecrease(item)}
//                       disabled={loadingItemId === item.id}
//                       className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-card transition-all disabled:opacity-40"
//                     >
//                       {loadingItemId === item.id ? (
//                         <Loader2 size={13} className="animate-spin" />
//                       ) : (
//                         <Minus size={13} />
//                       )}
//                     </button>
//                     <span className="text-sm font-semibold font-mono w-5 text-center">
//                       {item.quantity}
//                     </span>
//                     <button
//                       onClick={() => handleIncrease(item)}
//                       disabled={loadingItemId === item.id}
//                       className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-card transition-all disabled:opacity-40"
//                     >
//                       {loadingItemId === item.id ? (
//                         <Loader2 size={13} className="animate-spin" />
//                       ) : (
//                         <Plus size={13} />
//                       )}
//                     </button>
//                   </div>

//                   {/* Delete */}
//                   <button
//                     onClick={() => setDeleteTarget(item)}
//                     disabled={loadingItemId === item.id}
//                     className="p-1.5 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all disabled:opacity-40"
//                   >
//                     <Trash2 size={15} />
//                   </button>
//                 </div>
//               </div>
//             </div>
//           ))}

//           {/* Order Summary */}
//           <div className="mt-2 bg-card border border-border/50 rounded-2xl p-4 flex flex-col gap-3">
//             <p className="text-sm font-semibold text-foreground">
//               Order Summary
//             </p>
//             <div className="flex items-center justify-between text-sm text-muted-foreground">
//               <span>Subtotal ({cartItems.length} items)</span>
//               <span className="font-mono text-foreground font-medium">
//                 Rs{" "}
//                 {totalPrice.toLocaleString("en-IN", {
//                   maximumFractionDigits: 0,
//                 })}
//               </span>
//             </div>
//             <div className="flex items-center justify-between text-sm text-muted-foreground">
//               <span>Shipping</span>
//               <span className="text-green-600 font-medium">Free</span>
//             </div>
//             <div className="border-t border-border/40 pt-3 flex items-center justify-between">
//               <span className="text-sm font-bold text-foreground">Total</span>
//               <span className="text-base font-bold font-mono text-foreground">
//                 Rs{" "}
//                 {totalPrice.toLocaleString("en-IN", {
//                   maximumFractionDigits: 0,
//                 })}
//               </span>
//             </div>
//           </div>

//           {/* Checkout Button */}
//           <button className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all active:scale-95 mt-1">
//             Proceed to Checkout
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import React, { useState, useEffect } from "react";
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
import Link from "next/link";
import {
  removeFromCart,
  addToCart,
  syncCart,
} from "@/lib/store/features/cartSlice";
import { Product } from "@/types/product";
import { useRouter } from "next/navigation";

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

export default function CartPage() {
  const dispatch = useDispatch();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CartItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart-items");
      if (!response.ok) throw new Error("Could not fetch cart.");
      const data = await response.json();
      setCartItems(data);

      const mapped = data.map((item: CartItem) => ({
        id: item.product,
        name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        image: item.product_image ?? "",
      }));
      dispatch(syncCart(mapped));
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleIncrease = async (item: CartItem) => {
    setLoadingItemId(item.id);
    try {
      const response = await fetch(`/api/cart-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });
      if (!response.ok) throw new Error("Failed to update quantity");
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        ),
      );
      dispatch(
        addToCart({
          id: item.product,
          name: item.product_name,
          price: item.price,
        } as Product),
      );
    } catch (error) {
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
    try {
      const response = await fetch(`/api/cart-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      });
      if (!response.ok) throw new Error("Failed to update quantity");
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i,
        ),
      );
      dispatch(removeFromCart(item.product));
    } catch (error) {
      console.error("Decrease failed:", error);
    } finally {
      setLoadingItemId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/cart-items/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete item");
      setCartItems((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      dispatch(removeFromCart(deleteTarget.product));
      setDeleteTarget(null);
    } catch (error) {
      console.error("Delete failed:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleteLoading && setDeleteTarget(null)}
          />

          {/* Modal Sheet */}
          <div className="relative z-10 w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800">
            {/* Close Button */}
            <button
              onClick={() => !deleteLoading && setDeleteTarget(null)}
              disabled={deleteLoading}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all disabled:opacity-40"
            >
              <X size={14} />
            </button>

            {/* Product Preview */}
            <div className="flex items-center gap-3 mb-5 pr-6">
              <div className="relative w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                <Image
                  src={deleteTarget.product_image || "/placeholder-product.png"}
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

            {/* Icon + Message */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 mb-5">
              <div className="w-8 h-8 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <Trash2 size={15} className="text-red-500" />
              </div>
              <p className="text-xs text-red-700 dark:text-red-400 leading-relaxed">
                Are you sure you want to remove this item from your cart? This
                action cannot be undone.
              </p>
            </div>

            {/* Actions */}
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
        <button
          onClick={() => router.back()}
          className="p-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm hover:border-orange-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold tracking-tight">Shopping Cart</h1>
        <div className="w-10" />
      </div>

      {/* Empty State */}
      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 mb-6 rounded-3xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
            <ShoppingBag size={40} className="text-orange-500" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Your cart is empty</h2>
          <p className="text-zinc-500 mb-8 max-w-xs text-sm">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link
            href="/"
            className="px-8 py-3 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-medium transition-all shadow-lg shadow-orange-500/20"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Cart Items */}
          <div className="flex flex-col gap-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="group flex gap-4 bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-200 dark:border-zinc-800 transition-all hover:shadow-md"
              >
                <div className="relative w-24 h-24 rounded-2xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0">
                  <Image
                    src={item.product_image || "/placeholder-product.png"}
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
                    <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
                      <button
                        onClick={() => handleDecrease(item)}
                        disabled={loadingItemId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
                      >
                        {loadingItemId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Minus size={14} />
                        )}
                      </button>
                      <span className="text-sm font-bold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleIncrease(item)}
                        disabled={loadingItemId === item.id}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-zinc-700 transition-all disabled:opacity-40"
                      >
                        {loadingItemId === item.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Plus size={14} />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => setDeleteTarget(item)}
                      disabled={loadingItemId === item.id}
                      className="p-2 rounded-xl text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all disabled:opacity-40"
                    >
                      <Trash2 size={17} />
                    </button>
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

            <button className="w-full py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-orange-500/20">
              Proceed to Checkout <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
