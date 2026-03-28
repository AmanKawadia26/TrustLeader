import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuth();
  const { t } = useTranslation();

  const getDashboardPath = () => {
    if (!user) return "/";
    if (user.role === 'company') return "/dashboard/company";
    if (user.role === 'reseller') return "/dashboard/reseller";
    return "/dashboard/consumer";
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="bg-primary/10 p-2 rounded-xl group-hover:bg-primary/20 transition-colors">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Trustleader<span className="text-primary">.org</span></span>
          </Link>

          <nav className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost" className="hidden sm:flex">{t('nav.login')}</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>{t('nav.register')}</Button>
                </Link>
              </>
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full border shadow-sm">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
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
                      {t('nav.dashboard')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-red-600 cursor-pointer">
                    {t('nav.logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t bg-muted/30 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <span className="font-display font-semibold text-muted-foreground">Trustleader.org</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Trustleader.org. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
