"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText, User } from "lucide-react";

import clsx from "clsx";
import { socialMedia } from "../../socialMedia";

import { Spinner } from "@/components/ui/spinner";
import IMG from "@/icons/IMG";
import { fetchApi } from "@/lib/utils";
import type { Customer } from "@/types/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { Fragment, useEffect, useState } from "react";
export default function Page() {
  const [data, setData] = useState<Customer>({
    fullName: "",
    phoneNumber: "",
    type: "customer",
    absoluteUrl: "",
    email: "",
    bio: "",
    socialMedia: {},
  });
  const [userImage, setUserImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [userPerviewImage, setUserPerviewImage] = useState("");
  const [coverPerviewImage, setCoverPerviewImage] = useState("");

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();
  const hasUnsavedChanges = Boolean(
    data.fullName ||
    data.phoneNumber ||
    data.email ||
    data.bio ||
    data.absoluteUrl ||
    data.type !== "customer" ||
    Object.keys(data.socialMedia ?? {}).length ||
    userImage ||
    coverImage ||
    pdfFile,
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!hasUnsavedChanges || isLoading) return;
      event.preventDefault();
      event.returnValue = "";
    };

    const handleNavigation = (event: MouseEvent) => {
      if (
        !hasUnsavedChanges ||
        isLoading ||
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest("a[href]");
      if (
        !(link instanceof HTMLAnchorElement) ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      ) {
        return;
      }

      const destination = new URL(link.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      ) {
        return;
      }

      if (!window.confirm("لديك تغييرات غير محفوظة. هل تريد مغادرة الصفحة؟")) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("click", handleNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("click", handleNavigation, true);
    };
  }, [hasUnsavedChanges, isLoading]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prv) => ({ ...prv, [e.target.name]: e.target.value }));
  };
  const handleSocialMedia = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prv) => ({
      ...prv,
      socialMedia: {
        ...(prv.socialMedia as Record<string, string>),
        [e.target.name]: e.target.value,
      },
    }));
  };
  const handleSubmit = async () => {
    setError("");
    try {
      setLoading(true);
      const formdata = new FormData();
      const { socialMedia, ...rest } = data;
      for (const [key, value] of Object.entries(rest)) {
        formdata.append(key, value as string);
      }
      formdata.append("socialMedia", JSON.stringify(socialMedia));
      if (userImage && coverImage) {
        formdata.append("profileImg", userImage);
        formdata.append("coverImg", coverImage);
      }
      if (pdfFile) formdata.append("pdf", pdfFile);

      const resp = await fetchApi(`/api/customers`, {
        method: "POST",
        body: formdata,
      });
      if (!resp.ok) {
        const result = (await resp.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(result?.error ?? "تعذر إضافة الزبون");
        return;
      }
      const { userId } = await resp.json<{ userId: number }>();

      router.push(`/dashboard/customers/${userId}`);
    } catch {
      setError("تعذر الاتصال بالخادم. حاول مجددًا.");
    } finally {
      setLoading(false);
    }
  };

  const generatePervImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target.id === "profile") {
      setUserImage(file);
      setUserPerviewImage(URL.createObjectURL(file));
    } else {
      setCoverImage(file);
      setCoverPerviewImage(URL.createObjectURL(file));
    }
  };

  const appendSocialMedia = (key: string) => {
    if (key in (data.socialMedia as Record<string, string>)) {
      const newobj = { ...(data.socialMedia as Record<string, string>) };
      delete newobj[key];
      setData((prv) => ({ ...prv, socialMedia: newobj }));
      return;
    }
    const initialValue = key === "whatsapp" ? "https://wa.me/" : "";
    setData((prv) => ({
      ...prv,
      socialMedia: {
        ...(prv.socialMedia as Record<string, string>),
        [key]: initialValue,
      },
    }));
  };

  const handleCustmTypeChange = (value: typeof data.type) => {
    setData((prv) => ({ ...prv, socialMedia: {}, type: value }));
  };

  useEffect(() => {
    return () => {
      if (userPerviewImage) URL.revokeObjectURL(userPerviewImage);
    };
  }, [userPerviewImage]);
  useEffect(() => {
    return () => {
      if (coverPerviewImage) URL.revokeObjectURL(coverPerviewImage);
    };
  }, [coverPerviewImage]);
  useEffect(() => {
    if (!pdfFile) {
      setPdfPreviewUrl("");
      return;
    }

    const previewUrl = URL.createObjectURL(pdfFile);
    setPdfPreviewUrl(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [pdfFile]);

  return (
    <div className="flex w-full justify-center pt-10 pb-10">
      <div className="w-4/5 ">
        <Card>
          <CardHeader>
            <CardTitle>إضافة زبون</CardTitle>
            <CardDescription>يرجي إدخال معلومات الزبون</CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="flex flex-col gap-3"
            >
              <Label htmlFor="fullName">الإسم الكامل</Label>
              <Input
                onChange={handleChange}
                required
                autoComplete="username"
                name="fullName"
              />
              <Label htmlFor="fullName">رقم الهاتف</Label>
              <Input
                onChange={handleChange}
                required
                autoComplete="mobile tel"
                name="phoneNumber"
              />
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                onChange={handleChange}
                value={data.email}
                required
                name="email"
              />
              <Label htmlFor="bio">نبذة تعريفية</Label>
              <Textarea
                id="bio"
                name="bio"
                value={data.bio ?? ""}
                onChange={(e) =>
                  setData((prv) => ({ ...prv, bio: e.target.value }))
                }
                rows={4}
              />
              <div className="flex justify-between gap-3">
                <Label
                  className="flex hover:bg-accent/50 has-checked:border-black justify-between border-1 border-gray rounded p-4 w-full cursor-pointer"
                  htmlFor="customer"
                >
                  زبون
                  <Checkbox
                    checked={data.type === "customer"}
                    onCheckedChange={() => handleCustmTypeChange("customer")}
                    id="customer"
                  />
                </Label>
                <Label
                  className="flex hover:bg-accent/50 has-checked:border-black justify-between border-1 border-gray rounded p-4 w-full cursor-pointer"
                  htmlFor="page"
                >
                  صفحة
                  <Checkbox
                    checked={data.type === "page"}
                    onCheckedChange={() => handleCustmTypeChange("page")}
                    id="page"
                  />
                </Label>
              </div>
              {data.type === "customer" ?
                <>
                  <Label>مواقع التواصل </Label>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        className="cursor-pointer border-2 border-dashed"
                        variant={"secondary"}
                      >
                        إضافة مواقع التواصل الإجتماعي
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="h-120">
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          إختيار مواقع التواصل الإجتماعي
                        </AlertDialogTitle>
                      </AlertDialogHeader>
                      <div className="grid grid-cols-4 content-start gap-2 p-2 w-full flex-1 overflow-y-auto">
                        {Object.keys(socialMedia).map((key) => (
                          <button
                            key={key}
                            type="button"
                            aria-pressed={
                              key in
                              (data.socialMedia as Record<string, string>)
                            }
                            onClick={() => appendSocialMedia(key)}
                            className={clsx(
                              "flex min-w-0 flex-col items-center gap-2 rounded border-2 p-2 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                              (
                                key in
                                  (data.socialMedia as Record<string, string>)
                              ) ?
                                "border-primary"
                              : "border-grey",
                            )}
                          >
                            <div className="flex min-w-0 flex-col items-center gap-1">
                              {socialMedia[key].icon}
                              <span className="break-all text-xs leading-tight">
                                {key.toUpperCase()}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel asChild>
                          <Button className="w-full cursor-pointer">تم</Button>
                        </AlertDialogCancel>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {data.socialMedia &&
                    Object.keys(data.socialMedia).map((key) => (
                      <Fragment key={key}>
                        <Label htmlFor={key}>{socialMedia[key].label}</Label>
                        <Input
                          value={
                            (data.socialMedia as Record<string, string>)[key] ??
                            ""
                          }
                          name={key}
                          required
                          onChange={handleSocialMedia}
                          id={key}
                        />
                      </Fragment>
                    ))}

                  <Label>ملف PDF</Label>
                  <Label
                    htmlFor="pdf"
                    className="relative flex h-auto w-full cursor-pointer justify-center rounded-sm border-2 border-dashed p-4"
                  >
                    <Input
                      id="pdf"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(event) =>
                        setPdfFile(event.target.files?.[0] ?? null)
                      }
                      className="pointer-events-none absolute opacity-0"
                    />
                    <div className="flex min-w-0 flex-col items-center gap-2 text-center">
                      <FileText className="size-10 text-muted-foreground" />
                      <span className="break-all text-sm">
                        {pdfFile?.name ?? "اضغط لاختيار ملف PDF"}
                      </span>
                    </div>
                  </Label>
                  {pdfPreviewUrl && (
                    <iframe
                      title="معاينة ملف PDF"
                      src={pdfPreviewUrl}
                      className="h-[480px] w-full rounded-md border"
                    />
                  )}

                  <Label>صورة الغلاف</Label>

                  <Label
                    htmlFor="cover"
                    className={clsx(
                      "flex p-4 relative content-center justify-center cursor-pointer rounded-sm w-full h-auto border-2 border-dashed",
                    )}
                  >
                    <Input
                      onChange={(e) => {
                        generatePervImg(e);
                      }}
                      id="cover"
                      type="file"
                      required
                      style={{
                        opacity: 0,
                        position: "absolute",
                        pointerEvents: "none",
                      }}
                    />
                    {coverImage ?
                      <Image
                        height={200}
                        width={200}
                        src={coverPerviewImage}
                        style={{ objectFit: "cover" }}
                        alt=""
                      />
                    : <IMG className="w-20" />}
                  </Label>
                  <Label>الصورة الشخصية</Label>

                  <Label
                    htmlFor="profile"
                    className={clsx(
                      "flex p-4 content-center relative justify-center cursor-pointer rounded-sm w-full h-auto border-2 border-dashed",
                    )}
                  >
                    <Input
                      onChange={(e) => {
                        generatePervImg(e);
                      }}
                      id="profile"
                      type="file"
                      required
                      style={{
                        opacity: 0,
                        position: "absolute",
                        pointerEvents: "none",
                      }}
                    />
                    {userImage ?
                      <Image
                        height={200}
                        width={200}
                        src={userPerviewImage}
                        style={{ objectFit: "cover" }}
                        alt=""
                      />
                    : <User style={{ scale: 2, stroke: "var(--border)" }} />}
                  </Label>
                </>
              : <>
                  <Label htmlFor="absUrl">رابط الصفحة</Label>
                  <Input
                    id="absUrl"
                    placeholder="https://example.com"
                    onChange={(e) =>
                      setData((prv) => ({
                        ...prv,
                        absoluteUrl: e.target.value,
                      }))
                    }
                    value={data.absoluteUrl}
                  />
                </>
              }
              <div>&nbsp;</div>
              <Button
                disabled={isLoading}
                style={{ cursor: "pointer" }}
              >
                {isLoading ?
                  <Spinner className="size-6" />
                : "إضافة"}
              </Button>
              {error && (
                <p
                  role="alert"
                  className="text-center text-sm text-red-600"
                >
                  {error}
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
