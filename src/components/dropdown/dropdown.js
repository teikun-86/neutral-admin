import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

const Dropdown = ({ className, ...props}) => {
    return (
        <Menu as="div" className={`!relative inline-block text-left ${className}`}>
            {
                props.children
            }
        </Menu>
    )
}

const Button = (props) => {
    return (
        <Menu.Button {...props}>
            {props.children}
        </Menu.Button>
    )
}

const Content = ({className = "", afterLeave = () => {}, position = "bottom", ...props}) => {
    const positionClasses = {
        bottom: "right-0 origin-top-right",
        top: "origin-bottom-right right-0 inset-auto bottom-0 -translate-y-1/4",
    }
    
    return (
        <Transition
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
            afterLeave={afterLeave}
        >
            <Menu.Items className={`absolute mt-2 w-56 ${positionClasses[position]} rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 py-1 ${className} dark:bg-gray-1000`} {...props}>
                <div className="relative w-full h-full z-20">
                    {props.children}
                </div>
            </Menu.Items>
        </Transition>
    )
}

const Item = ({ className = "", as = "button", ...props }) => {
    return (
        <Menu.Item as={as} className={`w-full bg-white hover:bg-gray-50 focus:bg-gray-100 dark:bg-gray-1000 dark:hover:bg-gray-800 flex items-center dark:focus:bg-gray-800 dark:text-gray-100 px-2 py-1  transition-all duration-100 disabled:opacity-50 disabled:cursor-not-allowed ${className}`} {... props}>
            {props.children}
        </Menu.Item>
    )
}

const Divider = ({ className = "", ...props }) => {
    return (
        <div className={`w-full border-t my-1 border-gray-300/60 dark:border-gray-700/70`} {... props}>
        </div>
    )
}

Dropdown.Content = Content
Dropdown.Divider = Divider
Dropdown.Button = Button
Dropdown.Item = Item

export { Dropdown }