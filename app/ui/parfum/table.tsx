import { fetchFilteredParfum } from "@/app/lib/data";
import InfiniteList from "@/app/ui/parfum/infinite-list";
import ParfumTableRow from "@/app/ui/parfum/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function ParfumTable({
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
  const parfumList = await fetchFilteredParfum(query, currentPage);

  return (
    <TableShell
      isEmpty={parfumList?.length === 0}
      headers={["Nama Parfum"]}
      mobile={
        <InfiniteList
          key={query}
          initialParfum={parfumList}
          query={query}
          totalPages={totalPages}
          canManage={canManage}
        />
      }
    >
      {parfumList?.map((parfum) => (
        <ParfumTableRow key={parfum.id} parfum={parfum} canManage={canManage} />
      ))}
    </TableShell>
  );
}

