"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Eye from "@/icons/Eye";
import PEN from "@/icons/PEN";
import Trash from "@/icons/Trash";
import { fetchApi } from "@/lib/utils";
import { MoreHorizontal, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import useSWR from "swr";
import { Customer } from "../../../types/types";

interface Data {
  customers: Customer[];
  totalPages: number;
  totalCustomers: number;
}

const fetcher = async (url: `/${string}`) => {
  const resp = await fetchApi(url);
  if (!resp.ok) {
    throw new Error("Failed to load customers");
  }
  return resp.json<Data>();
};

export function DataTableDemo() {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [query, setQuery] = React.useState("");
  const timeoutId = React.useRef<NodeJS.Timeout>(null);
  const params = new URLSearchParams({
    page: currentPage.toString(),
    q: query,
  });
  const { data, isLoading, isValidating, mutate } = useSWR<Data>(
    `/api/customers?${params.toString()}`,
    fetcher,
    {
      keepPreviousData: true,
    },
  );
  const isFetching = isLoading || isValidating;

  const [selechAllcheckBox, setSelechAllcheckBox] = React.useState<
    boolean | "indeterminate"
  >(false);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer[]>(
    [],
  );
  const nextPage = () => {
    setCurrentPage((prv) => (prv === data?.totalPages ? prv : prv + 1));
  };
  const prevPage = () => {
    setCurrentPage((prv) => (prv === 1 ? prv : prv - 1));
  };

  const handleSelect = (cus: Customer) => {
    const inList = selectedCustomer.find((i) => i.id === cus.id);
    if (inList) {
      setSelectedCustomer((prv: Customer[]) =>
        prv.filter((itm) => itm.id !== cus.id),
      );
      return;
    }
    setSelectedCustomer((prv) => [...prv, cus]);
  };

  const deleteCustomer = async (cus: Customer) => {
    const deleteConfirm = window.confirm("هل تريد حذف الزبون");
    if (!deleteConfirm) return;
    const resp = await fetchApi(`/api/customers`, {
      method: "DELETE",
      body: JSON.stringify([cus]),
    });
    if (resp.ok) {
      await mutate();
    }
  };
  const deleteAllCustomers = async () => {
    const deleteConfirm = window.confirm(
      "هل تريد حذف  الزبائن الذي تم تحديدهم",
    );
    if (!deleteConfirm) return;
    const resp = await fetchApi(`/api/customers`, {
      method: "DELETE",
      body: JSON.stringify(selectedCustomer),
    });
    if (resp.ok) {
      await mutate();
      setSelectedCustomer([]);
    }
  };

  const selectAll = () => {
    if (
      selectedCustomer.length &&
      selectedCustomer.length === data?.customers.length
    ) {
      setSelectedCustomer([]);
      return;
    }
    if (data?.customers) setSelectedCustomer(data?.customers);
  };

  const handleSearch = (query: string) => {
    setSelectedCustomer([]);
    if (timeoutId.current) clearTimeout(timeoutId.current);
    timeoutId.current = setTimeout(() => {
      setQuery(query);
    }, 200);
  };

  const router = useRouter();

  React.useEffect(() => {
    if (
      selectedCustomer.length &&
      selectedCustomer.length === data?.customers.length
    ) {
      setSelechAllcheckBox(true);
    }
    if (
      selectedCustomer.length &&
      selectedCustomer.length !== data?.customers.length
    ) {
      setSelechAllcheckBox("indeterminate");
    }
    if (selectedCustomer.length === 0) {
      setSelechAllcheckBox(false);
    }
  }, [selectedCustomer, data]);

  return (
    <div className="w-full  h-6/7 ">
      <div
        className="flex items-center py-4 justify-between
"
      >
        <InputGroup className="w-[40%] pr-2">
          <InputGroupInput
            placeholder="البحث برقم الهاتف او الإسم"
            className="pr-1"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <InputGroupAddon className="p-0">
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {selectedCustomer.length ?
          <Button
            onClick={deleteAllCustomers}
            className="cursor-pointer bg-red-500"
            variant={"destructive"}
          >
            حذف
          </Button>
        : null}
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table className="border-collapse table-fixed w-full ">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={selechAllcheckBox}
                  onCheckedChange={selectAll}
                />
              </TableHead>
              <TableHead>الإسم الكامل</TableHead>
              <TableHead>رقم الهاتف</TableHead>
              <TableHead>البريد الإلكتروني</TableHead>
              <TableHead>تاريخ الإضافة</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ?
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow
                  className="h-[49px]"
                  key={i}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableCell key={i}>
                      <Skeleton className={`w-full h-3`} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : data?.customers && !data.customers.length ?
              <TableRow>
                <TableCell
                  className="h-3"
                  colSpan={5}
                >
                  لا توجد بيانات
                </TableCell>
              </TableRow>
            : data?.customers.map((cus) => (
                <TableRow
                  className="has-checked:bg-grey h-[49px]"
                  key={cus.id}
                >
                  <TableCell>
                    <Checkbox
                      checked={
                        selectedCustomer.find((i) => i.id === cus.id) ? true : (
                          false
                        )
                      }
                      onCheckedChange={() => handleSelect(cus)}
                    />
                  </TableCell>
                  <TableCell className="truncate">{cus.fullName}</TableCell>
                  <TableCell className="truncate">{cus.phoneNumber}</TableCell>
                  <TableCell className="truncate">{cus.email}</TableCell>
                  <TableCell className="truncate">{cus.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0 cursor-pointer"
                        >
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        style={{ direction: "rtl" }}
                        align="start"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/customers/${cus.id}`)
                          }
                          className="justify-between cursor-pointer"
                        >
                          عرض
                          <Eye />
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/dashboard/customers/${cus.id}/edit`)
                          }
                          className="justify-between cursor-pointer"
                        >
                          تعديل
                          <PEN />
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => deleteCustomer(cus)}
                          className="text-red-500 hover:text-red-500! hover:bg-red-100! justify-between cursor-pointer"
                        >
                          حذف
                          <Trash />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            }
            <TableRow>
              <TableCell
                className="text-gray-500"
                colSpan={6}
              >
                إجمالي الزبائن {data?.totalCustomers}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            onClick={prevPage}
            disabled={currentPage === 1 ? true : false}
          >
            السابق
          </Button>
          <span>
            صفحة {currentPage} - {data?.totalPages}
          </span>
          <Button
            className="cursor-pointer"
            variant="outline"
            size="sm"
            disabled={currentPage === data?.totalPages}
            onClick={nextPage}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  );
}
