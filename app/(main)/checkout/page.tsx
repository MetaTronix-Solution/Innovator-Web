"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button"; // Standard shadcn/ui
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

export default function CheckoutPage({ productId }: { productId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process your order.");
      }

      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg py-12">
      <Card className="shadow-lg border-zinc-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-zinc-600">
            Securely place your order for item:{" "}
            <span className="font-mono bg-zinc-100 p-1 rounded">
              {productId}
            </span>
          </p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
              <AlertCircle size={18} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <Button
            className="w-full h-12 text-lg"
            onClick={handleCheckout}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" /> Processing...
              </>
            ) : (
              "Confirm & Pay"
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 text-zinc-400 text-xs">
            <ShieldCheck size={16} />
            <span>Secure 256-bit SSL encrypted checkout</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
