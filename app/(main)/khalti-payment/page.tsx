"use client";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function KhaltiPayment() {
  const searchParams = useSearchParams();
  const paymentUrl = searchParams.get("url");
  const productName = searchParams.get("product") || "";
  const price = searchParams.get("price") || "";

  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentUrl) {
      setIsLoading(true);
      window.location.href = decodeURIComponent(paymentUrl);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold text-card-foreground mb-6">
          Confirm Payment
        </h2>

        <form onSubmit={handlePayment} className="space-y-5">
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Product
            </Label>
            <Input
              value={productName}
              disabled
              className="bg-background border-border text-foreground rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase">
              Amount (NPR)
            </Label>
            <Input
              value={price}
              disabled
              className="bg-background border-border text-foreground rounded-xl"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl font-bold"
            disabled={isLoading}
          >
            {isLoading ? "Redirecting..." : "Pay with Khalti"}
          </Button>
        </form>
      </div>
    </div>
  );
}
