import Breadcrumbs from '@/app/ui/breadcrumbs';
import AntarJemputDetailView from '@/app/ui/antar-jemput/detail-view';
import { fetchAntarJemputById } from '@/app/lib/data';
import { getSessionContext, canManageMasterData } from '@/app/lib/auth';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detail Antar-Jemput',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const [ctx, params] = await Promise.all([
    getSessionContext(),
    props.params,
  ]);
  const canManage = canManageMasterData(ctx.peran);
  const id = params.id;
  const antarJemput = await fetchAntarJemputById(id);

  if (!antarJemput) {
    notFound();
  }

  return (
    <main>
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Pengaturan Antar-Jemput', href: '/laundry/pengaturan/antar-jemput' },
            {
              label: 'Detail Antar-Jemput',
              href: `/laundry/pengaturan/antar-jemput/${id}/detail`,
              active: true,
            },
          ]}
        />
      </div>
      <AntarJemputDetailView antarJemput={antarJemput} canManage={canManage} />
    </main>
  );
}
