import { BottomNav } from "@/components/nexus/bottom-nav";
import { WelcomePopup } from "@/components/nexus/welcome-popup";
import React from "react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-[#030712] text-white selection:bg-cyan-500/30">

            {/* Background Mesh Gradient — static for GPU perf */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[100px]" style={{ willChange: 'auto' }} />
                <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-600/10 blur-[100px]" style={{ willChange: 'auto' }} />
            </div>

            {/* Main Content Area */}
            <main className="relative z-10 flex min-h-screen flex-col px-4 pb-24 pt-6 md:px-8 max-w-7xl mx-auto">
                {children}
            </main>

            {/* Navigation */}
            <BottomNav />
            <WelcomePopup />

        </div>
    );
}
