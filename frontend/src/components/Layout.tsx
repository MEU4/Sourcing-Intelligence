import type { ReactNode } from 'react';
import { Target } from 'lucide-react';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col">
            <header className="glass sticky top-0 z-50 px-6 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="bg-primary-500 text-white p-2 rounded-lg">
                        <Target size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sourcing Intelligence</h1>
                        <p className="text-xs text-slate-500 font-medium">AI-powered strategic sourcing insights</p>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                {children}
            </main>

            <footer className="mt-auto py-6 text-center text-sm text-slate-400">
                &copy; {new Date().getFullYear()} Sourcing Intelligence. Empowering procurement with AI.
            </footer>
        </div>
    );
}
