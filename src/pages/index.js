import { useAuth } from '@/hooks/auth'
import GuestLayout from '@/layouts/guest'
import { config } from '@/util'
import Link from 'next/link'

export default function Home() {
    const { user } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: '/dashboard'
    })
    
    return (
        <GuestLayout>
            <div className="w-full grid place-items-center min-h-screen">
                <div className="flex flex-col justify-center items-center">
                    <h1 className="text-center text-2xl font-semibold text-gray-900 dark:text-white">{config('app.name')}</h1>
                    <Link href="/auth/login" className="btn-text text-base">Log in</Link>
                </div>
            </div>
        </GuestLayout>
    )
}
