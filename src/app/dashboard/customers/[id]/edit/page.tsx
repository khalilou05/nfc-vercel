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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";

import clsx from "clsx";

import { Skeleton } from "@/components/ui/skeleton";

import { fetchApi } from "@/lib/utils";
import { Customer } from "@/types/types";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";

import React, { Fragment, useEffect, useState } from "react";
import { socialMedia } from "../../../../../socialMedia";
export default function Page() {
  const [customer, setCustomer] = useState<Customer>({} as Customer);

  const [userImage, setUserImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [userPerviewImage, setUserPerviewImage] = useState("");
  const [coverPerviewImage, setCoverPerviewImage] = useState("");
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saveloading, setSaveLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer((prv) => ({ ...prv, [e.target.name]: e.target.value }));
  };
  const handleSocialMedia = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: string,
  ) => {
    setCustomer((prv) => ({
      ...prv,
      socialMedia: {
        ...(prv.socialMedia as Record<string, string>),
        [key]: e.target.value,
      },
    }));
  };
  const handleSubmit = async () => {
    setError("");
    try {
      setSaveLoading(true);
      const formdata = new FormData();
      const { socialMedia, ...rest } = customer;
      delete rest.pdf;
      for (const [key, value] of Object.entries(rest)) {
        formdata.append(key, value as string);
      }
      formdata.append("socialMedia", JSON.stringify(socialMedia));
      if (pdfFile) formdata.append("pdf", pdfFile);

      if (userImage || coverImage) {
        formdata.append("newprofileImg", userImage ?? "");
        formdata.append("newcoverImg", coverImage ?? "");
      }

      const resp = await fetchApi(`/api/customers`, {
        method: "PUT",
        body: formdata,
      });

      if (resp.ok && resp.status === 201) {
        router.push(`/dashboard/customers`);
        return;
      }
      const result = (await resp.json().catch(() => null)) as {
        error?: string;
      } | null;
      setError(result?.error ?? "تعذر حفظ التغييرات");
    } catch (error) {
      setError("تعذر الاتصال بالخادم. حاول مجددًا.");
    } finally {
      setSaveLoading(false);
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
    if (key in (customer.socialMedia as Record<string, string>)) {
      const newobj = { ...(customer.socialMedia as Record<string, string>) };
      delete newobj[key];
      setCustomer((prv) => ({ ...prv, socialMedia: newobj }));
      return;
    }
    setCustomer((prv) => ({
      ...prv,
      socialMedia: {
        ...(prv.socialMedia as Record<string, string>),
        [key]: "",
      },
    }));
  };

  useEffect(() => {
    const getUser = async () => {
      try {
        const resp = await fetchApi(`/api/customers/${id}`);
        if (resp.status === 404) {
          router.replace("/dashboard/customers");
          return;
        }
        if (!resp.ok) throw new Error("Failed to load customer");
        const data = await resp.json<Customer>();
        const socialMedia =
          typeof data.socialMedia === "string" ?
            JSON.parse(data.socialMedia)
          : (data.socialMedia ?? {});

        setCustomer({
          ...data,
          socialMedia,
        });
      } catch (e) {
        console.log(e);
        setError("تعذر تحميل معلومات الزبون");
      } finally {
        setLoading(false);
      }
    };
    getUser();
  }, [id, router]);

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

  return (
    <div className="flex w-full justify-center pt-10 pb-10">
      <div className="w-4/5 ">
        <Card>
          <CardHeader>
            <CardTitle>تعديل معلومات الزبون</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ?
              <div className="flex flex-col gap-6">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-6 w-full"
                  />
                ))}
              </div>
            : <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="flex flex-col gap-3"
              >
                <Label htmlFor="fullName">الإسم الكامل</Label>
                <Input
                  onChange={handleChange}
                  value={customer?.fullName ?? ""}
                  required
                  autoComplete="username"
                  name="fullName"
                />
                <Label htmlFor="phoneNumber">رقم الهاتف</Label>
                <Input
                  onChange={handleChange}
                  value={customer?.phoneNumber ?? ""}
                  required
                  autoComplete="mobile tel"
                  name="phoneNumber"
                />
                <Label htmlFor="phoneNumber">البريد الإلكتروني</Label>
                <Input
                  onChange={handleChange}
                  value={customer?.email ?? ""}
                  required
                  autoComplete="email"
                  name="email"
                />
                <Label htmlFor="bio">نبذة تعريفية</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={customer.bio ?? ""}
                  onChange={(event) =>
                    setCustomer((previous) => ({
                      ...previous,
                      bio: event.target.value,
                    }))
                  }
                  rows={4}
                />

                {customer.type === "customer" ?
                  <>
                    <Label>مواقع التواصل </Label>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          className="cursor-pointer border-2 border-dashed"
                          variant={"secondary"}
                        >
                          تعديل مواقع التواصل الإجتماعي
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="h-120">
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            تعديل مواقع التواصل الإجتماعي
                          </AlertDialogTitle>
                        </AlertDialogHeader>
                        <div className="flex flex-col gap-2 p-2 w-full flex-1 overflow-y-auto">
                          {Object.keys(socialMedia).map((key) => (
                            <Label
                              key={key}
                              htmlFor={socialMedia[key].label}
                              className="flex px-2  cursor-pointer rounded justify-between border-1 border-grey has-[:where([data-state=checked])]:outline-1
                    has-[:where([data-state=checked])]:outline-black"
                            >
                              <div className="flex gap-2 items-center ">
                                {socialMedia[key].icon}
                                {key.toUpperCase()}
                              </div>

                              <Checkbox
                                onCheckedChange={() => appendSocialMedia(key)}
                                checked={
                                  key in
                                  (customer.socialMedia as Record<
                                    string,
                                    string
                                  >)
                                }
                                id={socialMedia[key].label}
                              />
                            </Label>
                          ))}
                        </div>

                        <AlertDialogFooter>
                          <AlertDialogCancel asChild>
                            <Button className="w-full cursor-pointer">
                              تم
                            </Button>
                          </AlertDialogCancel>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {customer.socialMedia &&
                      Object.entries(customer.socialMedia).map(
                        ([key, value]) => (
                          <Fragment key={key}>
                            <Label>{socialMedia[key].label}</Label>
                            <Input
                              onChange={(e) => handleSocialMedia(e, key)}
                              value={value}
                            />
                          </Fragment>
                        ),
                      )}

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
                          {pdfFile?.name ??
                            customer.pdf?.split("/").pop() ??
                            "اضغط لاختيار ملف PDF"}
                        </span>
                      </div>
                    </Label>

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
                      : <Image
                          height={200}
                          width={200}
                          src={`https://media.twenty-print.com/${customer.coverImg}`}
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      }
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
                      : <Image
                          height={200}
                          width={200}
                          src={`https://media.twenty-print.com/${customer.profileImg}`}
                          style={{ objectFit: "cover" }}
                          alt=""
                        />
                      }
                    </Label>
                  </>
                : <>
                    <Label htmlFor="extUrl">الرابط</Label>
                    <Input
                      id="extUrl"
                      onChange={handleChange}
                      name="absoluteUrl"
                      value={customer.absoluteUrl ?? ""}
                    />
                  </>
                }

                <div></div>
                <Button
                  disabled={saveloading}
                  style={{ cursor: "pointer" }}
                >
                  حفض
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
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
