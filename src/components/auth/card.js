import Link from "next/link"
import AppLogo from "../app-logo"

export const Card = ({ children, ...props }) => {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center pt-6 sm:pt-0">
            <Link href="/">
                <AppLogo className="w-48" />
            </Link>

            <div className="w-full sm:max-w-md mt-6 px-6 py-4 bg-white dark:bg-gray-900 shadow-md overflow-hidden sm:rounded-lg relative">
                {children}
            </div>
        </div>
    )
}