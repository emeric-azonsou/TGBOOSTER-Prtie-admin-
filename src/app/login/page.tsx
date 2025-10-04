import { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { getSession } from "@/app/actions/auth.actions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Connexion | Admin - TikTok Visibility Platform",
  description: "Connexion à l'espace administrateur",
};

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
}
