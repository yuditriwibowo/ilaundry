import { fetchFilteredDurasi } from "@/app/lib/data";
import InfiniteList from "@/app/ui/durasi/infinite-list";
import DurasiTableRow from "@/app/ui/durasi/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function DurasiTable({
  query,
  currentPage,
  totalPages,
  canManage = true,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
  canManage?: boolean;
}) {
  const durasiList = await fetchFilteredDurasi(query, currentPage);

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
          canManage={canManage}
        />
      }
    >
      {durasiList?.map((durasi) => (
        <DurasiTableRow key={durasi.id} durasi={durasi} canManage={canManage} />
      ))}
    </TableShell>
  );
}

