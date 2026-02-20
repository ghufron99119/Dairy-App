import { LoginForm } from "@/components/gate/login-form";

export default function LoginPage() {
    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-[#030712]">

            {/* Background Animated Gradient Mesh */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[20%] left-[20%] h-[300px] w-[300px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[20%] right-[20%] h-[400px] w-[400px] rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
            </div>

            {/* Content */}
            <div className="relative z-10 px-4 w-full flex justify-center">
                <LoginForm />
            </div>
        </div>
    );
}
