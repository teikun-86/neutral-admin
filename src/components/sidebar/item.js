import Link from "next/link"

export const Item = ({ href, children, className = "", activeClassName = "", active = false, ...props }) => {
    const classNames = `
        w-full px-3 py-2 rounded-lg transition-all duration-100 flex items-center justify-start space-x-2 text-sm font-medium text-gray-900 dark:text-gray-100
        group
        ${className}
        ${active ? activeClassName : ""}
        ${active ? "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-rose-50 dark:focus:bg-gray-700" : "hover:bg-gray-50 focus:bg-gray-100 dark:hover:bg-gray-800 dark:focus:bg-gray-800"}
    `

    return (
        <Link href={href} className={classNames} {...props}>
            {children}
        </Link>
    )
}