"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Check } from "lucide-react";
import {
  CustomerInfo,
  CustomerInfoForm,
} from "@/components/payments/CustomerInfoForm";
import { PaymentMethodStep } from "@/components/payments/PaymentMethodStep";

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Shipping address" },
  { id: 2, label: "Shipping method" },
  { id: 3, label: "Payment" },
  { id: 4, label: "Review & place order" },
];

export default function CheckoutPage({
  productId,
  itemCount = 2,
  subtotal = 300,
}: {
  productId: string;
  itemCount?: number;
  subtotal?: number;
}) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<CustomerInfo>({
    fullName: "",
    phone: "",
    area: "",
    deliveryAddress: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "khalti">("cod");

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, shipping: form }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to process order.");
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Checkout
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Order subtotal ({itemCount} items):
            <span className="font-bold text-foreground">
              NPR {subtotal.toFixed(2)}
            </span>
          </p>
        </header>

        <div className="space-y-6">
          {STEPS.map((step) => {
            const isActive = activeStep === step.id;
            const isCompleted = activeStep > step.id;

            return (
              <div key={step.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full border-2 flex items-center justify-center font-bold ${isActive ? "bg-primary border-primary text-primary-foreground" : isCompleted ? "bg-primary/10 border-primary text-primary" : "bg-card border-border text-muted-foreground"}`}
                  >
                    {isCompleted ? <Check size={18} /> : step.id}
                  </div>
                  {step.id < 4 && (
                    <div className="w-px h-full bg-border my-2" />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <h2
                    className={`text-lg font-bold mb-4 ${activeStep < step.id ? "text-muted-foreground" : "text-foreground"}`}
                  >
                    {step.label}
                  </h2>
                  {isActive && (
                    <div className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                      {step.id === 1 && (
                        <CustomerInfoForm
                          form={form}
                          onChange={handleChange}
                          onContinue={() => setActiveStep(2)}
                        />
                      )}
                      {step.id === 2 && (
                        <PaymentMethodStep
                          selected={paymentMethod}
                          onSelect={setPaymentMethod}
                          onContinue={() => setActiveStep(3)}
                        />
                      )}
                      {step.id === 3 && (
                        <PaymentStep
                          method={paymentMethod}
                          onContinue={() => setActiveStep(4)}
                        />
                      )}
                      {step.id === 4 && (
                        <ReviewStep
                          form={form}
                          paymentMethod={paymentMethod}
                          subtotal={subtotal}
                          loading={loading}
                          error={error}
                          onPlaceOrder={handleCheckout}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Field({ label, value, onChange, error, placeholder }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-background border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 ${error ? "border-destructive" : "border-border"}`}
      />
    </div>
  );
}

function PaymentStep({
  method,
  onContinue,
}: {
  method: "cod" | "khalti";
  onContinue: () => void;
}) {
  return (
    <div className="space-y-6">
      {method === "khalti" ? (
        <div className="bg-card border border-primary/20 p-6 rounded-2xl text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
            K
          </div>
          <div>
            <h3 className="font-bold text-foreground">Khalti Payment</h3>
            <p className="text-sm text-muted-foreground mt-1">
              You will be redirected to the Khalti secure gateway to complete
              your payment.
            </p>
          </div>
          <button
            onClick={() => {
              /* Trigger Khalti SDK or Redirect here */
            }}
            className="w-full bg-[#5C2D91] text-white font-bold py-3 rounded-xl hover:bg-[#5C2D91]/90 transition-all"
          >
            Pay with Khalti
          </button>
        </div>
      ) : (
        <div className="p-6 bg-muted rounded-2xl text-center">
          <p className="text-sm font-medium text-foreground">
            You have selected <strong>Cash on Delivery</strong>. Please ensure
            you have the exact amount ready upon delivery.
          </p>
        </div>
      )}

      {/* Navigation button to Review step */}
      <button
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all"
      >
        Continue to review
      </button>
    </div>
  );
}

function ReviewStep({
  form,
  paymentMethod,
  subtotal,
  loading,
  error,
  onPlaceOrder,
}: any) {
  return (
    <div className="space-y-6">
      <div className="bg-background p-4 rounded-xl border border-border text-sm">
        <p className="font-bold text-foreground mb-2">Delivery Details:</p>
        <p className="text-foreground font-semibold">{form.fullName}</p>
        <p className="text-muted-foreground">{form.phone}</p>
        <p className="text-muted-foreground">{form.deliveryAddress}</p>
        <p className="text-muted-foreground mt-2 font-medium">
          Payment: {paymentMethod === "cod" ? "Cash on Delivery" : "Khalti"}
        </p>
      </div>

      <div className="flex justify-between items-center text-lg font-bold text-foreground border-t border-border pt-4">
        <span>Order total</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-xl border border-destructive/20 text-xs">
          <AlertCircle size={16} />
          <p>{error}</p>
        </div>
      )}

      <button
        onClick={onPlaceOrder}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-bold py-4 rounded-xl hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          "Place order"
        )}
      </button>
    </div>
  );
}
