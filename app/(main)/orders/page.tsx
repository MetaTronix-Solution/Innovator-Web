"use client";

import { useEffect, useState } from "react";
import { Loader2, Package } from "lucide-react";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="py-2 md:py-4 max-w-4xl mx-auto">
      <h1 className="text-xl text-center font-bold text-foreground mb-4">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="mx-auto mb-4 opacity-20" size={64} />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-6 shadow-sm transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-semibold text-lg text-foreground">
                    Order #{order.id.slice(0, 8)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    order.status === "paid"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 mt-4">
                {order.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {item.product_name} x {item.quantity}
                    </span>
                    <span className="font-medium text-foreground">
                      NPR {item.price}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-border flex justify-between items-center font-bold text-foreground">
                <span>Total Amount</span>
                <span className="text-primary text-lg">
                  NPR {order.total_amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
