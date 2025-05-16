"use client";

import React from "react";
import SubscriptionPriceInput from "./SubscriptionPriceInput";

export default function SubscriptionForm({ mongoUser }) {
  return <SubscriptionPriceInput mongoUser={mongoUser} />;
}
