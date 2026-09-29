"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, fetchApi } from "@/lib/utils";

import { useState } from "react";
import { Spinner } from "./ui/spinner";

interface Prop extends React.ComponentProps<"div"> {
  className?: string;
}

export function PasswordChangeForm({
  className,

  ...props
}: Prop) {
  const [userData, setUserData] = useState({
    email: "",
    newpassword: "",
    confirmpassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserData((prv) => ({ ...prv, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    if (userData.newpassword !== userData.confirmpassword) {
      setError("كلمة المرور غير متطابقة");
      return;
    }
    try {
      setLoading(true);
      const resp = await fetchApi("/api/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });
      if (resp.ok) {
        setSuccess("تم تغير كلمة المرور بنجاح");
        return;
      }

      const result = (await resp.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(result?.error ?? "تعذر تحديث كلمة المرور");
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn("flex flex-col gap-6", className)}
      {...props}
    >
      <Card>
        <CardHeader>
          <CardTitle>تغيير البريد أو كلمة المرور</CardTitle>
          <CardDescription>أدخل المعلومات الجديدة</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  onChange={handleChange}
                  value={userData.email}
                  id="email"
                  name="email"
                  type="email"
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="newpassword">كلمة المرور</Label>
                <Input
                  onChange={handleChange}
                  value={userData.newpassword}
                  id="newpassword"
                  name="newpassword"
                  type="password"
                  minLength={8}
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="confirmpassword">تأكيد كلمة المرور</Label>
                </div>
                <Input
                  onChange={handleChange}
                  value={userData.confirmpassword}
                  name="confirmpassword"
                  id="confirmpassword"
                  type="password"
                  minLength={8}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  disabled={isLoading}
                  style={{ cursor: "pointer" }}
                  type="submit"
                  className="w-full"
                >
                  {isLoading ?
                    <Spinner className="size-6" />
                  : "حفض"}
                </Button>
                {error && (
                  <span className="text-red-500 text-center">{error}</span>
                )}
                {success && (
                  <span className="text-green-500 text-center">{success}</span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
