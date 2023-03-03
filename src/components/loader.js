export default function Loader({ className, ...props }) {
    return (
        <svg viewBox="0 0 50 50" className={`animate-spin-slow ${className}`} { ...props }>
            <circle fill="transparent" stroke="currentColor" strokeWidth="4px" className="animate-spinner" cx={25} cy={25} r={18} strokeDasharray="113.097" strokeLinecap="round" />
        </svg>
    )
}