import { Fragment } from 'react'
import { Combobox as Combo, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'
import { randomString } from '@/util'

const Combobox = (props) => {

    return (
        <div className="block w-full relative">
            <Combo {...props}>
                <div className="relative">
                    {
                        props.children
                    }
                </div>
            </Combo>
        </div>
    )
}

const Input = ({ showButton = false, label = "", className = "", ...props }) => {
    const inputId = randomString(16)

    return (
        <div className="relative w-full overflow-hidden">
            <Combo.Button as="div" className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300" htmlFor={inputId}>{label}</label>
                <Combo.Input id={inputId} className={`mt-1 block w-full py-2 px-3 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:border-gray-500 dark:focus:border-gray-400 sm:text-sm bg-white dark:bg-gray-800 dark:text-white transition-all duration-200 !ring-0 !outline-none ${className}`} {...props} />
                {
                    showButton && (
                        <ChevronUpDownIcon
                            className="h-5 w-5 text-gray-400 absolute right-2 bottom-2"
                            aria-hidden="true"
                        />
                    )
                }
            </Combo.Button>
        </div>
    )
}

const Container = ({ className = "", afterLeave = () => { }, ...props }) => {
    return (
        <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            afterLeave={afterLeave}
        >
            <div className={`w-full bg-white dark:bg-gray-800 dark:text-white py-1 rounded-lg overflow-hidden block absolute z-[100] shadow-lg right-0 ${className}`}>
                {props.children}
            </div>
        </Transition>
    )
}

const Options = ({ className, ...props }) => {
    return (
        <Combo.Options className={`max-h-80 w-full overflow-y-auto overflow-x-hidden bg-white dark:bg-gray-800 py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm gray-scrollbar ${className}`} {...props}>
            {props.children}
        </Combo.Options>
    )
}

const Header = (props) => {
    let { className } = props

    return (
        <div {...props} className={`${className} px-3 py-2 border-b border-gray-300/30`}>
            {props.children}
        </div>
    )
}

const Footer = (props) => {
    let { className } = props

    return (
        <div {...props} className={`${className} w-full px-3 py-2 mt-2 bg-gray-100 dark:bg-gray-800`}>
            {props.children}
        </div>
    )
}

const Option = ({ className = "", disabled = false, ...props }) => {
    return (
        <Combo.Option disabled={disabled} className={({ active }) => `btn-light dark:btn-dark !w-full !justify-start !border-0 ${className} ${active ? "bg-rose-50 dark:bg-gray-700" : ""} ${disabled ? "opacity-60 !cursor-not-allowed" : ""}`} {...props}>
            {props.children}
        </Combo.Option>
    )
}

Combobox.Input = Input
Combobox.Container = Container
Combobox.Option = Option
Combobox.Options = Options
Combobox.Footer = Footer
Combobox.Header = Header

export default Combobox