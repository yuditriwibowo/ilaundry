import EditPelangganForm from '@/app/ui/pelanggan/edit-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { fetchPelangganById } from '@/app/lib/data';
import { notFound } from 'next/navigation';

export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const pelanggan = await fetchPelangganById(id);

    if (!pelanggan) {
      notFound();
    }

    return (
    <main>
       <div className="bg-primary-100 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Pelanggan', href: '/laundry/pelanggan' },
            {
              label: 'Edit Pelanggan',
              href: `/laundry/pelanggan/${id}/edit`,
              active: true,
            },
          ]}
        />
      </div>
      <EditPelangganForm pelanggan={pelanggan} />
    </main>
  );
}
