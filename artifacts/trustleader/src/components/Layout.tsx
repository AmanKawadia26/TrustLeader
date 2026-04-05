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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const [loc] = useLocation();
  const active = loc === href || (href !== "/" && loc.startsWith(href));
  return (
    <Link
      href={href}
      className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
        active ? "bg-white/15 text-white" : "text-white/90 hover:bg-white/10"
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

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center shrink-0 min-w-0 rounded-lg pr-1 -ml-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
            title="TrustLeader"
          >
            <img
              src={`${import.meta.env.BASE_URL}logo-on-dark.svg`}
              alt="TrustLeader"
              width={175}
              height={36}
              className="h-8 w-auto sm:h-9 object-contain object-left"
              decoding="async"
            />
          </Link>

          <div className="order-last sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-md sm:mx-4">
            <Link
              href="/search"
              className="flex w-full items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm text-neutral-500 shadow-sm border border-neutral-200 hover:border-neutral-300 transition-colors"
            >
              <Search className="w-4 h-4 shrink-0 text-neutral-400" />
              <span className="truncate">{t("nav.searchPlaceholder")}</span>
            </Link>
          </div>

          <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto [scrollbar-width:none] order-3 sm:order-none">
            <NavLink href="/categories">{t("nav.categories")}</NavLink>
            <NavLink href="/about">{t("nav.about")}</NavLink>
            <NavLink href="/search">{t("nav.writeReview")}</NavLink>
          </nav>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white hidden sm:inline-flex">
                    {t("nav.login")}
                  </Button>
                </Link>
                <Link href="/auth/register/business">
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm px-3 sm:px-4 font-semibold">
                    {t("nav.forBusinesses")}
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="rounded-full bg-white text-neutral-900 hover:bg-neutral-100 text-xs sm:text-sm px-3 sm:px-4 font-semibold">
                    {t("nav.register")}
                  </Button>
                </Link>
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-white/20 text-white hover:bg-white/10">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-white/10 text-white font-semibold">
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
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-black text-white mt-auto border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <img
                src={`${import.meta.env.BASE_URL}logo-on-dark.svg`}
                alt="TrustLeader"
                width={175}
                height={36}
                className="h-9 w-auto object-contain object-left"
                decoding="async"
              />
            </div>
            <p className="text-sm text-neutral-400 leading-relaxed">{t("footer.tagline")}</p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">{t("footer.forConsumers")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/search" className="text-neutral-200 hover:underline">
                  {t("footer.searchReviews")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-neutral-200 hover:underline">
                  {t("footer.browseCategories")}
                </Link>
              </li>
              <li>
                <Link href="/auth/register" className="text-neutral-200 hover:underline">
                  {t("footer.writeReview")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">{t("footer.forBusinesses")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dashboard/company" className="text-neutral-200 hover:underline">
                  {t("footer.claimProfile")}
                </Link>
              </li>
              <li>
                <Link href="/auth/register/business" className="text-neutral-200 hover:underline">
                  {t("footer.businessSignup")}
                </Link>
              </li>
              <li>
                <Link href="/developers" className="text-neutral-200 hover:underline">
                  {t("footer.apiAccess")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-wider uppercase text-neutral-500 mb-3">{t("footer.company")}</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-neutral-200 hover:underline">
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-neutral-200 hover:underline">
                  {t("footer.trustSafety")}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-neutral-200 hover:underline">
                  {t("footer.privacy")}
                </Link>
                {" · "}
                <Link href="/terms" className="text-neutral-200 hover:underline">
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <CountrySelect label={t("footer.chooseCountry")} />
          </div>
        </div>
        <div className="border-t border-neutral-800">
          <p className="text-center text-xs text-neutral-500 py-4 px-4">{t("footer.copyright")}</p>
        </div>
      </footer>
    </div>
  );
}
