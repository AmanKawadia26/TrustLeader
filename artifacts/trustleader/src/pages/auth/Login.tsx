import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { Shield } from "lucide-react";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    await login(email, password);
    setLocation("/dashboard/consumer");
  };

  return (
    <Layout>
      <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 bg-slate-50 dark:bg-slate-950">
        <div className="w-full max-w-md bg-card border rounded-3xl p-8 sm:p-10 shadow-2xl shadow-black/5">
          <div className="flex justify-center mb-6">
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-center mb-8">{t('auth.login.title')}</h1>

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

            <Button type="submit" className="w-full h-12 text-base rounded-xl font-semibold">
              {t('auth.login.submit')}
            </Button>
          </form>

          <p className="text-center mt-8 text-sm text-muted-foreground">
            Don't have an account? <Link href="/auth/register" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
