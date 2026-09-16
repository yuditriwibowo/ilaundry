import { fetchFilteredAntarJemput } from "@/app/lib/data";
import InfiniteList from "@/app/ui/antar-jemput/infinite-list";
import AntarJemputTableRow from "@/app/ui/antar-jemput/table-row";
import TableShell from "@/app/ui/shared/table-shell";

export default async function AntarJemputTable({
  query,
  currentPage,
  totalPages,
}: {
  query: string;
  currentPage: number;
  totalPages: number;
}) {
  const antarJemputList = await fetchFilteredAntarJemput(query, currentPage);

  return (
    <TableShell
      isEmpty={antarJemputList?.length === 0}
      headers={["Nama Antar-Jemput", "Harga"]}
      mobile={
        <InfiniteList
          key={query}
          initialAntarJemput={antarJemputList}
          query={query}
          totalPages={totalPages}
        />
      }
    >
      {antarJemputList?.map((antarJemput) => (
        <AntarJemputTableRow key={antarJemput.id} antarJemput={antarJemput} />
      ))}
    </TableShell>
  );
}
