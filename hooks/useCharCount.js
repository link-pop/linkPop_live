"use client";

export default function useCharCount(value, maxLength) {
  const count = value?.length || 0;
  return `${count}/${maxLength}`;
}