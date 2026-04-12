import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { CountrySelect } from "@/components/CountrySelect";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ROUTES } from "@/lib/routes";

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [loc] = useLocation();
  const active = loc === href || (href !== "/" && loc.startsWith(href));
  return (
    <Link
      href={href}
      className={`text-xs sm:text-sm font-medium px-1.5 sm:px-2 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap ${
        active
          ? "bg-[hsl(var(--brand-royal))]/12 text-[hsl(var(--brand-navy))]"
          : "text-[hsl(var(--brand-navy))]/90 hover:bg-[hsl(var(--brand-turquoise))]/10 hover:text-[hsl(var(--brand-navy))]"
      }`}
    >
      {children}
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === "company") return "/dashboard/company";
    if (user.role === "reseller") return "/dashboard/reseller";
    return "/dashboard/consumer";
  };

  const logoSrc = `${import.meta.env.BASE_URL}my-protector-logo.png`;

  return (
    <div className="min-h-screen flex min-w-0 flex-col overflow-x-clip font-sans bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full max-w-full overflow-visible border-b border-border/80 bg-white/95 backdrop-blur-md text-[hsl(var(--brand-navy))] shadow-sm">
        <div className="max-w-7xl mx-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 py-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3">
          <Link
            href="/"
            className="order-1 shrink-0 flex items-center gap-2 rounded-lg -ml-1 pr-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[hsl(var(--brand-royal))]/50 min-w-0"
            title="My Protector"
          >
            <img
              src={logoSrc}
              alt=""
              width={332}
              height={290}
              className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 object-contain"
              decoding="async"
            />
            <span className="font-bold text-[hsl(var(--brand-navy))] text-base sm:text-lg tracking-tight truncate">
              My Protector
            </span>
          </Link>

          <div className="order-2 flex w-full min-w-0 flex-col gap-3 lg:flex-1 lg:flex-row lg:items-center lg:gap-3">
            <div className="order-3 w-full min-w-0 lg:order-none lg:max-w-md lg:flex-shrink-0">
              <Link
                href={ROUTES.exploreListings}
                className="flex w-full min-w-0 items-center gap-1.5 sm:gap-2 rounded-full bg-[hsl(var(--brand-cream))] px-2.5 sm:px-3 py-2 sm:py-2.5 text-sm text-muted-foreground shadow-inner border border-border/80 hover:border-[hsl(var(--brand-royal))]/35 transition-colors"
              >
                <Search className="w-4 h-4 shrink-0 text-[hsl(var(--brand-royal))]/70" />
                <span className="truncate">{t("nav.searchPlaceholder")}</span>
              </Link>
            </div>

            <div className="order-2 flex w-full min-w-0 flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:justify-start lg:order-none lg:flex-1 lg:flex-nowrap lg:justify-start lg:gap-x-2 lg:py-0.5 lg:min-w-0">
            <nav className="flex flex-wrap items-center justify-center gap-x-0.5 gap-y-1 sm:gap-x-1 sm:justify-start lg:flex-nowrap">
              <NavLink href={ROUTES.browseSectors}>{t("nav.browseSectors")}</NavLink>
              <NavLink href={ROUTES.trustSignals}>{t("nav.trafficSignals")}</NavLink>
              <NavLink href={ROUTES.exploreListings}>{t("nav.documentVisit")}</NavLink>
            </nav>

            <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 shrink-0 border-l border-border/70 pl-2 sm:pl-3 ml-0.5">
            {!isAuthenticated ? (
              <>
                <Link href={ROUTES.authLogin}>
                  <Button
                    variant="ghost"
                    className="text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-turquoise))]/12 hover:text-[hsl(var(--brand-navy))] whitespace-nowrap px-1.5 sm:px-2 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href={ROUTES.authRegisterReseller}>
                  <Button
                    variant="outline"
                    className="rounded-full border-border/80 text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-turquoise))]/12 whitespace-nowrap px-2 sm:px-2.5 h-8 sm:h-9 text-xs sm:text-sm"
                  >
                    {t("nav.resellers")}
                  </Button>
                </Link>
                <Link href={ROUTES.authRegisterBusiness}>
                  <Button className="rounded-full bg-[hsl(var(--brand-royal))] hover:bg-[hsl(var(--brand-royal))]/90 text-white text-xs sm:text-sm px-2 sm:px-3 font-semibold shadow-sm whitespace-nowrap h-8 sm:h-9">
                    {t("nav.merchantAccounts")}
                  </Button>
                </Link>
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full border border-border text-[hsl(var(--brand-navy))] hover:bg-[hsl(var(--brand-turquoise))]/12"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-[hsl(var(--brand-royal))]/12 text-[hsl(var(--brand-navy))] font-semibold">
                        {user.email.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="p-2 border-b mb-1">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardPath()} className="cursor-pointer w-full">
                      {t("nav.dashboard")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    {t("nav.logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-w-0 overflow-visible">{children}</main>

      <footer className="bg-[hsl(var(--brand-cream))] text-[hsl(var(--brand-navy))] mt-auto border-t border-border/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-2 min-w-0">
              <img
                src={logoSrc}
                alt=""
                width={332}
                height={290}
                className="h-10 w-10 shrink-0 object-contain"
                decoding="async"
              />
              <span className="font-bold text-[hsl(var(--brand-navy))] text-lg truncate">My Protector</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">{t("footer.forConsumers")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.exploreListings} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.exploreListings")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.browseSectors} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.browseSectors")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.authRegister} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.publishInsight")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.trustSignals} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("nav.trafficSignals")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">{t("footer.forBusinesses")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/company" className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.claimProfile")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.authRegisterBusiness} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.merchantOnboarding")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.developers} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.apiAccess")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-muted-foreground mb-3">{t("footer.company")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.about} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.about} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.trustSafety")}
                </Link>
              </li>
              <li>
                <Link href={ROUTES.privacy} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.privacy")}
                </Link>
                {" · "}
                <Link href={ROUTES.terms} className="text-[hsl(var(--brand-navy))]/90 hover:text-[hsl(var(--brand-turquoise))] hover:underline">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <CountrySelect label={t("footer.chooseCountry")} />
          </div>
        </div>
        <div className="border-t border-border/60 bg-white/50">
          <p className="text-center text-xs text-muted-foreground py-4 px-4">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
