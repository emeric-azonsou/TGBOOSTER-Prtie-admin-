"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AdminLogger } from "@/lib/utils/admin-logger";

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email et mot de passe requis" };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Authentification échouée" };
  }

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("user_type")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.user_type !== "admin") {
    await supabase.auth.signOut();
    return { error: "Accès refusé. Réservé aux administrateurs." };
  }

  await AdminLogger.logLogin(data.user.id, true).catch((err) =>
    console.error("Failed to log login:", err)
  );

  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await AdminLogger.logLogout(user.id).catch((err) =>
      console.error("Failed to log logout:", err)
    );
  }

  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getSession() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return {
    ...user,
    profile,
  };
}
