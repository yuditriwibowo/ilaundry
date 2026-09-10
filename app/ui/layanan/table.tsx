import { fetchFilteredLayanan, fetchLayananPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/layanan/infinite-list";
import LayananTableRow from "@/app/ui/layanan/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function LayananTable({
  query,
  currentPage,
  tipeId,
  durasiNama,
}: {
  query: string;
  currentPage: number;
  tipeId?: string;
  durasiNama?: string;
}) {
  const layananList = await fetchFilteredLayanan(query, currentPage, tipeId, durasiNama);
  const totalPages = await fetchLayananPages(query, tipeId, durasiNama);

  return (
    <TableShell
      isEmpty={layananList?.length === 0}
      headers={["Nama Layanan", "Tipe", "Durasi", "Harga"]}
      mobile={
        <InfiniteList
          key={query + tipeId + durasiNama}
          initialLayanan={layananList}
          query={query}
          totalPages={totalPages}
        />
      }
    >
      {layananList?.map((layanan) => (
        <LayananTableRow key={layanan.id} layanan={layanan} />
      ))}
    </TableShell>
  );
}
