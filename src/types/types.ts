export interface Customer {
  id?: number;
  fullName: string;
  phoneNumber: string;
  email: string;
  bio?: string;
  pdf?: string;
  type: "customer" | "page";
  absoluteUrl?: string;
  coverImg?: string;
  profileImg?: string;
  socialMedia?: Record<string, string> | string;
  createdAt?: string;
}
