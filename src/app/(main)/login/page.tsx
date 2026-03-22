'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await login(phone, password);
            if (result.success) {
                toast.success("Xush kelibsiz!");
                router.push('/profile');
            } else {
                toast.error(result.error || "Kirishda xatolik yuz berdi");
            }
        } catch (error) {
            toast.error("Tizim xatosi");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center bg-[#F9FAFB] p-4">
            <Card className="w-full max-w-md p-8 shadow-xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Kirish</h1>
                    <p className="text-gray-500 text-sm">Pack24 hisobingizga kiring</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <Input
                        label="Telefon raqami"
                        type="tel"
                        placeholder="+998 90 123 45 67"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                    />

                    <Input
                        label="Parol"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full bg-[#064E3B] hover:bg-[#053d2e] h-11 text-base"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2" /> : null}
                        Kirish
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-500">Hisobingiz yo'qmi? </span>
                    <Link href="/register" className="text-[#064E3B] font-medium hover:underline">
                        Ro'yxatdan o'tish
                    </Link>
                </div>
            </Card>
        </div>
    );
}
