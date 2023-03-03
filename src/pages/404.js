import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Head from "next/head";

export default function ForOFor () {
    return (
        <>
            <Head>
                <title>404 | Not Found</title>
            </Head>
            <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-1000 grid place-items-center">
                <div className="flex items-center justify-center space-y-5 flex-col">
                    <div className="flex items-center justify-center flex-col w-full">
                        <b className="font-semibold text-lg text-gray-900 dark:text-white">404</b>
                        <hr className="w-64 -my-px border-t border-gray-300 dark:border-gray-600" />
                        <span className="text-gray-600 dark:text-gray-300">Not Found</span>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">The page you are looking is not available.</p>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                    <a className="btn-text" href="/dashboard">
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </a>
                </div>
            </div>
        </>
    )
}