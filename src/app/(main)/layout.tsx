import GoogleAnalytics from "@/components/GoogleAnalytics";
import GlobalAIWrapper from "@/components/GlobalAIWrapper";
import { LanguageProvider } from "@/lib/contexts/LanguageContext";
import { CurrencyProvider } from "@/lib/contexts/CurrencyContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <GoogleAnalytics />
            <LanguageProvider>
                <CurrencyProvider>
                    <Navbar />
                    <GlobalAIWrapper />
                    <main className="flex-grow">
                        {children}
                    </main>
                    <Footer />
                </CurrencyProvider>
            </LanguageProvider>
            <Toaster richColors position="bottom-right" closeButton duration={3000} />
        </>
    );
}