"use client";

import { Suspense } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function NotFound() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen"><Loader2 className="animate-spin w-6 h-6 text-gray-500" /></div>}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
          <p className="mb-4">The page you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Go back home
          </Link>
        </div>
      </div>
    </Suspense>
  );
}
