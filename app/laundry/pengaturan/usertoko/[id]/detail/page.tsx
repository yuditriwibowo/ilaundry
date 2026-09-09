import Breadcrumbs from '@/app/ui/breadcrumbs';
import UserTokoDetailView from '@/app/ui/usertoko/detail-view';
import { fetchUserTokoById } from '@/app/lib/data';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Detail User Toko',
};

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const userToko = await fetchUserTokoById(id);

  if (!userToko) {
    notFound();
  }

  return (
    <main>
      <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'User Toko', href: '/laundry/pengaturan/usertoko' },
            {
              label: 'Detail User Toko',
              href: `/laundry/pengaturan/usertoko/${id}/detail`,
              active: true,
            },
          ]}
        />
      </div>
      <UserTokoDetailView userToko={userToko} />
    </main>
  );
}
