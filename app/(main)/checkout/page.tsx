// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { Button } from "@/components/ui/button"; // Standard shadcn/ui
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Loader2, ShieldCheck, AlertCircle } from "lucide-react";

// export default function CheckoutPage({ productId }: { productId: string }) {
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const handleCheckout = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await fetch("/api/checkout/create-order", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ product: productId }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Failed to process your order.");
//       }

//       router.push(`/checkout/success?orderId=${data.orderId}`);
//     } catch (err: any) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container max-w-lg py-12">
//       <Card className="shadow-lg border-zinc-200">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">Checkout</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <p className="text-zinc-600">
//             Securely place your order for item:{" "}
//             <span className="font-mono bg-zinc-100 p-1 rounded">
//               {productId}
//             </span>
//           </p>

//           {error && (
//             <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
//               <AlertCircle size={18} />
//               <p className="text-sm font-medium">{error}</p>
//             </div>
//           )}

//           <Button
//             className="w-full h-12 text-lg"
//             onClick={handleCheckout}
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <Loader2 className="mr-2 animate-spin" /> Processing...
//               </>
//             ) : (
//               "Confirm & Pay"
//             )}
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, ChevronDown } from "lucide-react";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
];

type Step = 1 | 2 | 3 | 4;

interface ShippingForm {
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  zipCode: string;
  city: string;
  state: string;
}

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

  const [form, setForm] = useState<ShippingForm>({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    zipCode: "",
    city: "",
    state: "",
  });

  const [formErrors, setFormErrors] = useState<Partial<ShippingForm>>({});

  const handleChange = (field: keyof ShippingForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateShipping = (): boolean => {
    const errors: Partial<ShippingForm> = {};
    if (!form.firstName.trim()) errors.firstName = "Required";
    if (!form.lastName.trim()) errors.lastName = "Required";
    if (!form.address1.trim()) errors.address1 = "Required";
    if (!form.zipCode.trim()) errors.zipCode = "Required";
    if (!form.city.trim()) errors.city = "Required";
    if (!form.state) errors.state = "Required";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueShipping = () => {
    if (validateShipping()) setActiveStep(2);
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: productId, shipping: form }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to process your order.");
      router.push(`/checkout/success?orderId=${data.orderId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f0] font-sans">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 tracking-tight">
          Checkout
        </h1>
        <p className="text-sm font-semibold text-gray-700">
          Order subtotal ({itemCount} items):{" "}
          <span className="font-black">${subtotal.toFixed(2)}</span>
        </p>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        {STEPS.map((step) => {
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          const isLocked = activeStep < step.id;

          return (
            <div key={step.id} className="flex gap-4">
              {/* Step indicator + connector */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isCompleted && setActiveStep(step.id as Step)}
                  disabled={isLocked}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center text-sm font-black transition-all shrink-0
                    ${
                      isActive
                        ? "bg-gray-900 border-gray-900 text-white"
                        : isCompleted
                          ? "bg-white border-gray-900 text-gray-900 hover:bg-gray-50 cursor-pointer"
                          : "bg-white border-gray-300 text-gray-400 cursor-default"
                    }`}
                >
                  {step.id}
                </button>
                {step.id < 4 && (
                  <div className="w-px flex-1 mt-1 mb-0 min-h-[12px] bg-gray-300" />
                )}
              </div>

              {/* Step card */}
              <div className="flex-1 mb-1">
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  {/* Step header */}
                  <div
                    className={`px-6 py-4 ${isActive ? "border-b border-gray-100" : ""}`}
                  >
                    <h2
                      className={`font-black text-lg tracking-tight ${
                        isLocked ? "text-gray-400" : "text-gray-900"
                      }`}
                    >
                      {step.label}
                    </h2>
                  </div>

                  {/* Step content */}
                  {isActive && (
                    <div className="px-6 pb-6">
                      {step.id === 1 && (
                        <ShippingAddressForm
                          form={form}
                          errors={formErrors}
                          onChange={handleChange}
                          onContinue={handleContinueShipping}
                        />
                      )}
                      {step.id === 2 && (
                        <ShippingMethodStep
                          onContinue={() => setActiveStep(3)}
                        />
                      )}
                      {step.id === 3 && (
                        <PaymentStep onContinue={() => setActiveStep(4)} />
                      )}
                      {step.id === 4 && (
                        <ReviewStep
                          form={form}
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
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Shipping Address Form ── */
function ShippingAddressForm({
  form,
  errors,
  onChange,
  onContinue,
}: {
  form: ShippingForm;
  errors: Partial<ShippingForm>;
  onChange: (field: keyof ShippingForm, value: string) => void;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-4 pt-1">
      <div>
        <p className="text-xs text-gray-500 mb-1">
          Address lookup powered by Google, view{" "}
          <a href="#" className="underline text-blue-600">
            Privacy policy
          </a>{" "}
          To optout change{" "}
          <a href="#" className="underline text-blue-600">
            cookie preferences
          </a>
          .
        </p>
        <p className="text-xs text-gray-600 font-medium">
          *Indicates required field
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="FIRST NAME *"
          value={form.firstName}
          error={errors.firstName}
          onChange={(v) => onChange("firstName", v)}
        />
        <Field
          label="LAST NAME *"
          value={form.lastName}
          error={errors.lastName}
          onChange={(v) => onChange("lastName", v)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field
          label="ADDRESS 1 – STREET OR P.O. BOX *"
          value={form.address1}
          error={errors.address1}
          onChange={(v) => onChange("address1", v)}
        />
        <Field
          label="ADDRESS 2 – APT, SUITE, FLOOR"
          placeholder="Leave blank if P.O. Box in Address 1"
          value={form.address2}
          onChange={(v) => onChange("address2", v)}
        />
      </div>

      <div className="grid grid-cols-[1fr_1fr_1fr] gap-4">
        <Field
          label="ZIP CODE *"
          value={form.zipCode}
          error={errors.zipCode}
          onChange={(v) => onChange("zipCode", v)}
        />
        <Field
          label="CITY *"
          value={form.city}
          error={errors.city}
          onChange={(v) => onChange("city", v)}
        />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
            STATE *
          </label>
          <div className="relative">
            <select
              value={form.state}
              onChange={(e) => onChange("state", e.target.value)}
              className={`w-full border rounded px-3 py-2.5 text-sm bg-white appearance-none pr-8 outline-none focus:border-gray-900 transition-colors
                ${errors.state ? "border-red-400" : "border-gray-300"}`}
            >
              <option value="">Select...</option>
              {US_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
          </div>
          {errors.state && (
            <p className="text-[10px] text-red-500">{errors.state}</p>
          )}
        </div>
      </div>

      <button
        onClick={onContinue}
        className="mt-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-8 py-3 rounded transition-colors active:scale-[0.98]"
      >
        Continue to shipping method
      </button>
    </div>
  );
}

/* ── Shipping Method Step ── */
function ShippingMethodStep({ onContinue }: { onContinue: () => void }) {
  const [selected, setSelected] = useState("standard");
  return (
    <div className="space-y-3 pt-2">
      {[
        {
          id: "standard",
          label: "Standard Shipping",
          detail: "5–7 business days",
          price: "Free",
        },
        {
          id: "express",
          label: "Express Shipping",
          detail: "2–3 business days",
          price: "$12.99",
        },
        {
          id: "overnight",
          label: "Overnight",
          detail: "Next business day",
          price: "$24.99",
        },
      ].map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center justify-between gap-3 border rounded px-4 py-3 cursor-pointer transition-colors
            ${selected === opt.id ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400"}`}
        >
          <div className="flex items-center gap-3">
            <input
              type="radio"
              name="shipping"
              value={opt.id}
              checked={selected === opt.id}
              onChange={() => setSelected(opt.id)}
              className="accent-gray-900"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">{opt.label}</p>
              <p className="text-xs text-gray-500">{opt.detail}</p>
            </div>
          </div>
          <span className="text-sm font-black text-gray-900">{opt.price}</span>
        </label>
      ))}
      <button
        onClick={onContinue}
        className="mt-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-8 py-3 rounded transition-colors"
      >
        Continue to payment
      </button>
    </div>
  );
}

/* ── Payment Step ── */
function PaymentStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="CARD NUMBER"
          placeholder="1234 5678 9012 3456"
          value=""
          onChange={() => {}}
        />
        <Field
          label="NAME ON CARD"
          placeholder="John Doe"
          value=""
          onChange={() => {}}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field
          label="EXPIRY DATE"
          placeholder="MM / YY"
          value=""
          onChange={() => {}}
        />
        <Field label="CVV" placeholder="•••" value="" onChange={() => {}} />
      </div>
      <button
        onClick={onContinue}
        className="mt-1 bg-gray-900 hover:bg-gray-800 text-white font-bold text-sm px-8 py-3 rounded transition-colors"
      >
        Continue to review
      </button>
    </div>
  );
}

/* ── Review Step ── */
function ReviewStep({
  form,
  subtotal,
  loading,
  error,
  onPlaceOrder,
}: {
  form: ShippingForm;
  subtotal: number;
  loading: boolean;
  error: string | null;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="space-y-4 pt-2">
      <div className="bg-gray-50 rounded border border-gray-200 p-4 text-sm space-y-1">
        <p className="font-bold text-gray-900">Shipping to:</p>
        <p className="text-gray-600">
          {form.firstName} {form.lastName}
        </p>
        <p className="text-gray-600">
          {form.address1}
          {form.address2 ? `, ${form.address2}` : ""}
        </p>
        <p className="text-gray-600">
          {form.city}
          {form.state ? `, ${form.state}` : ""} {form.zipCode}
        </p>
      </div>

      <div className="flex justify-between text-sm font-black text-gray-900 border-t pt-3">
        <span>Order total</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded border border-red-200">
          <AlertCircle size={16} />
          <p className="text-xs font-medium">{error}</p>
        </div>
      )}

      <button
        onClick={onPlaceOrder}
        disabled={loading}
        className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-black text-sm py-3.5 rounded transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" /> Processing...
          </>
        ) : (
          "Place order"
        )}
      </button>
    </div>
  );
}

/* ── Reusable Field ── */
function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`border rounded px-3 py-2.5 text-sm outline-none focus:border-gray-900 transition-colors bg-white
          ${error ? "border-red-400" : "border-gray-300"}`}
      />
      {error && <p className="text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
