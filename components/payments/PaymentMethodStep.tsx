// "use client";

// import { useState } from "react";

// export function PaymentMethodStep({ onContinue }: { onContinue: () => void }) {
//   const [selected, setSelected] = useState("cod");

//   const options = [
//     {
//       id: "cod",
//       label: "Cash on Delivery (COD)",
//       detail: "Pay in cash when you receive your order",
//     },
//     {
//       id: "khalti",
//       label: "Khalti",
//       detail: "Secure digital payment via Khalti wallet",
//     },
//   ];

//   return (
//     <div className="space-y-4">
//       {options.map((opt) => (
//         <label
//           key={opt.id}
//           className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
//             selected === opt.id
//               ? "border-primary bg-primary/5"
//               : "border-border hover:border-primary/50"
//           }`}
//         >
//           <div className="flex items-center gap-4">
//             <input
//               type="radio"
//               name="payment"
//               checked={selected === opt.id}
//               onChange={() => setSelected(opt.id)}
//               className="accent-primary h-4 w-4"
//             />
//             <div>
//               <p className="text-sm font-bold text-foreground">{opt.label}</p>
//               <p className="text-xs text-muted-foreground">{opt.detail}</p>
//             </div>
//           </div>
//         </label>
//       ))}

//       {/* Conditional UI for Khalti instructions if needed */}
//       {selected === "khalti" && (
//         <div className="p-3 bg-blue-50 text-blue-700 rounded-xl text-xs font-medium border border-blue-100">
//           You will be redirected to the Khalti payment gateway after clicking
//           "Place Order".
//         </div>
//       )}

//       <button
//         onClick={onContinue}
//         className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90 transition-all"
//       >
//         Continue to review
//       </button>
//     </div>
//   );
// }

export function PaymentMethodStep({
  selected,
  onSelect,
  onContinue,
}: {
  selected: "cod" | "khalti";
  onSelect: (m: "cod" | "khalti") => void;
  onContinue: () => void;
}) {
  const options = [
    {
      id: "cod",
      label: "Cash on Delivery (COD)",
      detail: "Pay in cash upon delivery",
    },
    {
      id: "khalti",
      label: "Khalti",
      detail: "Secure digital payment via Khalti",
    },
  ];

  return (
    <div className="space-y-4">
      {options.map((opt) => (
        <label
          key={opt.id}
          className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            selected === opt.id
              ? "border-primary bg-primary/5"
              : "border-border"
          }`}
        >
          <div className="flex items-center gap-4">
            <input
              type="radio"
              name="payment"
              checked={selected === opt.id}
              onChange={() => onSelect(opt.id as "cod" | "khalti")}
              className="accent-primary h-4 w-4"
            />
            <div>
              <p className="text-sm font-bold text-foreground">{opt.label}</p>
              <p className="text-xs text-muted-foreground">{opt.detail}</p>
            </div>
          </div>
        </label>
      ))}
      <button
        onClick={onContinue}
        className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl hover:bg-primary/90"
      >
        Continue to payment
      </button>
    </div>
  );
}
