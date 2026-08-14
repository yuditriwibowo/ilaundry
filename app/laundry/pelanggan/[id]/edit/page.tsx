import EditPelangganForm from '@/app/ui/pelanggan/edit-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { fetchPelangganById } from '@/app/lib/data';

export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const pelanggan = await fetchPelangganById(id);
    return (
    <main>
      <div className="bg-blue-200 pb-4 px-4 pt-2 -mx-4 rounded-b-xl md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none">
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
