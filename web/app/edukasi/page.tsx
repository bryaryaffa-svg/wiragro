import { redirect } from "next/navigation";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function EdukasiAliasPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolved = await searchParams;
  const params = new URLSearchParams();

  Object.entries(resolved).forEach(([key, value]) => {
    if (typeof value === "string" && value) {
      params.set(key, value);
      return;
    }

    if (Array.isArray(value)) {
      value.filter(Boolean).forEach((item) => params.append(key, item));
    }
  });

  const query = params.toString();
  redirect(query ? `/artikel?${query}` : "/artikel");
}
