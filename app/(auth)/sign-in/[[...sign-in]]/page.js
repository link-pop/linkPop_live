import { SignIn } from "@clerk/nextjs";

export default function SignInPage({ searchParams }) {
  // Get the redirect URL which might contain the referral code
  const redirectUrl = searchParams?.redirect_url || "/";

  return (
    <SignIn
      redirectUrl={redirectUrl}
      afterSignInUrl="/" // Always redirect to home after sign in
      signUpUrl={`/sign-up${
        redirectUrl !== "/"
          ? `?redirect_url=${encodeURIComponent(redirectUrl)}`
          : ""
      }`}
    />
  );
}
