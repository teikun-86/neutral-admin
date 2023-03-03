import { useState } from "react"

export const Switch = ({
    checked,
    value,
    onChange,
    className,
    label,
    name,
    id,
    ...props
}) => {
    const [isChecked, setIsChecked] = useState(checked)
    
    const handleChange = (e) => {
        setIsChecked(e.target.checked)
        onChange(e)
    }

    return (
        <div className="flex items-center">
            <input
                type="checkbox"
                name={name}
                id={id}
                checked={checked}
                value={value}
                onChange={handleChange}
                className={`form-checkbox h-5 w-5 text-gray-600 dark:text-gray-400 transition-all duration-200 hidden ${className}`}
                {...props}
            />
            <label htmlFor={id} className="flex items-center text-sm text-gray-900 dark:text-gray-300 select-none">
                <div className={`relative w-10 h-6 rounded-full p-1 transition-colors ${isChecked ? "bg-rose-500" : "bg-gray-200 dark:bg-gray-700"} mr-3`}>
                    <div className={`w-4 h-4 transition-all duration-200 transform rounded-full bg-white shadow ${isChecked ? "translate-x-4" : "translate-x-0"}`}></div>
                </div>
                {label}
            </label>
        </div>
    )
}