import {
    CheckCircleIcon,
    ExclamationCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';

const Alert = ({ type = "primary", className = "", title, ...props }) => {
    const classes = {
        primary: {
            border: "border-sky-500",
            body: "bg-sky-100 dark:bg-sky-50/10",
            icon: <InformationCircleIcon className="w-8 h-8 text-sky-600" />,
            title: "text-sky-600"
        },
        warning: {
            border: "border-yellow-400",
            body: "bg-yellow-100 dark:bg-yellow-50/10",
            icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-400" />,
            title: "text-yellow-500"
        },
        success: {
            border: "border-emerald-500",
            body: "bg-emerald-100 dark:bg-emerald-50/10",
            icon: <CheckCircleIcon className="w-8 h-8 text-emerald-600" />,
            title: "text-emerald-600"
        },
        error: {
            border: "border-rose-600",
            body: "bg-rose-100 dark:bg-rose-50/10",
            icon: <ExclamationCircleIcon className="w-8 h-8 text-rose-600" />,
            title: "text-rose-600"
        },
    };

    return (
        <div className={`w-full rounded-lg border-0 border-l-4 my-2 p-2 flex items-center text-start ${classes[type].border} ${className} ${classes[type].body}`}>
            {classes[type].icon}
            <div className="block ml-3 w-[calc(100%-2.3rem)]">
                {
                    title && (
                        <h6 className={`text-base font-semibold tracking-wide ${classes[type].title}`}>{title}</h6>
                    )
                }
                <p className="text-gray-800 text-sm font-medium dark:text-gray-200">{props.children}</p>
            </div>
        </div>
    );
};

export default Alert;