import type { ReactNode } from 'react';
import { Footer } from './Footer';
import { Sidebar } from './Sidebar';

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F9F6F0] font-sans">
      <Sidebar />

      {/* Main content, offset by the sidebar width */}
      <main className="md:ml-[280px] lg:ml-[300px] p-4 md:p-6 lg:p-8 pb-20">
        <div className="max-w-[1100px] mx-auto">{children}</div>
      </main>

      <Footer />
    </div>
  );
}
