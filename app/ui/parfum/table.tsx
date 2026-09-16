import { fetchFilteredParfum } from "@/app/lib/data";
import InfiniteList from "@/app/ui/parfum/infinite-list";
import ParfumTableRow from "@/app/ui/parfum/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function ParfumTable({
  query,
  currentPage,
  totalPages,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
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
        />
      }
    >
      {parfumList?.map((parfum) => (
        <ParfumTableRow key={parfum.id} parfum={parfum} />
      ))}
    </TableShell>
  );
}

