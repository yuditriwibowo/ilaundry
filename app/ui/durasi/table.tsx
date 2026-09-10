import { fetchFilteredDurasi, fetchDurasiPages } from "@/app/lib/data";
import InfiniteList from "@/app/ui/durasi/infinite-list";
import DurasiTableRow from "@/app/ui/durasi/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function DurasiTable({
  query,
  currentPage,
}: {
  query: string;
  currentPage: number;
}) {
  const durasiList = await fetchFilteredDurasi(query, currentPage);
  const totalPages = await fetchDurasiPages(query);

  return (
    <TableShell
      isEmpty={durasiList?.length === 0}
      headers={["Nama Durasi", "Lama Durasi"]}
      mobile={
        <InfiniteList
          key={query}
          initialDurasi={durasiList}
          query={query}
          totalPages={totalPages}
        />
      }
    >
      {durasiList?.map((durasi) => (
        <DurasiTableRow key={durasi.id} durasi={durasi} />
      ))}
    </TableShell>
  );
}

