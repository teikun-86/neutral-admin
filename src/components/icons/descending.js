import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

export const DescendingIcon = ({ className = "", iconClasses = "", ...props }) => {
    return (
        <div className={`flex flex-col items-center justify-center space-y-0 ${className}`}>
            <ChevronUpIcon className={`${iconClasses} opacity-30`} {...props} />
            <ChevronDownIcon className={`${iconClasses}`} {...props} />
        </div>
    )
}