"use client";

import { Chrome, Github, Lock, Mail, User } from "lucide-react";
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
import { Checkbox } from "@/components/shadcn/ui/checkbox";
import { Input } from "@/components/shadcn/ui/input";
import { Label } from "@/components/shadcn/ui/label";
import { Separator } from "@/components/shadcn/ui/separator";

export default function RegisterPage() {
  const t = useTranslations("auth.register");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error(t("error.title"), {
        description: t("error.passwordMismatch"),
      });
      setLoading(false);
      return;
    }

    // Validate terms acceptance
    if (!acceptedTerms) {
      toast.error(t("error.title"), {
        description: t("error.termsRequired"),
      });
      setLoading(false);
      return;
    }

    try {
      // TODO: Implement Better Auth registration
      // const response = await authService.register({
      //   name: formData.name,
      //   email: formData.email,
      //   password: formData.password,
      // });
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

  const handleSocialRegister = async (_provider: "github" | "google") => {
    try {
      // TODO: Implement Better Auth social registration
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
              <Label htmlFor="name">{t("form.name.label")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder={t("form.name.placeholder")}
                  className="pl-9"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

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
              <Label htmlFor="password">{t("form.password.label")}</Label>
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
                  minLength={8}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t("form.confirmPassword.label")}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder={t("form.confirmPassword.placeholder")}
                  className="pl-9"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  minLength={8}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) =>
                  setAcceptedTerms(checked === true)
                }
              />
              <label
                htmlFor="terms"
                className="text-sm text-muted-foreground leading-none"
              >
                {t("form.terms.label")}{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  {t("form.terms.link")}
                </Link>{" "}
                {t("form.terms.and")}{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  {t("form.terms.privacy")}
                </Link>
              </label>
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
              onClick={() => handleSocialRegister("github")}
              disabled={loading}
            >
              <Github className="mr-2 h-4 w-4" />
              {t("social.github")}
            </Button>
            <Button
              variant="outline"
              onClick={() => handleSocialRegister("google")}
              disabled={loading}
            >
              <Chrome className="mr-2 h-4 w-4" />
              {t("social.google")}
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            {t("footer.haveAccount")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("footer.signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
