import Form from '@/app/ui/pesanan_old/edit-form';
import Breadcrumbs from '@/app/ui/breadcrumbs';
import { fetchInvoiceById, fetchCustomers } from '@/app/lib/data';
import { notFound } from 'next/navigation';
 
export default async function Page(props: {params: Promise<{id: string}>}) {
    const params = await props.params;
    const id = params.id;
    const [invoice, customers] = await Promise.all([
    fetchInvoiceById(id),
    fetchCustomers(),
  ]);
  if (!invoice) {
    notFound();
  }
  return (
     <main>
        <div className="bg-gradient-to-b from-primary-400 to-primary-800 px-4 -mx-4 rounded-b-xl flex items-center min-h-[90px] md:bg-none md:bg-gray-50 md:pb-0 md:px-0 md:pt-0 md:mx-0 md:rounded-b-none md:min-h-0">
         <Breadcrumbs
           breadcrumbs={[
             { label: 'Pesanan', href: '/dashboard/pesanan' },
             {
               label: 'Edit Pesanan',
               href: `/dashboard/pesanan/${id}/edit`,
               active: true,
             },
           ]}
         />
       </div>
       <Form invoice={invoice} customers={customers} />
     </main>
   );
}