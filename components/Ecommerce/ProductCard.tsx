// "use client";

// import React, { useState } from "react";
// import { ShoppingCart, Check, Ban, Loader2 } from "lucide-react";
// import Image from "next/image";
// import { useDispatch } from "react-redux";
// import { Product } from "@/types/product";
// import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";
// import { Button } from "../ui/button";
// import { useRouter } from "next/navigation";

// interface ProductCardProps {
//   product: Product;
//   isInCart: boolean;
//   onCartUpdate: (product: Product, action: "add" | "remove") => void;
// }

// export default function ProductCard({
//   product,
//   isInCart,
//   onCartUpdate,
// }: ProductCardProps) {
//   const dispatch = useDispatch();
//   const [cartLoading, setCartLoading] = useState(false);

//   const router = useRouter();

//   const handleCartClick = async (e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (cartLoading) return;

//     setCartLoading(true);
//     try {
//       if (isInCart) {
//         const response = await fetch(`/api/cart-items/${product.id}`, {
//           method: "DELETE",
//         });
//         if (!response.ok) throw new Error("Failed to remove from cart");
//         dispatch(removeFromCart(product.id));
//         onCartUpdate(product, "remove");
//       } else {
//         const response = await fetch("/api/cart-items", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ productId: product.id }),
//         });
//         if (!response.ok) throw new Error("Failed to add to cart");
//         dispatch(addToCart(product));
//         onCartUpdate(product, "add");
//       }
//     } catch (error) {
//       console.error("Cart action failed:", error);
//     } finally {
//       setCartLoading(false);
//     }
//   };

//   const isOutOfStock = product.stock === 0;
//   const categoryName =
//     product.category_details?.name || product.category || "General";
//   const price = parseFloat(String(product.price)).toLocaleString("en-IN", {
//     maximumFractionDigits: 0,
//   });

//   return (
//     <div
//       onClick={() => router.push(`/products/${product.id}`)}
//       className="group bg-card border border-border/50 rounded-2xl overflow-hidden flex flex-col hover:border-border hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
//     >
//       <div className="relative aspect-[4/3] bg-secondary/40 flex items-center justify-center overflow-hidden p-6">
//         <div className="relative w-full h-full">
//           <Image
//             src={product.image || "/placeholder-product.png"}
//             alt={product.name}
//             fill
//             className="object-contain group-hover:scale-105 transition-transform duration-300"
//             unoptimized
//           />
//         </div>

//         <div className="absolute top-2.5 left-2.5">
//           {isOutOfStock ? (
//             <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900">
//               Out of stock
//             </span>
//           ) : (
//             <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-800 border border-green-100 dark:bg-green-950/40 dark:text-green-300 dark:border-green-900">
//               In stock
//             </span>
//           )}
//         </div>
//       </div>

//       <div className="px-4 pt-3 pb-2 flex flex-col gap-3 flex-1">
//         <p className="text-sm font-medium text-foreground leading-snug line-clamp-2 min-h-[20px]">
//           {product.name}
//         </p>

//         <span className="self-start text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
//           {categoryName}
//         </span>

//         <div className="flex items-center justify-between">
//           <div className="flex flex-col">
//             <span className="text-[10px] text-muted-foreground">Price</span>
//             <div className="text-base font-semibold text-foreground font-mono">
//               <span className="text-xs font-normal text-muted-foreground mr-0.5">
//                 Rs
//               </span>
//               {price}
//             </div>
//           </div>

//           <div className="flex flex-col items-end">
//             <span className="text-[10px] text-muted-foreground">Stock</span>
//             <span
//               className={`text-sm font-semibold font-mono ${
//                 isOutOfStock ? "text-red-500" : "text-green-600"
//               }`}
//             >
//               {isOutOfStock ? "0" : product.stock}
//             </span>
//           </div>
//         </div>

//         {isOutOfStock ? (
//           <Button
//             variant="outline"
//             disabled
//             className="w-full py-6 flex items-center justify-center gap-1.5"
//           >
//             <Ban size={15} /> Sold out
//           </Button>
//         ) : isInCart ? (
//           <Button
//             variant="secondary"
//             onClick={handleCartClick}
//             disabled={cartLoading}
//             className="w-full py-6 flex items-center justify-center gap-1.5"
//           >
//             {cartLoading ? (
//               <Loader2 size={15} className="animate-spin" />
//             ) : (
//               <Check size={15} />
//             )}
//             Added to Cart
//           </Button>
//         ) : (
//           <Button
//             onClick={handleCartClick}
//             disabled={cartLoading}
//             className="w-full py-6 flex items-center justify-center gap-1.5 "
//           >
//             {cartLoading ? (
//               <Loader2 size={15} className="animate-spin" />
//             ) : (
//               <ShoppingCart size={15} />
//             )}
//             Add to Cart
//           </Button>
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import React, { useState } from "react";
import { ShoppingCart, Check, Ban, Loader2 } from "lucide-react";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { Product } from "@/types/product";
import { addToCart, removeFromCart } from "@/lib/store/features/cartSlice";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

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
          src={product.image || "/placeholder-product.png"}
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
