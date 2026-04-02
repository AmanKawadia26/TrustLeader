import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";

export default function Register() {
  const { t } = useTranslation();
  const [path, setLocation] = useLocation();
  const { register } = useAuth();
  const isBusiness = path.includes("/auth/register/business");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    await register(email, password, isBusiness ? "company" : "consumer");
    setLocation(isBusiness ? "/dashboard/company" : "/dashboard/consumer");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-[hsl(var(--brand-cream))]">
        <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl p-8 sm:p-10 shadow-xl">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-center text-[hsl(var(--brand-forest))] mb-2">
            {isBusiness ? t("auth.register.titleBusiness") : t("auth.register.title")}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">
            {isBusiness ? t("auth.register.subtitleBusiness") : t("auth.register.subtitleConsumer")}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input 
                id="email" 
                type="email" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.login.password')}</Label>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                required 
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base rounded-xl font-semibold bg-[hsl(var(--brand-forest))] hover:bg-[hsl(var(--brand-forest))]/90 text-[hsl(var(--brand-cream))]">
              {t('auth.register.submit')}
            </Button>
          </form>
          
          <p className="text-center mt-8 text-sm text-muted-foreground">
            {isBusiness ? (
              <>
                Signing up to write reviews?{" "}
                <Link href="/auth/register" className="text-[hsl(var(--brand-forest))] font-medium hover:underline">
                  Consumer sign up
                </Link>
              </>
            ) : (
              <>
                Business owner?{" "}
                <Link href="/auth/register/business" className="text-[hsl(var(--brand-forest))] font-medium hover:underline">
                  {t("auth.register.businessLink")}
                </Link>
              </>
            )}
          </p>
          <p className="text-center mt-4 text-sm text-muted-foreground">
            Already have an account? <Link href="/auth/login" className="text-[hsl(var(--brand-forest))] font-medium hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
