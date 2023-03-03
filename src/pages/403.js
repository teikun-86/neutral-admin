import { useAuth } from "@/hooks/auth";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function ForOFor() {
    const router = useRouter()
    const [src, setSrc] = useState('')
    const [permissions, setPermissions] = useState([])
    const { user, checkPermission } = useAuth()

    useEffect(() => {
        const { intent, _rd } = router.query
        if (intent) {
            setSrc(intent)
        }
        if (_rd) {
            setPermissions(atob(_rd).split(','))
        }
    }, [router])

    useEffect(() => {
        if (src && user && permissions ) {
            if (checkPermission(permissions)) {
                window.location.href = src
            }
        }
    }, [user, src, permissions])
    
    return (
        <>
            <Head>
                <title>403 | Forbidden</title>
            </Head>
            <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-1000 grid place-items-center">
                <div className="flex items-center justify-center space-y-5 flex-col max-w-xl">
                    <div className="flex items-center justify-center flex-col w-full">
                        <b className="font-semibold text-lg text-gray-900 dark:text-white">403</b>
                        <hr className="w-64 -my-px border-t border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-600 dark:text-gray-300">Forbidden</span>
                        <p className="text-sm font-medium text-gray-400">You don&apos;t have the right permission to access the resource.</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a className="btn-text" href="/dashboard">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </a>
                    {
                        src && (
                            <p className="text-center text-sm" href={src}>
                                Seems like you don&apos;t have the right permission to access the <code className="border-b border-dotted">{src}</code> page.
                            </p>
                        )
                    }
                </div>
            </div>
        </>
    )
}

export const getServerSideProps = ({
    res
}) => {
    res.statusCode = 403
    return {
        props: {}
    }
}