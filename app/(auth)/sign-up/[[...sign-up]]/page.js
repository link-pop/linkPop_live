import { SignUp } from "@clerk/nextjs";
import CustomSignUpPage from "./CustomSignUpPage";

export default function SignUpPage({ searchParams, isCustom = false }) {
  // Get the redirect URL which might contain the referral code
  const redirectUrl = searchParams?.redirect_url || "/";

  // ! CustomSignUpPage works for clerk DB, BUT the user is not saved to mongo DB
  return isCustom ? (
    <CustomSignUpPage redirectUrl={redirectUrl} />
  ) : (
    <SignUp
      redirectUrl={redirectUrl}
      afterSignUpUrl="/" // Always redirect to home after sign up
      signInUrl={`/sign-in${
        redirectUrl !== "/"
          ? `?redirect_url=${encodeURIComponent(redirectUrl)}`
          : ""
      }`}
    />
  );
}
