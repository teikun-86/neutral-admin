import { sidebarState } from "@/atom"
import useViewport from "@/hooks/viewport"
import { config, setTheme, splitString, truncateString } from "@/util"
import { ArrowLeftOnRectangleIcon, Bars3Icon, CheckIcon, ComputerDesktopIcon, MoonIcon, SunIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import Image from "@/components/image"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import { Dropdown } from "../dropdown"
import { Title } from "../sidebar"

export const Navbar = ({ user, logout }) => {
    const [opacity, setOpacity] = useState(0)
    const [sidebarOpen, setSidebarOpen] = useRecoilState(sidebarState)
    const [currentTheme, setCurrentTheme] = useState('light')

    const { scroll } = useViewport({
        onScroll: () => {
            let opc = scroll.y / 200
            setOpacity(opc >= 1 ? 1 : opc)
        }
    })

    useEffect(() => {
        setCurrentTheme(localStorage.getItem('theme') ?? 'system')
    }, [])

    return (
        <div className="w-full flex items-center justify-between py-2 px-4 ">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="bg-gray-50 dark:bg-gray-800 p-2 focus:outline-none outline-none">
                <Bars3Icon className="w-6 h-6" />
            </button>
            <div className="flex items-center justify-end space-x-3">
                {/* <Dropdown className="mx-3">
                    <Dropdown.Button className="h-full">
                        <SunIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
                    </Dropdown.Button>
                    <Dropdown.Content>
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
                        <Dropdown.Item onClick={() => setTheme('system')} className="flex items-center justify-start space-x-2">
                            <ComputerDesktopIcon className="w-6 h-6 text-gray-800 dark:text-gray-100" />
                            <p className="text-sm font-medium">System</p>
                        </Dropdown.Item>
                    </Dropdown.Content>
                </Dropdown> */}
                {
                    user
                        ? (
                            <Dropdown className="z-[100]">
                                <Dropdown.Button>
                                    <Image src={user.avatar} alt={user.name} className="w-8 h-8 object-cover rounded-full" width={200} height={200} />
                                </Dropdown.Button>
                                <Dropdown.Content className="pt-0">
                                    <a target="_blank" className="w-full flex mb-2 px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded-t" href={`${config('app.publicUrl')}/@me`} rel="noreferrer noopener">
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
                        : (
                            <div className="w-8 h-8 rounded-full skeleton"></div>
                        )
                }
            </div>
        </div>
    )
}