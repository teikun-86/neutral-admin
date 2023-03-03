import { modalState } from "@/atom"
import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useEffect, useState } from "react"
import { useRecoilState } from "recoil"

const defaultProps = {
    size: "md",
    static: false,
    id: '',
    title: undefined,
    footer: <></>,
    onClose: () => {}
}

const Modal = (props = defaultProps) => {
    const [open, setOpen] = useState(false)
    const [modalOpen, setModalOpen] = useRecoilState(modalState)

    useEffect(() => {

        setOpen(modalOpen === props.id)

        return () => {
        }
    }, [modalOpen, props.id])

    const closeModal = () => {
        setModalOpen('')
    }

    const sizeClasses = () => {
        switch (props.size) {
            case 'sm':
                return "w-full md:w-2/3 lg:w-1/3 xl:w-1/4"

            case 'lg':
                return "w-full md:w-1/2 xl:w-2/3"

            case 'xl':
                return "w-full md:w-2/3 xl:w-3/4"

            default:
            case 'md':
                return "w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
        }
    }

    return (
        <Transition appear show={open} as={Fragment} afterLeave={props.onClose ? props.onClose : () => {}}>
            <Dialog id={props.id} as="div" className="relative z-[1001]" onClose={() => props.static ? {} : closeModal()}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <Dialog.Overlay className={`fixed inset-0 bg-gray-700/20 dark:bg-black/70 backdrop-blur-sm ${props.static ? "pointer-events-none" : ""}`} />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-[1.05]"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-[1.05]"
                        >
                            <Dialog.Panel className={`${sizeClasses()} transform transition-all relative`}>
                                {
                                    props.clean === true
                                        ? props.children
                                        : (
                                            <div className="w-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                                                {props.children}
                                            </div>
                                        )
                                }
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

const Header = ({ className = "", ...props }) => {
    return (
        <div className={`py-3 px-4 relative ${className}`} { ...props }>
            {props.children}
        </div>
    )
}

const Body = ({className = "", ...props}) => {
    return (
        <div className={`py-3 px-4 relative ${className}`} { ...props }>
            {props.children}
        </div>
    )
}

const Footer = props => {
    return (
        <div className={`py-2 px-4 bg-gray-100 dark:bg-gray-800 sticky bottom-0 ${props.className}`}>
            {props.children}
        </div>
    )
}

const Title = props => {
    return (
        <h4 className={`text-lg font-semibold text-gray-900 dark:text-white ${props.className}`} {...props}>
            {props.children}
        </h4>
    )
}

Modal.Header = Header
Modal.Body = Body
Modal.Footer = Footer
Modal.Title = Title

export {
    Modal
}