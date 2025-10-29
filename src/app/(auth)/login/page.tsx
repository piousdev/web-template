"use client";

import { Chrome, Github, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/button";
import { Button } from "@/components/shadcn/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/shadcn/ui/card";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Separator } from "@/components/shadcn/ui/separator";

export default function LoginPage() {
  const t = useTranslations("auth.login");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement Better Auth login
      // const response = await authService.login(formData);
      // if (response.success) {
      //   router.push('/dashboard');
      // }

      toast.success(t("success.title"), {
        description: t("success.description"),
      });

      // Temporary redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (_error) {
      toast.error(t("error.title"), {
        description: t("error.description"),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (_provider: "github" | "google") => {
    try {
      // TODO: Implement Better Auth social login
      // await authService.socialLogin(provider);
      toast.success(t("social.pending.title"), {
        description: t("social.pending.description"),
      });
    } catch (_error) {
      toast.error(t("error.title"), {
        description: t("error.description"),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("form.email.label")}</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("form.email.placeholder")}
                  className="pl-9"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("form.password.label")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  {t("form.password.forgot")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={t("form.password.placeholder")}
                  className="pl-9"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <LoadingButton
              type="submit"
              className="w-full"
              loading={loading}
              loadingText={t("form.submit.loading")}
            >
              {t("form.submit.default")}
            </LoadingButton>
          </form>

          <div className="relative my-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
              {t("social.separator")}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("github")}
              disabled={loading}
            >
              <Github className="mr-2 h-4 w-4" />
              {t("social.github")}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialLogin("google")}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {t("social.google")}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            {t("footer.noAccount")}{" "}
            <Link href="/register" className="text-primary hover:underline">
              {t("footer.signUp")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
