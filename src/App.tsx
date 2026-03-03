import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Index from "./pages/Index";
import About from "./pages/About";
import Programs from "./pages/Programs";
import Verify from "./pages/Verify";
import Team from "./pages/Team";
import Contact from "./pages/Contact";
import Gallery from "./pages/Gallery";
import Auth from "./pages/Auth";
import Library from "./pages/Library";
import Checkout from "./pages/Checkout";
import AISymposium from "./pages/AISymposium";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminOverview from "./pages/admin/Overview";
import AdminOrders from "./pages/admin/Orders";
import AdminCertificates from "./pages/admin/Certificates";
import AdminTeam from "./pages/admin/Team";
import AdminUsers from "./pages/admin/Users";
import AdminMedia from "./pages/admin/Media";
import AdminSettings from "./pages/admin/Settings";
import AdminSymposium from "./pages/admin/Symposium";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AppContent = () => {
    const location = useLocation();
    const isAdminRoute = location.pathname.startsWith('/admin');

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/about" element={<About />} />
                <Route path="/programs" element={<Programs />} />
                <Route path="/verify" element={<Verify />} />
                <Route path="/verify/:code" element={<Verify />} />
                <Route path="/team" element={<Team />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/gallery" element={<Gallery />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/library" element={<Library />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/ai-symposium" element={<AISymposium />} />

                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="symposium" element={<AdminSymposium />} />
                    <Route path="certificates" element={<AdminCertificates />} />
                    <Route path="team" element={<AdminTeam />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="media" element={<AdminMedia />} />
                    <Route path="settings" element={<AdminSettings />} />
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
            </Routes>
            {!isAdminRoute && <Footer />}

            {/* Floating WhatsApp Button */}
            {!isAdminRoute && (
                <a
                    href="https://wa.link/lq1d1p"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Chat on WhatsApp"
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#1ebe57] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                    style={{ animation: 'whatsappBounce 0.6s ease-out' }}
                >
                    <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
                </a>
            )}

            <style>{`
                @keyframes whatsappBounce {
                    0% { transform: scale(0) translateY(40px); opacity: 0; }
                    60% { transform: scale(1.15) translateY(-5px); opacity: 1; }
                    80% { transform: scale(0.95) translateY(2px); }
                    100% { transform: scale(1) translateY(0); }
                }
            `}</style>
        </>
    );
};

const App = () => (
    <QueryClientProvider client={queryClient}>
        <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <AppContent />
            </BrowserRouter>
        </TooltipProvider>
    </QueryClientProvider>
);

export default App;
