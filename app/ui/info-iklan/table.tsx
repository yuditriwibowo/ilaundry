import { fetchFilteredInfoIklan } from "@/app/lib/data";
import InfiniteList from "@/app/ui/info-iklan/infinite-list";
import InfoIklanTableRow from "@/app/ui/info-iklan/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function InfoIklanTable({
  query,
  currentPage,
  totalPages,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
}) {
  const infoIklanList = await fetchFilteredInfoIklan(query, currentPage);

  return (
    <TableShell
      isEmpty={infoIklanList?.length === 0}
      headers={["Judul"]}
      mobile={
        <InfiniteList
          key={query}
          initialItems={infoIklanList}
          query={query}
          totalPages={totalPages}
        />
      }
    >
      {infoIklanList?.map((infoIklan) => (
        <InfoIklanTableRow key={infoIklan.id} infoIklan={infoIklan} />
      ))}
    </TableShell>
  );
}