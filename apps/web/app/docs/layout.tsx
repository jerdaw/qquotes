import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { Footer } from '../components/Footer';

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <div className="mx-auto max-w-7xl w-full flex-1 flex pt-20">
        <Sidebar />
        <main className="flex-1 min-w-0 py-10 px-6 lg:px-10">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
