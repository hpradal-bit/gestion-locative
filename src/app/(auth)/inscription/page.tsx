import type { Metadata } from "next";

import { SignupForm } from "@/features/auth/signup-form";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return <SignupForm />;
}
