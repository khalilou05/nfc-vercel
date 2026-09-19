import { clsx, type ClassValue } from "clsx";
import { redirect } from "next/navigation";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchApi(
  endpoint: `/${string}`,
  config: RequestInit = {},
  retry = true,
) {
  const baseUrl = `${
    process.env.NODE_ENV === "development" ?
      "http://localhost:8787"
    : "https://api.twenty-print.com"
  }`;

  const url = `${baseUrl}${endpoint}`;
  const resp = await fetch(url, {
    ...config,
    credentials: "include",
  });
  if (resp.status === 401) {
    redirect("/login", "replace");
  }
  return resp;
}
