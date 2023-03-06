import { randomString } from "@/util"

export const Input = ({
    type,
    name,
    value,
    placeholder,
    id = null,
    onChange,
    label,
    className,
    enableShowPassword = false,
    ...props
}) => {
    const handleChange = (e) => {
        onChange(e)
    }

    const inputId = id !== null ? id : `inp-${randomString(16)}`
    
    return (
        <div className="w-full relative">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={inputId}>{label}</label>
            <input
                type={type}
                name={name}
                id={inputId}
                value={value}
                placeholder={placeholder}
                onChange={handleChange}
                className={type === 'file' ? className : `mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 sm:text-sm bg-white dark:bg-gray-800 dark:text-white transition-all duration-200 !ring-0 !outline-none ${className}`}
                {...props}
            />
        </div>
    )
}