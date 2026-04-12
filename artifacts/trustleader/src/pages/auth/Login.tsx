import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { SeoHead } from "@/components/SeoHead";
import { ROUTES } from "@/lib/routes";

export default function Login() {
  const { t } = useTranslation();
  const logoSrc = `${import.meta.env.BASE_URL}my-protector-logo.png`;
  const [, setLocation] = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const profile = await login(email, password);
    if (profile?.role === "admin") setLocation("/dashboard/admin");
    else if (profile?.role === "company") setLocation("/dashboard/company");
    else if (profile?.role === "reseller") setLocation("/dashboard/reseller");
    else setLocation("/dashboard/consumer");
  };

  return (
    <Layout>
      <SeoHead
        title={t("seo.login.title")}
        description={t("seo.login.description")}
        canonicalPath={ROUTES.authLogin}
      />
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-[hsl(var(--brand-cream))]">
        <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img
              src={logoSrc}
              alt=""
              width={332}
              height={290}
              className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
              decoding="async"
            />
            <span className="font-bold text-[hsl(var(--brand-navy))] text-xl tracking-tight">My Protector</span>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-2">{t("auth.login.subtitle")}</p>
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-center text-[hsl(var(--brand-navy))] mb-8">
            {t("auth.login.title")}
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">{t("auth.login.email")}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("auth.login.password")}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base rounded-xl font-semibold bg-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-navy))]/90 text-[hsl(var(--brand-cream))]"
            >
              {t("auth.login.submit")}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            {t("auth.login.footerNoAccount")}{" "}
            <Link href={ROUTES.authRegister} className="text-[hsl(var(--brand-royal))] font-medium hover:underline">
              {t("auth.login.footerSignupLink")}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
