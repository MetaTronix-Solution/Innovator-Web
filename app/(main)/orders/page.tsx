"use client";

import { useEffect, useState } from "react";
import { Loader2, Package, Receipt, Box, ChevronDown } from "lucide-react";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
};

type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
};

const statusConfig: Record<string, { label: string; className: string }> = {
  paid: {
    label: "Paid",
    className:
      "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
  },
  processing: {
    label: "Processing",
    className:
      "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400",
  },
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
  },
};

const FILTERS = ["all", "paid", "processing", "pending", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

function formatDate(str: string) {
  return new Date(str).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number | string) {
  return Math.round(Number(amount))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [openOrders, setOpenOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const toggleOrder = (id: string) => {
    setOpenOrders((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const totalSpent = filtered.reduce(
    (sum, o) => sum + Number(o.total_amount),
    0,
  );
  const activeCount = filtered.filter(
    (o) => o.status === "paid" || o.status === "processing",
  ).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 max-w-3xl mx-auto px-4">
      <h1 className="text-xl font-semibold text-foreground mb-6">My Orders</h1>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Total orders", value: orders.length },
          { label: "Total spent", value: `NPR ${formatAmount(totalSpent)}` },
          { label: "Active", value: activeCount },
        ].map((stat) => (
          <div key={stat.label} className="bg-muted rounded-xl px-4 py-3">
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg font-medium text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm border transition-all ${
              filter === f
                ? "bg-foreground text-background border-foreground font-medium"
                : "bg-transparent text-muted-foreground border-border hover:bg-muted"
            }`}
          >
            {f === "all" ? "All" : (statusConfig[f]?.label ?? f)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Package className="mx-auto mb-4 opacity-20" size={64} />
          <p className="text-sm">No orders found.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => {
            const cfg = statusConfig[order.status] ?? {
              label: order.status,
              className: "bg-muted text-muted-foreground",
            };
            const isOpen = openOrders.has(order.id);

            return (
              <div
                key={order.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                <div
                  onClick={() => toggleOrder(order.id)}
                  className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Receipt size={15} className="text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Order #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatDate(order.created_at)} &middot;{" "}
                        {order.items.length} item
                        {order.items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${cfg.className}`}
                    >
                      {cfg.label}
                    </span>
                    <span className="text-sm font-medium text-foreground hidden sm:block">
                      NPR {formatAmount(Number(order.total_amount))}{" "}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </div>

                {isOpen && (
                  <div className="border-t border-border px-5 py-4">
                    <div className="flex flex-col gap-3 mb-4">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Box
                                size={14}
                                className="text-muted-foreground"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-foreground truncate">
                                {item.product_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-medium text-foreground shrink-0">
                            NPR{" "}
                            {formatAmount(
                              Number(item.price) * Number(item.quantity),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-sm text-muted-foreground">
                        Total amount
                      </span>
                      <span className="text-base font-semibold text-foreground">
                        NPR {formatAmount(order.total_amount)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
