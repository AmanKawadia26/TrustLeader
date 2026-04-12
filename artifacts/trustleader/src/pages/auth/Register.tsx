import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { ROUTES } from "@/lib/routes";
import { SeoHead } from "@/components/SeoHead";

export default function Register() {
  const { t } = useTranslation();
  const [path, setLocation] = useLocation();
  const { register } = useAuth();
  const isBusiness = path.includes("/auth/register/business");
  const isReseller = path.includes("/auth/register/reseller");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    const role = isBusiness ? "company" : isReseller ? "reseller" : "consumer";
    await register(email, password, role);
    if (isBusiness) setLocation("/dashboard/company");
    else if (isReseller) setLocation("/dashboard/reseller");
    else setLocation("/dashboard/consumer");
  };

  const titleKey = isBusiness
    ? "auth.register.titleBusiness"
    : isReseller
      ? "auth.register.titleReseller"
      : "auth.register.title";
  const subtitleKey = isBusiness
    ? "auth.register.subtitleBusiness"
    : isReseller
      ? "auth.register.subtitleReseller"
      : "auth.register.subtitleConsumer";

  const canonical =
    isBusiness ? ROUTES.authRegisterBusiness : isReseller ? ROUTES.authRegisterReseller : ROUTES.authRegister;

  return (
    <Layout>
      <SeoHead
        title={t("seo.register.title")}
        description={t("seo.register.description")}
        canonicalPath={canonical}
      />
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-[hsl(var(--brand-cream))]">
        <div className="w-full max-w-md bg-card border border-border/60 rounded-3xl p-8 sm:p-10 shadow-xl">
          <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-center text-[hsl(var(--brand-navy))] mb-2">
            {t(titleKey)}
          </h1>
          <p className="text-center text-sm text-muted-foreground mb-8">{t(subtitleKey)}</p>

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
              {t("auth.register.submit")}
            </Button>
          </form>

          <div className="text-center mt-8 text-sm text-muted-foreground space-y-3">
            {isBusiness ? (
              <p>
                {t("auth.register.footerConsumerPrompt")}{" "}
                <Link href={ROUTES.authRegister} className="text-[hsl(var(--brand-royal))] font-medium hover:underline">
                  {t("auth.register.shopperLink")}
                </Link>
                {" · "}
                <Link
                  href={ROUTES.authRegisterReseller}
                  className="text-[hsl(var(--brand-royal))] font-medium hover:underline"
                >
                  {t("auth.register.partnerLink")}
                </Link>
              </p>
            ) : isReseller ? (
              <p>
                {t("auth.register.footerConsumerPrompt")}{" "}
                <Link href={ROUTES.authRegister} className="text-[hsl(var(--brand-royal))] font-medium hover:underline">
                  {t("auth.register.shopperLink")}
                </Link>
                {" · "}
                <Link
                  href={ROUTES.authRegisterBusiness}
                  className="text-[hsl(var(--brand-royal))] font-medium hover:underline"
                >
                  {t("auth.register.merchantLink")}
                </Link>
              </p>
            ) : (
              <p>
                {t("auth.register.footerBusinessPrompt")}{" "}
                <Link
                  href={ROUTES.authRegisterBusiness}
                  className="text-[hsl(var(--brand-royal))] font-medium hover:underline"
                >
                  {t("auth.register.merchantLink")}
                </Link>
                {" · "}
                <Link
                  href={ROUTES.authRegisterReseller}
                  className="text-[hsl(var(--brand-royal))] font-medium hover:underline"
                >
                  {t("auth.register.partnerLink")}
                </Link>
              </p>
            )}
            <p>
              {t("auth.register.footerLogin")}{" "}
              <Link href={ROUTES.authLogin} className="text-[hsl(var(--brand-royal))] font-medium hover:underline">
                {t("nav.login")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
