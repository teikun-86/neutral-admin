import { sidebarState } from "@/atom"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"
import { useAuth } from "@/hooks/auth"
import useViewport from "@/hooks/viewport"
import { XMarkIcon } from "@heroicons/react/24/outline"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useRecoilState} from "recoil"

const AppLayout = ({ children, title = "Tripla", description, permissions = [] }) => {
    const router = useRouter()
    const { user, logout, checkRole, checkPermission } = useAuth({
        middleware: 'auth',
        permissions: ['dashboard-read']
    })
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState)

    const { width, handleResize } = useViewport({
        onResize: () => {
            if (width >= 1024) {
                setSidebarOpen(true)
            } else {
                setSidebarOpen(false)
            }
        }
    })

    const enableScroll = () => {
        document.body.style.overflow = "auto"
    }

    const disableScroll = () => {
        document.body.style.overflow = "hidden"
    }

    useEffect(() => {
        if (sidebarOpen && width <= 1024) {
            disableScroll()
        } else {
            enableScroll()
        }   
    }, [sidebarOpen, width])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            handleResize()
            setSidebarOpen(open => window.innerWidth >= 1024)
        }
    }, [])

    useEffect(() => {
        if (user) {
            if (permissions.length > 0 && !checkPermission(permissions)) {
                let rd = Array.isArray(permissions) ? permissions.join(',') : permissions
                window.location.href = `/403?intent=${router.asPath}&_rd=${btoa(rd)}`
            }
        }
    }, [user, permissions, router])
    
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>

            <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
                {
                    sidebarOpen && width <= 1024 && (
                        <div className="fixed w-full min-h-screen bg-black/50 z-[999]" onClick={() => setSidebarOpen(false)} />
                    )
                }
                <div className={`fixed z-[1000] top-0 ${sidebarOpen ? "left-0" : "-left-full"} w-[80%]  lg:w-1/5 transition-all`}>
                    <Sidebar setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} user={user} logout={logout} checkPermission={checkPermission} checkRole={checkRole} />
                </div>
                <div className={`${sidebarOpen ? "lg:pl-[20%]" : "w-full"} transition-all`}>
                    <Navbar user={user} logout={logout} checkPermission={checkPermission} checkRole={checkRole} />
                    
                    <div className="lg:p-12 py-6">{children}</div>
                </div>            
            </div>
        </>
    )
}

export default AppLayout