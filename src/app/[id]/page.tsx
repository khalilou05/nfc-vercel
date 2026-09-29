import SaveContact from "@/components/SaveContact";

import Gmail from "@/icons/Gmail";
import Phone from "@/icons/Phone";
import { fetchApi } from "@/lib/utils";
import type { Customer } from "@/types/types";

import type { Viewport } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { socialMedia } from "../../socialMedia";

export const viewport: Viewport = {
  themeColor: "#004f9f",
};

// export const revalidate = 60;

// export async function generateStaticParams() {
//   const posts = await fetch("https://api.vercel.app/blog").then((res) =>
//     res.json(),
//   );
//   return posts.map((post) => ({
//     id: String(post.id),
//   }));
// }

export const revalidate = 60;

export default async function Page({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const resp = await fetchApi(`/customers/${id}`);
  if (resp.status === 404) notFound();
  if (!resp.ok) throw new Error("Failed to load customer profile");

  const customer = await resp.json<Customer & { redirect: string }>();

  if (customer.redirect) {
    redirect(customer.redirect);
  }

  let socialLinks: Record<string, string> = {};
  try {
    const parsedSocialMedia =
      typeof customer.socialMedia === "string" ?
        JSON.parse(customer.socialMedia)
      : customer.socialMedia;
    if (parsedSocialMedia && typeof parsedSocialMedia === "object") {
      socialLinks = parsedSocialMedia as Record<string, string>;
    }
  } catch {
    socialLinks = {};
  }

  return (
    <div className="flex flex-col h-dvh w-dvw">
      <div className="h-[50%] relative shrink-0">
        <Image
          src={`https://media.twenty-print.com/${customer.coverImg}`}
          fill
          style={{ objectFit: "cover" }}
          alt="cover"
        />
        <div className="absolute h-25 w-25 left-[50%] top-[100%] translate-[-50%] border-3 border-[#004f9f] rounded-full overflow-hidden">
          <Image
            fill
            src={`https://media.twenty-print.com/${customer.profileImg}`}
            style={{ objectFit: "cover" }}
            alt=""
          />
        </div>
      </div>
      <div className="h-full flex flex-col gap-8 bg-linear-to-b from-[#004f9f] to-transparent pt-16">
        <div className="flex flex-col justify-center w-full items-center gap-3">
          <h1
            className="text-2xl text-center text-gray-100 font-semibold
"
          >
            {customer.fullName}
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <SaveContact customer={customer} />
            {customer.pdf && (
              <Button
                asChild
                className="bg-black text-white hover:bg-black/85"
              >
                <a
                  href={`https://media.twenty-print.com/${customer.pdf}`}
                  download
                >
                  <Download />
                  تحميل ملف PDF
                </a>
              </Button>
            )}
          </div>
          {customer.bio && (
            <p className="max-w-[80%] whitespace-pre-wrap text-center text-base text-black">
              {customer.bio}
            </p>
          )}
        </div>

        <div className="flex items-center flex-col">
          <div className="w-[80%] grid grid-cols-2 place-items-center gap-14 [&>*]:scale-[2]">
            <Link href={`tel:${customer.phoneNumber}`}>
              <Phone />
            </Link>
            <Link href={`mailto:${customer.email}`}>
              <Gmail />
            </Link>
            {Object.entries(socialLinks).map(([key, value]) => {
              const platform = socialMedia[key];
              if (!platform || typeof value !== "string") return null;

              let url: URL;
              try {
                url = new URL(value);
              } catch {
                return null;
              }
              if (url.protocol !== "https:" && url.protocol !== "http:") {
                return null;
              }

              return (
                <Link
                  href={url.toString()}
                  key={key}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {platform.icon}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="mt-auto flex justify-center">
          <Link
            target="_blank"
            href={"https://www.facebook.com/share/1BLRQguH2s/"}
          >
            <Image
              height={60}
              width={60}
              alt=""
              src={"/logo.svg"}
            />
          </Link>
          POWRED BY{" "}
        </div>
      </div>
    </div>
  );
}
