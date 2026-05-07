// "use client";

// import { useState, FormEvent } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { PhoneInput } from "react-international-phone";
// import "react-international-phone/style.css";
// import { signIn } from "next-auth/react";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { registerSchema } from "@/lib/validation/auth";
// import { authService } from "@/lib/services/authService";
// import { ZodError } from "zod";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [formData, setFormData] = useState({
//     full_name: "",
//     username: "",
//     email: "",
//     dob: "",
//     gender: "male",
//     password: "",
//     confirmPassword: "",
//   });
//   const [phone, setPhone] = useState("");
//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
//   ) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);

//     try {
//       const validatedData = registerSchema.parse({
//         ...formData,
//         phone_no: phone,
//       });

//       await authService.register(validatedData);

//       router.push("/login?registered=true");
//     } catch (err) {
//       if (err instanceof ZodError) {
//         setError(err.message);
//       } else {
//         setError(err instanceof Error ? err.message : "An error occurred");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleLogin = () => {
//     signIn("google", { callbackUrl: "/" });
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
//       <div className="max-w-xl w-full">
//         <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-8 space-y-6">
//           <div className="text-center">
//             <h1 className="text-3xl font-bold tracking-tight">
//               Create an Account
//             </h1>
//           </div>

//           {error && (
//             <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
//               {error}
//             </div>
//           )}

//           <form
//             onSubmit={handleRegister}
//             className="grid grid-cols-1 md:grid-cols-2 gap-4"
//           >
//             {/* Username */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Username *</label>
//               <input
//                 name="username"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//                 placeholder="Enter your username"
//               />
//             </div>

//             {/* Full Name */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Full Name *</label>
//               <input
//                 name="full_name"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//                 placeholder="Enter your full name"
//               />
//             </div>

//             {/* Email */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Email *</label>
//               <input
//                 type="email"
//                 name="email"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//                 placeholder="Enter your email"
//               />
//             </div>

//             {/* Phone */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium leading-none">
//                 Phone number <span className="text-destructive">*</span>
//               </label>
//               <PhoneInput
//                 defaultCountry="np"
//                 value={phone}
//                 onChange={(p) => setPhone(p)}
//                 inputClassName="!flex !h-10 !w-full !rounded-r-md !border !border-input !bg-background !px-3 !py-2 !text-sm !outline-none focus-visible:ring-2 focus-visible:ring-ring"
//                 countrySelectorStyleProps={{
//                   buttonClassName:
//                     "!h-10 !rounded-l-md !border !border-r-0 !border-input !bg-background !px-2",
//                 }}
//               />
//             </div>

//             {/* Date of Birth */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Date of Birth *</label>
//               <input
//                 type="date"
//                 name="dob"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//               />
//             </div>

//             {/* Gender */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Gender *</label>
//               <select
//                 name="gender"
//                 value={formData.gender}
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all cursor-pointer"
//               >
//                 <option value="male">Male</option>
//                 <option value="female">Female</option>
//                 <option value="other">Other</option>
//               </select>
//             </div>

//             {/* Password */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Password *</label>
//               <input
//                 type="password"
//                 name="password"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//                 placeholder="Enter your password"
//               />
//             </div>

//             {/* Confirm Password */}
//             <div className="space-y-2">
//               <label className="text-sm font-medium">Confirm Password *</label>
//               <input
//                 type="password"
//                 name="confirmPassword"
//                 onChange={handleChange}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none transition-all"
//                 placeholder="Confirm your password"
//               />
//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="md:col-span-2 w-full h-12"
//             >
//               {loading ? "Creating Account..." : "Sign Up"}
//             </Button>
//           </form>

//           {/* ... footer and google button ... */}
//           <div className="relative py-2">
//             <div className="absolute inset-0 flex items-center">
//               <span className="w-full border-t border-border" />
//             </div>
//             <div className="relative flex justify-center text-xs uppercase">
//               <span className="bg-card px-2 text-muted-foreground">OR</span>
//             </div>
//           </div>

//           <button
//             type="button"
//             className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent h-11 px-4 py-2 gap-2"
//             onClick={handleGoogleLogin}
//           >
//             <Image src={"/google.png"} alt="google" width={20} height={20} />
//             Continue with Google
//           </button>

//           <p className="text-center text-sm text-muted-foreground">
//             Already have an account?{" "}
//             <Link
//               href="/login"
//               className="text-primary hover:underline underline-offset-4 font-semibold"
//             >
//               Sign in
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PhoneInput } from "react-international-phone";
import "react-international-phone/style.css";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { registerSchema } from "@/lib/validation/auth";
import { authService } from "@/lib/services/authService";
import { ZodError } from "zod";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    full_name: "",
    username: "",
    email: "",
    dob: "",
    gender: "male",
    password: "",
    confirmPassword: "",
  });
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [showOTP, setShowOTP] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const validatedData = registerSchema.parse({
        ...formData,
        phone_no: phone,
      });

      await authService.register(validatedData);
      setShowOTP(true);
    } catch (err) {
      if (err instanceof ZodError) {
        setError(err.errors[0].message);
      } else {
        setError(err instanceof Error ? err.message : "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_AUTH_URL}/auth/verify-email/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            otp: otp,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="max-w-xl w-full">
        <div className="bg-card text-card-foreground rounded-xl border border-border shadow-sm p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              {showOTP ? "Verify Your Email" : "Create an Account"}
            </h1>
            {showOTP && (
              <p className="text-sm text-muted-foreground mt-2">
                An OTP has been sent to {formData.email}
              </p>
            )}
          </div>

          {error && (
            <div className="bg-destructive/15 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {!showOTP ? (
            /* REGISTRATION FORM */
            <form
              onSubmit={handleRegister}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium">Username *</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  placeholder="deepak_dev"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name *</label>
                <input
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  placeholder="Deepak Shrestha"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  placeholder="example@gmail.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none">
                  Phone number *
                </label>
                <PhoneInput
                  defaultCountry="np"
                  value={phone}
                  onChange={(p) => setPhone(p)}
                  inputClassName="!flex !h-10 !w-full !rounded-r-md !border !border-input !bg-background !px-3 !py-2 !text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date of Birth *</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Gender *</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Password *</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="md:col-span-2 w-full h-12"
              >
                {loading ? "Creating Account..." : "Sign Up"}
              </Button>
            </form>
          ) : (
            /* VERIFICATION FORM */
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter 6-digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="flex h-12 w-full text-center text-2xl tracking-widest rounded-md border border-input bg-background px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring outline-none"
                  placeholder="000000"
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12">
                {loading ? "Verifying..." : "Verify & Continue"}
              </Button>
              <button
                type="button"
                onClick={() => setShowOTP(false)}
                className="text-sm text-primary hover:underline w-full text-center"
              >
                Back to Registration
              </button>
            </form>
          )}

          {/* Social login and footer only shown on registration page */}
          {!showOTP && (
            <>
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              <button
                type="button"
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-accent h-11 px-4 py-2 gap-2"
                onClick={() => signIn("google", { callbackUrl: "/" })}
              >
                <Image
                  src={"/google.png"}
                  alt="google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-semibold"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
