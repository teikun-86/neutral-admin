import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline"

export const AscendingIcon = ({className = "", iconClasses = "", ... props}) => {
    return (
        <div className={`flex flex-col items-center justify-center space-y-0 ${className}`}>
            <ChevronUpIcon className={`${iconClasses}`} {... props} />
            <ChevronDownIcon className={`${iconClasses} opacity-30`} {... props} />
        </div>
    )
}