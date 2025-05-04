"use client";

import Input from "@/components/ui/shared/Input/InputQookeys";
import { useSignUp } from "@clerk/nextjs";
import { useState } from "react";
import { useRouter } from "next/navigation";

// https://clerk.com/docs/custom-flows/overview
// https://clerk.com/docs/custom-flows/email-password
export default function CustomSignUpPage({ redirectUrl = "/" }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    position: "",
    phone: "",
    whatsapp: "",
    companyName: "",
    innKpp: "",
    legalAddress: "",
    physicalAddress: "",
    scopeOfActivity: "",
  });
  const [status, setStatus] = useState({ loading: false, error: null });

  const handleSubmit = async () => {
    if (!isLoaded) return;

    try {
      setStatus({ loading: true, error: null });

      if (!formData.email || !formData.password) {
        setStatus({ loading: false, error: "Email and password are required" });
        return;
      }

      console.log("Starting sign up process...");

      // Create the signup
      const signUpAttempt = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        unsafeMetadata: {
          position: formData.position,
          phone: formData.phone,
          whatsapp: formData.whatsapp,
          companyName: formData.companyName,
          innKpp: formData.innKpp,
          legalAddress: formData.legalAddress,
          physicalAddress: formData.physicalAddress,
          scopeOfActivity: formData.scopeOfActivity,
        },
      });

      console.log("Sign up attempt:", signUpAttempt);

      // Send verification email
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStatus({ loading: false, error: null });
      setVerifying(true);
    } catch (error) {
      console.error("Error during signup:", error);
      setStatus({
        loading: false,
        error: error.message || "Something went wrong, please try again later.",
      });
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    try {
      setStatus({ loading: true, error: null });

      console.log("Starting verification with code:", code);

      const verification = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Verification response:", verification);

      if (verification.status !== "complete") {
        throw new Error("Verification failed. Please try again.");
      }

      console.log("Verification complete, activating session...");

      if (verification.createdSessionId) {
        await setActive({ session: verification.createdSessionId });
        router.push(redirectUrl);
      } else {
        throw new Error("No session created after verification");
      }
    } catch (error) {
      console.error("Error during verification:", error);
      setStatus({
        loading: false,
        error: error.message || "Verification failed. Please try again.",
      });
    }
  };

  if (verifying) {
    return (
      <div className="space-y-4 max-w-md mx-auto p-4">
        <h2 className="text-2xl font-bold mb-6">Verify your email</h2>
        <Input
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />
        <button
          onClick={handleVerify}
          disabled={status.loading}
          className={`w-full p-2 rounded-md font-semibold mt-4 ${
            status.loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          {status.loading ? "Verifying..." : "Verify Email"}
        </button>
        {status.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md">
            {status.error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Sign Up</h2>

      {status.error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-md">
          {status.error}
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <Input
        label="Position"
        value={formData.position}
        onChange={(e) => setFormData({ ...formData, position: e.target.value })}
      />

      <Input
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
      />

      <Input
        label="WhatsApp"
        value={formData.whatsapp}
        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
      />

      <Input
        label="Company Name"
        value={formData.companyName}
        onChange={(e) =>
          setFormData({ ...formData, companyName: e.target.value })
        }
      />

      <Input
        label="INN/KPP"
        value={formData.innKpp}
        onChange={(e) => setFormData({ ...formData, innKpp: e.target.value })}
      />

      <Input
        label="Legal Address"
        value={formData.legalAddress}
        onChange={(e) =>
          setFormData({ ...formData, legalAddress: e.target.value })
        }
      />

      <Input
        label="Physical Address"
        value={formData.physicalAddress}
        onChange={(e) =>
          setFormData({ ...formData, physicalAddress: e.target.value })
        }
      />

      <Input
        label="Scope of Activity"
        value={formData.scopeOfActivity}
        onChange={(e) =>
          setFormData({ ...formData, scopeOfActivity: e.target.value })
        }
      />

      <button
        onClick={handleSubmit}
        disabled={status.loading}
        className={`w-full p-2 rounded-md font-semibold mt-4 ${
          status.loading
            ? "bg-blue-300 cursor-not-allowed"
            : "bg-blue-500 hover:bg-blue-600 text-white"
        }`}
      >
        {status.loading ? "Signing up..." : "Sign Up"}
      </button>
    </div>
  );
}
