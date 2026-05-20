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
import { User } from "lucide-react";

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
    socialMedia: {},
  });
  const [userImage, setUserImage] = useState<File | null>(null);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [userPerviewImage, setUserPerviewImage] = useState("");
  const [coverPerviewImage, setCoverPerviewImage] = useState("");

  const [isLoading, setLoading] = useState(false);

  const router = useRouter();
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

      const resp = await fetchApi(`/api/customers`, {
        method: "POST",
        body: formdata,
      });
      const { userId } = await resp.json<{ userId: number }>();

      if (resp.status === 201) {
        setTimeout(() => {
          router.push(`/dashboard/customers/${userId}`);
        }, 1000);
      }
    } catch (error) {
      console.log(error);
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
    setData((prv) => ({
      ...prv,
      socialMedia: {
        ...(prv.socialMedia as Record<string, string>),
        [key]: "",
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
                onChange={handleChange}
                required
                name="email"
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
                                (data.socialMedia as Record<string, string>)
                              }
                              id={socialMedia[key].label}
                            />
                          </Label>
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
                          value={key === "whatsapp" ? "https://wa.me/" : ""}
                          name={key}
                          required
                          onChange={handleSocialMedia}
                          id={key}
                        />
                      </Fragment>
                    ))}

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
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
