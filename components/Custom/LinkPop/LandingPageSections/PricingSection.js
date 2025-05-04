"use client";

import Pricing2Content from "@/app/pricing/Pricing2Content";

export default function PricingSection({ userSubscription, isAdmin }) {
  return (
    <section id="pricing-section" className="bg-background py-24">
      <Pricing2Content userSubscription={userSubscription} isAdmin={isAdmin} />
    </section>
  );
}
