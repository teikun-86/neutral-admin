export const Title = ({ children, className, ...props }) => {
    return (
        <h6 className={`text-xs font-medium text-gray-600 dark:text-gray-300 uppercase my-2 ${className}`} {...props}>
            {children}
        </h6>
    )
}