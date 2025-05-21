"use client";

import React from "react";
import SubscriptionPriceInput from "./SubscriptionPriceInput";

export default function SubscriptionForm({ mongoUser, onSuccess }) {
  return <SubscriptionPriceInput mongoUser={mongoUser} onSuccess={onSuccess} />;
}
