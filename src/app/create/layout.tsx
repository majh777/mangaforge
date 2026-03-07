import { CreateBreadcrumb } from '@/components/create-breadcrumb';

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CreateBreadcrumb />
      {children}
    </>
  );
}
