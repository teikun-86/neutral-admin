import Metadata from '@/components/metadata'
import { useRouter } from 'next/router'

const GuestLayout = ({ children, title = "Tripla", description = "Tripla Dashboard", image = undefined }) => {
    const router = useRouter()
    
    return (
        <>
            <Metadata
                title={title}
                description={description}
                image={image}
                url={router.asPath}
            />
            <div className="font-sans text-gray-900 bg-gray-100 dark:bg-gray-800 min-h-screen antialiased">
                {children}
            </div>
        </>
    )
}

export default GuestLayout