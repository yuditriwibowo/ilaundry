import EditPelangganForm from '@/app/ui/pelanggan/edit-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { fetchPelangganById } from '@/app/lib/data';

export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const pelanggan = await fetchPelangganById(id);
    return (
    <main>
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
      <EditPelangganForm pelanggan={pelanggan} />
    </main>
  );
}
