"use client";

import { ArrowLeft } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

interface BackButtonProps {
  fallbackHref?: string;
  label?: string;
}

export default function BackButton({
  fallbackHref = "/",
  label = "Kembali",
}: BackButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleBack = () => {
    const referrer = document.referrer;
    const hasInternalHistory =
      referrer.startsWith(window.location.origin) &&
      new URL(referrer).pathname !== pathname;

    if (hasInternalHistory) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="inline-flex items-center text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
    >
      <ArrowLeft className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
}
