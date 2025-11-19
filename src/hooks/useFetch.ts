import { useRouter } from "next/navigation";
import React from "react";

export function useFetch<T>(endpoint: `/${string}`) {
  const [data, setData] = React.useState<T>();
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const router = useRouter();

  const fetchData = React.useCallback(
    async (signal: AbortSignal) => {
      try {
        const baseUrl =
          process.env.NODE_ENV === "development"
            ? "http://localhost:8787"
            : "https://api.twenty-print.com";
        const resp = await fetch(`${baseUrl}${endpoint}`, {
          method: "GET",
          credentials: "include",
          signal: signal,
        });
        if (resp.status === 401) {
          const refreshResp = await fetch(`${baseUrl}/api/refresh`, {
            credentials: "include",
            signal: signal,
          });
          if (refreshResp.ok) {
            const retried = await fetch(`${baseUrl}${endpoint}`, {
              method: "GET",
              credentials: "include",
              signal: signal,
            });
            const retriedData = await retried.json<T>();
            if (!signal.aborted) setData(retriedData);
            return;
          } else {
            await fetch(`${baseUrl}/logout`);
            router.push("/");
            return;
          }
        }
        const data = await resp.json<T>();
        if (!signal.aborted) {
          setData(data);
          setError("");
        }
      } catch (error) {
        if (!signal.aborted) setError((error as Error).message);
      } finally {
        if (!signal.aborted) setIsLoading(false);
      }
    },
    [endpoint, router]
  );

  const refetch = React.useCallback(() => {
    const abortCtrl = new AbortController();
    setIsLoading(true);
    fetchData(abortCtrl.signal);
  }, [fetchData]);

  React.useEffect(() => {
    const abortCtrl = new AbortController();
    fetchData(abortCtrl.signal);

    return () => abortCtrl.abort();
  }, [fetchData]);
  return {
    data,
    isLoading,
    error,
    setIsLoading,
    setData,
    refetch,
  };
}
