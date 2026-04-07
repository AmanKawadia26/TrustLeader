import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

export default function AdminLogin() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) return;

    const profile = await login(email, password);
    if (!profile) {
      setError("Could not load profile.");
      return;
    }
    if (profile.role !== "admin") {
      setError("This sign-in is for administrator accounts only.");
      return;
    }
    setLocation("/dashboard/admin");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-[hsl(var(--brand-cream))]">
        <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex justify-center mb-4">
            <div className="bg-[hsl(var(--brand-forest))]/10 p-3 rounded-2xl">
              <Shield className="w-8 h-8 text-[hsl(var(--brand-forest))]" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-2">
            Administrator access
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-center text-[hsl(var(--brand-forest))] mb-8">
            {t("auth.login.title")}
          </h1>

          {error && (
            <p className="text-sm text-destructive text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email-admin">{t("auth.login.email")}</Label>
              <Input
                id="email-admin"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-admin">{t("auth.login.password")}</Label>
              <Input
                id="password-admin"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl font-semibold bg-[hsl(var(--brand-forest))] hover:bg-[hsl(var(--brand-forest))]/90 text-[hsl(var(--brand-cream))]"
            >
              {t("auth.login.submit")}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            <Link href="/auth/login" className="text-[hsl(var(--brand-forest))] font-medium hover:underline">
              Standard sign in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
