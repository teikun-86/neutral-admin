import { randomString } from "@/util"

const Options = ({ className = "", label = "", children, id = null, ...props }) => {
    const inputId = id !== null ? id : `opt-${randomString(16)}`
    
    return (
        <div className="w-full relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={inputId}>{label}</label>
            <select id={inputId} className={`mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 sm:text-sm bg-white dark:bg-gray-800 dark:text-white transition-all duration-200 !ring-0 !outline-none ${className}`} {...props}>
                {children}
            </select>
        </div>
    )
}

const Option = ({ value, children, ...props }) => {
    return (
        <option value={value} {...props}>
            {children}
        </option>
    )
}

Options.Option = Option

export {
    Options
}