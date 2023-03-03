import '@/styles/globals.css'
import NextNProgress from 'nextjs-progressbar';
import { Poppins } from '@next/font/google'
import { RecoilRoot } from 'recoil'
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '@/components/loader';

const poppins = Poppins({
    variable: "--font-poppins",
    subsets: ["latin"],
    weight: ["200", "300", "400", "600", "700", "900"]
})

export default function App({ Component, pageProps }) {
    const { socialLogin } = useAuth()
    const router = useRouter()

    const [loading, setLoading] = useState(false)
    
    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, [])

    useEffect(() => {
        const query = router.query;
        if (query?.social && query?.user_id) {
            toast.promise(socialLogin(query.social, query.user_id), {
                pending: 'Signing in...',
                success: 'Signed in successfully',
                error: 'Failed to sign in'
            })
            router.push(router.pathname)
        }
    }, [router])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.body.className = `${poppins.variable} font-sans`
        }
    }, [])

    const start = () => setLoading(true)
    const end = () => setLoading(false)

    useEffect(() => {
        router.events.on('routeChangeStart', start)
        router.events.on('routeChangeComplete', end)
        router.events.on('routeChangeError', end)
        return () => {
            router.events.off('routeChangeStart', start)
            router.events.off('routeChangeComplete', end)
            router.events.off('routeChangeError', end)
        }
    }, [router])

    const getLayout = Component.getLayout || ((page) => page)
    
    return (
        <>
            <RecoilRoot>
                <NextNProgress color="#e11d48" options={{
                    showSpinner: false
                }} />
                <main className="min-h-screen bg-gray-50 dark:bg-gray-800 antialiased text-gray-900 dark:text-white">
                    {getLayout(<Component {...pageProps} />)}
                    <ToastContainer position='top-center' />
                </main>
            </RecoilRoot>
        </>
    )
}
