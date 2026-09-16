import { fetchFilteredDiskon } from "@/app/lib/data";
import InfiniteList from "@/app/ui/diskon/infinite-list";
import DiskonTableRow from "@/app/ui/diskon/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function DiskonTable({
  query,
  currentPage,
  totalPages,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
}) {
  const diskonList = await fetchFilteredDiskon(query, currentPage);

  return (
    <TableShell
      isEmpty={diskonList?.length === 0}
      headers={["Nama Diskon", "Tipe", "Nilai"]}
      mobile={
        <InfiniteList
          key={query}
          initialDiskon={diskonList}
          query={query}
          totalPages={totalPages}
        />
      }
    >
      {diskonList?.map((diskon) => (
        <DiskonTableRow key={diskon.id} diskon={diskon} />
      ))}
    </TableShell>
  );
}
