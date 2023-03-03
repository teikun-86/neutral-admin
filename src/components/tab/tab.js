import { Tab as ParentTab, Transition } from "@headlessui/react"

const Tab = ({
    children,
    className = "",
    vertical = false,
    defaultIndex = 0,
    selectedIndex = undefined,
    ...options
}) => {
    return (
        <ParentTab.Group 
            as="div"
            onChange={options.onChange ? options.onChange : () => {}}
            className={`w-full ${className}`}
            vertical={vertical}
            defaultIndex={defaultIndex}
            selectedIndex={selectedIndex}
            {...options}
            >
            {children}
        </ParentTab.Group>
    )
}

const List = ({ children, className = "", ...options }) => {
    return (
        <ParentTab.List className={`flex w-full rounded-lg p-2 ${className}`} {...options}>
            {children}
        </ParentTab.List>
    )
}

const Item = ({ children, className = "", ...options }) => {
    return (
        <ParentTab className={({ selected }) => 
                `
                flex-1 ${selected 
                    ? 'btn-light dark:btn-dark dark:border-gray-800' 
                    : 'text-gray-700 !outline-none dark:outline-none dark:text-gray-300'}
                    !rounded-full mx-2 ${className}
                `
            }
            {...options}
        >
            {children}
        </ParentTab>
    )
}

const Panel = ({ children, className = "", ...options }) => {
    return (
        <ParentTab.Panel className={`w-full ${className}`} {...options}>
            {({selected}) => (
                <Transition
                    appear
                    show={selected}
                    enter="transition ease-out duration-100"
                    enterFrom="transform -translate-x-10"
                    enterTo="transform translate-y-0"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform translate-y-0"
                    leaveTo="transform translate-x-10"
                >
                    {children}
                </Transition>
            )}
        </ParentTab.Panel>
    )
}

const Panels = ({ children, className = "", ...options }) => {
    return (
        <ParentTab.Panels className={`w-full ${className}`} {...options}>
            {children}
        </ParentTab.Panels>
    )
}

Tab.List = List
Tab.Item = Item
Tab.Panel = Panel
Tab.Panels = Panels

export { Tab }