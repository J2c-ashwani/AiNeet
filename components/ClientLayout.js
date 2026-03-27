'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';

export default function ClientLayout({ children }) {
    return (
        <AuthProvider>
            <Navbar />
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <Footer />
        </AuthProvider>
    );
}
