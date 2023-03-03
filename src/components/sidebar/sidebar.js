import { config, setTheme, splitString, truncateString } from "@/util"
import { ArrowLeftIcon, ArrowLeftOnRectangleIcon, BuildingOfficeIcon, CheckIcon, ChevronRightIcon, ComputerDesktopIcon, HomeIcon, MoonIcon, PaperAirplaneIcon, QueueListIcon, RectangleStackIcon, SunIcon, UserCircleIcon, XMarkIcon } from "@heroicons/react/24/outline"
import Image from "@/components/image"
import Link from "next/link"
import { useRouter } from "next/router"
import AppLogo from "../app-logo"
import { Dropdown } from "../dropdown"
import { Item } from "./item"
import { Title } from "./title"

export const Sidebar = ({ user, logout, checkPermission, setSidebarOpen, sidebarOpen }) => {
    const router = useRouter()

    const isAbleTo = (permission) => checkPermission(Array.isArray(permission) ? permission : [permission])
    
    return (
        <div className="w-full min-h-screen max-h-screen bg-white dark:bg-gray-900 shadow">
            <div className="flex items-center justify-between px-3 lg:px-0 space-x-2 lg:space-x-0">
                <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:!hidden btn-light dark:btn-dark !rounded-full !p-2">
                    <ArrowLeftIcon className="w-5 h-5" />
                </button>
                <Link href="/" className="p-2 mb-2 w-full">
                    <AppLogo className="w-32 ml-2" />
                </Link>
            </div>

            <nav className="w-full h-[76vh] overflow-y-auto overflow-x-hidden px-2 space-y-1 mb-1 gray-scrollbar">
                {
                    !user
                    ? (
                        [...Array(10)].map((_, i) => {
                            return (
                                <div key={i} className="w-full px-2 py-1 rounded-lg h-8 skeleton">
                                </div>
                            )
                        })
                    )
                    : (
                        <>
                            {
                                isAbleTo('dashboard-read') && (
                                    <Item active={router.pathname === '/dashboard'} href="/dashboard">
                                        <HomeIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                        <span>Dashboard</span>
                                    </Item>
                                )
                            }
                            {
                                isAbleTo("haji-umrah-read") && (
                                    <>
                                        <Title>Haji & Umrah</Title>
                                        {
                                            isAbleTo('haji-umrah.flight-read') && (
                                                <>
                                                    <Title className="flex items-center ml-2">
                                                        <span>Flight</span>
                                                    </Title>
                                                    <Item active={router.pathname === '/hajj-and-umrah/flight'} href="/hajj-and-umrah/flight">
                                                        <PaperAirplaneIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2 -rotate-[25deg]" />
                                                        <span>Flight</span>
                                                    </Item>
                                                </>
                                            )
                                        }
                                        {
                                            isAbleTo('haji-umrah.flight.reservation-read') && (
                                                <Item active={router.pathname === '/hajj-and-umrah/flight/reservations'} href="/hajj-and-umrah/flight/reservations">
                                                    <QueueListIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                                    <span>Reservations</span>
                                                </Item>
                                                
                                            )
                                        }
                                        {
                                            isAbleTo('haji-umrah.hotel-read') && (
                                                <>
                                                    <Title className="flex items-center ml-2">
                                                        <span>Hotel</span>
                                                    </Title>
                                                    <Item active={router.pathname === '/hajj-and-umrah/hotel'} href="/hajj-and-umrah/hotel">
                                                        <BuildingOfficeIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                                        <span>Hotel</span>
                                                    </Item>
                                                </>
                                            )
                                        }
                                        {
                                            isAbleTo('haji-umrah.hotel.reservation-read') && (
                                                <Item active={router.pathname === '/hajj-and-umrah/hotel/reservations'} href="/hajj-and-umrah/hotel/reservations">
                                                    <QueueListIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                                    <span>Reservations</span>
                                                </Item>
                                            )
                                        }
                                        {
                                            isAbleTo('haji-umrah.package-read') && (
                                                <>
                                                    <Title className="flex items-center ml-2">
                                                        <span>Package</span>
                                                    </Title>
                                                    <Item active={router.pathname === '/hajj-and-umrah/package'} href="/hajj-and-umrah/package">
                                                        <RectangleStackIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                                        <span>Package</span>
                                                    </Item>
                                                </>
                                            )
                                        }
                                        {
                                            isAbleTo('haji-umrah.package.reservation-read') && (
                                                <Item active={router.pathname === '/hajj-and-umrah/package/reservations'} href="/hajj-and-umrah/package/reservations">
                                                    <QueueListIcon className="w-5 h-5 opacity-30 group-hover:opacity-50 group-focus:opacity-60 group-active:opacity-70 mr-2" />
                                                    <span>Reservations</span>
                                                </Item>
                                            )
                                        }
                                    </>
                                )
                            }
                        </>
                    )
                }
            </nav>

            <div className="absolute bottom-0 w-full bg-gray-100 dark:bg-gray-700/30">
                {
                    !user
                    ? (
                        <div className="flex items-center w-full space-x-2 py-3 px-1">
                            <div className="flex flex-col items-end w-[calc(100%-4rem)] space-y-2">
                                <div className="w-[80%] p-2 skeleton"></div>
                                <div className="w-[50%] p-2 skeleton"></div>
                            </div>
                            <div className="w-10 h-10 rounded-full skeleton"></div>
                        </div>
                    )
                    : (
                        <Dropdown className="w-full">
                            <Dropdown.Button className="w-full">
                                <div className="flex items-center w-full space-x-2 py-3 text-end">
                                    <div className="flex flex-col items-end w-[calc(100%-4rem)]">
                                        <h6 className="text-gray-900 dark:text-white font-medium text-base">{truncateString(user.name, 16)}</h6>
                                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300 truncate">{splitString(user.email, 8, 10)}</p>
                                    </div>
                                    <Image src={user.avatar} className="w-10 h-10 object-cover rounded-full" alt={user.name} width={200} height={200} />
                                </div>
                            </Dropdown.Button>
                            <Dropdown.Content className="pt-0 right-2" position="top">
                                <a rel="noreferrer noopener" target="_blank" className="w-full flex mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-t" href={`${config('app.publicUrl')}/@me`}>
                                    <div className="w-1/4 grid place-items-center">
                                        <Image className="w-12 h-12 object-cover rounded-full" src={user.avatar} alt={user.name} width={100} height={100} />
                                    </div>
                                    <div className="w-3/4 px-2 py-2">
                                        <p className="text-sm font-medium truncate text-gray-900 dark:text-white">{truncateString(user.name, 16)}</p>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 truncate">{splitString(user.email, 8, 10)}</p>
                                    </div>
                                </a>
                                <Title className="m-2">Theme</Title>
                                <Dropdown.Item onClick={() => setTheme('dark')} className="flex items-center justify-between space-x-2">
                                    <div className="flex items-center space-x-2">
                                        <MoonIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
                                        <p className="text-sm font-medium">Dark</p>
                                    </div>
                                    <CheckIcon className="w-5 h-5 dark:block hidden" />
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setTheme('light')} className="flex items-center justify-between space-x-2">
                                    <div className="flex items-center space-x-2">
                                        <SunIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
                                        <p className="text-sm font-medium">Light</p>
                                    </div>
                                    <CheckIcon className="w-5 h-5 dark:hidden" />
                                </Dropdown.Item>
                                <Dropdown.Item onClick={() => setTheme('system')}>
                                    <ComputerDesktopIcon className="w-5 h-5 mr-2" />
                                    <span>System</span>
                                </Dropdown.Item>
                                <Title className="m-2">Account</Title>
                                <Dropdown.Item as="a" target="_blank" rel="noreferrer noopener" href={`${config('app.publicUrl')}/@me`}>
                                    <UserCircleIcon className="w-5 h-5 mr-2" />
                                    <span>Profile</span>
                                </Dropdown.Item>
                                <Dropdown.Item onClick={logout}>
                                    <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-2" />
                                    <span>Logout</span>
                                </Dropdown.Item>
                            </Dropdown.Content>
                        </Dropdown>
                    )
                }
            </div>
        </div>
    )
}