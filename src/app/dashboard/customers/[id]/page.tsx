"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/utils";
import type { Customer } from "@/types/types";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Fragment, use, useEffect, useRef, useState } from "react";
import { socialMedia } from "../../../../socialMedia";
export default function Page({ params }: { params: Promise<{ id: number }> }) {
  const [customer, setCustomer] = useState<Customer>();
  const [isModalOpen, setModalOpen] = useState(false);

  const { id } = use(params);
  const qrRef = useRef<SVGSVGElement>(null);
  const router = useRouter();

  const downloadQRCode = () => {
    // Get the root QR SVG (not the logo)
    const svg = qrRef.current?.closest("svg") || qrRef.current;
    if (!svg) return;

    const svgContent = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgContent], {
      type: "image/svg+xml;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "qrcode.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  const writeNFC = async () => {
    try {
      // @ts-expect-error qsdqsd
      const nfc = new NDEFReader();

      await nfc.write({
        records: [
          {
            recordType: "url",
            data: `https://twenty-print.com/${id}`,
          },
        ],
      });
      setModalOpen(false);
    } catch (e) {
      console.log(e);
    }
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
      }
    };
    getUser();
  }, [id, router]);

  useEffect(() => {
    if (!qrRef.current) return;
    const img = qrRef.current.querySelector("image") as SVGImageElement;
    if (!img) return;
    const width = img.getAttribute("width");
    const height = img.getAttribute("height");
    const x = img.getAttribute("x");
    const y = img.getAttribute("y");
    img.remove();
    const parser = new DOMParser();
    const svgStr = `

  <svg width="${width}" height="${height}" x="${x}" y="${y}" viewBox="0 0 40 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  
  <path d="M15.1496 25.3797C15.2687 33.2108 21.7895 39.5542 29.674 39.3698C33.5209 39.2805 37.3381 37.3644 40 34.389V45.5466H0V39.3757C3.06089 39.3757 6.11582 39.3757 9.17076 39.3757H21.2357C21.4203 39.3757 21.6049 39.3757 21.7895 39.3698C22.0158 39.3579 22.1587 39.2448 22.1825 39.0008C22.2242 38.4891 22.2063 38.0487 21.6525 37.7333C20.2054 36.9062 18.9728 35.8053 17.9068 34.5318C17.6507 34.2224 17.347 34.1629 16.9778 34.1629C14.3874 34.1689 11.8029 34.1629 9.2184 34.1629C9.08143 34.1629 8.95042 34.1689 8.81941 34.1629C8.6884 34.151 8.51571 34.2105 8.4502 34.0796C8.36683 33.9308 8.54548 33.8535 8.6229 33.7583C8.72413 33.6452 8.83132 33.544 8.93256 33.431C10.7429 31.497 12.5532 29.5571 14.3636 27.6171C14.5601 27.4089 14.6553 27.1946 14.6196 26.9031C14.5065 25.9391 14.5184 24.9691 14.572 24.0051C14.6792 22.0414 15.2389 20.2026 16.1382 18.459C17.4542 15.9062 19.3598 13.9008 21.855 12.4607C22.1825 12.2644 22.3195 12.0263 22.2718 11.6455C21.7418 7.62878 19.5802 4.80816 15.8464 3.33239C12.4043 1.97563 8.84919 1.98753 5.37145 3.26693C2.98347 4.14763 1.19101 5.68291 0 7.8073V0H40V15.6801C37.3441 12.7166 33.4495 10.8362 29.0606 10.9314C21.3845 11.098 15.0305 17.4355 15.1496 25.3797Z" fill="#004F9F"/>
  <path d="M15.8344 15.7634C14.6554 18.3519 12.9641 20.6072 11.1478 22.7673C7.56886 27.028 3.72785 31.0447 0 35.1626V15.7396C1.14337 15.7336 2.29865 15.7336 3.44797 15.7455C3.90651 15.7515 4.06729 15.5551 4.04943 15.1147C4.02561 14.3471 4.04347 13.5795 4.16257 12.8178C4.46628 10.8005 5.3774 9.14026 7.27706 8.27146C9.39705 7.30744 11.5826 7.41456 13.6609 8.46783C15.1198 9.20571 16.0131 10.4375 16.3525 12.062C16.6205 13.3652 16.3644 14.5851 15.8344 15.7634Z" fill="#004F9F"/>
  <path d="M22.1825 38.9949C22.1587 39.2389 22.0158 39.3519 21.7895 39.3638C21.6049 39.3698 21.4203 39.3698 21.2357 39.3698H9.17076C6.11583 39.3698 3.06089 39.3698 0 39.3698V35.1567C3.72785 31.0388 7.56886 27.0221 11.1478 22.7614C12.9641 20.6013 14.6554 18.346 15.8344 15.7574C16.3644 14.5792 16.6205 13.3593 16.3525 12.0561C16.0131 10.4316 15.1198 9.19977 13.6609 8.46189C11.5826 7.40861 9.39705 7.3015 7.27706 8.26551C5.3774 9.13431 4.46628 10.7946 4.16257 12.8118C4.04347 13.5735 4.02561 14.3412 4.04943 15.1088C4.06729 15.5492 3.90651 15.7455 3.44797 15.7396C2.29865 15.7277 1.14337 15.7277 0 15.7336V7.79541C1.19101 5.67101 2.98347 4.13574 5.37145 3.25503C8.84919 1.97564 12.4043 1.96373 15.8464 3.32049C19.5802 4.79626 21.7418 7.61689 22.2718 11.6336C22.3195 12.0144 22.1825 12.2525 21.855 12.4488C19.3598 13.8889 17.4542 15.8943 16.1382 18.4471C15.2389 20.1907 14.6792 22.0295 14.572 23.9932C14.5184 24.9572 14.5065 25.9272 14.6196 26.8912C14.6554 27.1828 14.5601 27.397 14.3636 27.6053C12.5532 29.5452 10.7429 31.4851 8.93256 33.4191C8.83132 33.5321 8.72413 33.6333 8.6229 33.7464C8.54548 33.8416 8.36683 33.9189 8.4502 34.0677C8.51571 34.1986 8.6884 34.1391 8.81941 34.151C8.95042 34.157 9.08144 34.151 9.2184 34.151C11.8029 34.151 14.3874 34.157 16.9778 34.151C17.347 34.151 17.6507 34.2105 17.9068 34.52C18.9728 35.7934 20.2054 36.8943 21.6525 37.7214C22.2063 38.0368 22.2242 38.4772 22.1825 38.9889V38.9949Z" fill="white"/>
  <path d="M29.0605 10.9314C21.3845 11.098 15.0304 17.4355 15.1495 25.3797C15.2686 33.2108 21.7894 39.5542 29.6739 39.3697C33.5208 39.2805 37.338 37.3644 39.9999 34.389V15.6801C37.344 12.7166 33.4494 10.8362 29.0605 10.9314ZM29.3999 34.2462C24.4037 34.2522 20.3126 30.1521 20.2947 25.1178C20.2828 20.1907 24.4156 16.0609 29.3702 16.0549C34.3962 16.0549 38.4873 20.1371 38.4873 25.1595C38.4873 30.1819 34.3962 34.2403 29.3999 34.2462Z" fill="white"/>
  <path d="M38.4874 25.1595C38.4874 30.1462 34.3963 34.2403 29.4 34.2462C24.4037 34.2522 20.3126 30.1521 20.2948 25.1179C20.2829 20.1907 24.4157 16.0609 29.3702 16.055C34.3963 16.055 38.4874 20.1371 38.4874 25.1595Z" fill="#004F9F"/>
  <path d="M8.36091 48.4326H3.29317L1.3161 59.5723H2.37014L3.21576 54.8475H7.22946C9.36136 54.8475 11.0228 53.5086 11.3563 51.6341C11.6898 49.7716 10.5107 48.4326 8.36091 48.4326ZM10.3023 51.6341C10.076 52.9552 8.91473 53.9251 7.37238 53.9251H3.35868L4.16856 49.355H8.18226C9.72462 49.355 10.5405 50.3131 10.3023 51.6341Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  <path d="M14.2564 53.699L14.6078 51.7234H13.6073L12.2198 59.5723H13.2202L13.8574 55.9781C14.2088 53.9906 15.8345 52.5743 17.758 52.5743L17.9188 51.6222C16.4717 51.6222 15.1318 52.4196 14.2564 53.7049V53.699Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  <path d="M20.9796 48.0994C20.5627 48.0994 20.1994 48.4029 20.1339 48.8135C20.0565 49.2301 20.3066 49.5276 20.7235 49.5276C21.1403 49.5276 21.4857 49.2241 21.5691 48.8135C21.6525 48.4029 21.3964 48.0994 20.9796 48.0994Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  <path d="M18.4427 59.5723H19.4492L20.8307 51.7293H19.8303L18.4427 59.5723Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  <path d="M27.8577 51.6162C26.4702 51.6162 25.2315 52.253 24.4038 53.2705L24.6777 51.7293H23.6773L22.2897 59.5783H23.2902L24.0227 55.4247C24.3264 53.7406 25.7258 52.5267 27.417 52.5267C28.8343 52.5267 29.5668 53.3836 29.3286 54.7582L28.483 59.5783H29.4894L30.3648 54.5797C30.6804 52.7469 29.7097 51.6222 27.8637 51.6222L27.8577 51.6162Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  <path d="M34.8668 52.5684H37.1773L37.3202 51.7234H35.0097L35.4265 49.3967L34.3427 49.7954L34.0092 51.7234H32.5741L32.4312 52.5684H33.8485L32.9731 57.5372C32.7527 58.8404 33.3899 59.6676 34.6583 59.6676C35.2181 59.6676 35.7124 59.5247 35.9804 59.3522L36.1233 58.5548C35.9327 58.6976 35.5159 58.8107 35.1347 58.8107C34.2772 58.8107 33.8425 58.2691 34.0033 57.3944L34.8668 52.5743V52.5684Z" fill="#004F9F" stroke="#004F9F" stroke-width="2" stroke-miterlimit="10"/>
  </svg>

  `;
    const child = parser.parseFromString(svgStr, "image/svg+xml");
    const svgElem = child.documentElement;

    // Center in the middle of the QR code

    qrRef.current.appendChild(svgElem);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-4 sm:flex-row">
      <Card className="sm:w-[60%] w-full">
        <CardHeader>
          <CardTitle>معلومات الزبون</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Label htmlFor="fullName">الإسم الكامل</Label>
            <Input
              id="fullName"
              readOnly
              value={customer?.fullName ?? ""}
            />
            <Label htmlFor="phoneNumber">رقم الهاتف</Label>
            <Input
              readOnly
              id="phoneNumber"
              value={customer?.phoneNumber ?? ""}
            />
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input
              readOnly
              id="email"
              value={customer?.email ?? ""}
            />
            {customer?.bio && (
              <>
                <p
                  id="bio-label"
                  className="text-sm font-medium"
                >
                  نبذة تعريفية
                </p>
                <div
                  id="bio"
                  aria-labelledby="bio-label"
                  className="min-h-24 whitespace-pre-wrap rounded-md border bg-muted/30 px-3 py-2 text-sm"
                >
                  {customer.bio}
                </div>
              </>
            )}
            {customer?.pdf && (
              <Button asChild>
                <a
                  href={`https://media.twenty-print.com/${customer.pdf}`}
                  download
                >
                  <Download />
                  تحميل ملف PDF
                </a>
              </Button>
            )}

            {customer?.type === "customer" ?
              <>
                {customer?.socialMedia &&
                  Object.entries(customer?.socialMedia).map(([key, value]) => (
                    <Fragment key={key}>
                      <Label htmlFor={key}>{socialMedia[key].label}</Label>
                      <Input
                        readOnly
                        id={key}
                        value={value ?? ""}
                      />
                    </Fragment>
                  ))}
              </>
            : <>
                <Label htmlFor="extUrl">الرابط</Label>
                <Input
                  id="extUrl"
                  readOnly
                  name="absoluteUrl"
                  value={customer?.absoluteUrl ?? ""}
                />
              </>
            }
          </div>
          <div>&nbsp;</div>
          <div className="flex flex-col gap-3">
            <AlertDialog open={isModalOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  onClick={() => {
                    setModalOpen(true);
                    writeNFC();
                  }}
                  style={{ cursor: "pointer" }}
                >
                  إدخال المعلومات إلي بطاقة NFC
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    إدخال المعلومات إلي بطاقة NFC
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    يرجي تقريب بطاقة NFC من الهاتف
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => setModalOpen(false)}
                    style={{ cursor: "pointer" }}
                  >
                    إلغاء
                  </AlertDialogCancel>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
      <Card className="w-fit h-fit sticky top-0 p-3">
        <QRCodeSVG
          level="H"
          imageSettings={{
            src: "#",
            height: 40,
            width: 30,
            excavate: true,
          }}
          ref={qrRef}
          value={`https://twenty-print.com/${id}`}
        />

        <Button
          onClick={downloadQRCode}
          style={{ cursor: "pointer" }}
        >
          تحميل
        </Button>
      </Card>
    </div>
  );
}
