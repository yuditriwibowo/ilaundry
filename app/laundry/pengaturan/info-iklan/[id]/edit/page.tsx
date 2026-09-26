import EditInfoIklanForm from '@/app/ui/info-iklan/edit-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { fetchInfoIklanById } from '@/app/lib/data';
import { getSessionContext, canManageInfoIklan } from '@/app/lib/auth';
import { notFound, redirect } from 'next/navigation';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Edit Info & Iklan',
};

export default async function Page(props: {params: Promise<{id: string}>}) {
    // Guard: HANYA Administrator.
    const ctx = await getSessionContext();
    if (!canManageInfoIklan(ctx.peran)) {
      redirect("/laundry/pengaturan");
    }

    const params = await props.params;
    const id = params.id;
    const infoIklan = await fetchInfoIklanById(id);

    if (!infoIklan) {
      notFound();
    }

    return (
    <main>
       <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 shadow-md px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
        <Breadcrumbs
          breadcrumbs={[
            { label: 'Pengaturan Info & Iklan', href: '/laundry/pengaturan/info-iklan' },
            {
              label: 'Edit Info & Iklan',
              href: `/laundry/pengaturan/info-iklan/${id}/edit`,
              active: true,
            },
          ]}
        />
      </div>
      <EditInfoIklanForm infoIklan={infoIklan} />
    </main>
  );
}