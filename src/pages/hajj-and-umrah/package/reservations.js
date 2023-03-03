import { modalState } from "@/atom";
import { Dropdown } from "@/components/dropdown";
import { CreatePackageReservation, PackagePayment } from "@/components/form";
import { UpdatePackageReservation } from "@/components/form/haji-umrah/update-package-reservation";
import { AscendingIcon } from "@/components/icons/ascending";
import { DescendingIcon } from "@/components/icons/descending";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { PackageReservationColumn } from "@/components/table/package-reservation";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/layouts/app";
import { axios } from "@/libs/axios";
import { BanknotesIcon, CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

const Reservation = () => {
    const { checkPermission } = useAuth()
    const setModalState = useSetRecoilState(modalState)
    const checkAllRef = useRef(null)
    const [reservation, setReservation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setdeleting] = useState(false)
    const [query, setQuery] = useState("")
    const [selected, setSelected] = useState([])
    const [reservations, setReservations] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [orderBy, setOrderBy] = useState({ column: 'created_at', direction: 'desc' })
    
    const getReservations = useCallback(async () => {
        setLoading(true)
        await axios.get("/hajj-umrah/packages/reservations", {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
            }
        }).then(res => {
            setReservations(res.data.reservations)
            setLoading(false)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch reservations. Please try again later.")
        })
    }, [orderBy])
    
    const sortBy = (column, direction) => setOrderBy({ column, direction })

    const select = id => setSelected([...selected, id])
    const unselect = id => setSelected(selected.filter(item => item !== id))
    const selectAll = () => setSelected(reservations.map(item => item.id))
    const unselectAll = () => setSelected([])

    const queriedReservations = query.trim().length === 0 ? reservations : reservations

    const allChecked = selected.length > 0 && selected.length === queriedReservations.length
    
    const updateReservation = res => {
        setReservation(res)
        console.log({res});
        setModalState('updatePackageReservationModal')
    }

    const deleteReservation = ids => {
        setToDelete(Array.isArray(ids) ? ids : [ids])
        setModalState('deletePackageReservationModal')
    }

    const deleteReservations = async () => {
        setdeleting(true)
        await axios.delete("/hajj-umrah/packages/reservations/destroy", {
            params: {
                ids: toDelete
            }
        }).then(res => {
            setdeleting(false)
            setToDelete([])
            getReservations()
            toast.success("Reservations deleted successfully.")
            setModalState('')
            setSelected([])
        }).catch(err => {
            setdeleting(false)
            toast.error("Failed to delete reservations. Please try again later.")
        })
    }

    const addPayment = res => {
        setReservation(res)
        setModalState('addPackageReservationPaymentModal')
    }

    useEffect(() => {
        getReservations()
    }, [getReservations])

    useEffect(() => {
        if (checkAllRef.current) {
            checkAllRef.current.indeterminate = selected.length > 0 && selected.length < queriedReservations.length
        }
    }, [selected])

    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Package Reservations</h2>

            <div className="w-full my-2">
                <div className="relative w-full">
                    <input placeholder="Search" type="text" name="search" id="search" value={query} onChange={(e) => {
                        setQuery(e.target.value)
                        setSelected([])
                    }} className="w-full border-b border-gray-600 dark:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-all bg-transparent border-0 focus:outline-none focus:ring-0 ring-0 outline-none peer/search" />
                    <MagnifyingGlassIcon className="absolute right-2 bottom-2 w-6 h-6 text-gray-900 dark:text-white peer-focus/search:opacity-80 transition-opacity opacity-50" />
                </div>
            </div>

            <div className="flex items-center justify-end my-2 px-2 lg:px-0 space-x-2 flex-wrap">
                {
                    checkPermission('haji-umrah.package.reservation-create') && (
                        <button onClick={() => setModalState('createPackageReservationModal')} className="btn-light dark:btn-dark">Create Reservation</button>
                    )
                }
                {
                    checkPermission('haji-umrah.package.reservation-delete') && (
                        <Dropdown className="z-30">
                            <Dropdown.Button disabled={selected.length === 0} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5 ml-2" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Item className="space-x-2" onClick={() => deleteReservation(selected)}>
                                    <TrashIcon className="w-5 h-5 opacity-50" />
                                    <span>Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Content>
                        </Dropdown>
                    )
                }
                <Dropdown className="z-30">
                    <Dropdown.Button className="btn-light dark:btn-dark justify-between">
                        <span>Order By</span>
                        <ChevronDownIcon className="w-5 h-5 ml-2" />
                    </Dropdown.Button>
                    <Dropdown.Content>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('created_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Created At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('created_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Created At</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('price_per_package', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <BanknotesIcon className="w-5 h-5 opacity-50" />
                                <span>Price</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('price_per_package', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <BanknotesIcon className="w-5 h-5 opacity-50" />
                                <span>Price</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                    </Dropdown.Content>
                </Dropdown>
            </div>

            <div className="w-full lg:rounded-lg shadow bg-white dark:bg-gray-900 px-2 lg:px-4 py-2">
                <div className="w-full max-w-full overflow-x-auto gray-scrollbar lg:px-2 overflow-y-auto max-h-[80vh]">
                    <table className={`w-full whitespace-nowrap ${loading ? "border-separate" : ""}`}>
                        <thead>
                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-500 [&_>_th]:font-medium [&_>_th]:text-xs [&_>_th]:tracking-wider [&_>_th]:uppercase [&_>_th]:text-start">
                                {
                                    checkPermission('haji-umrah.hotel.reservation-delete') && (
                                        <th className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                            <input ref={checkAllRef} type="checkbox" className="form-checkbox" name="selectall" id="selectAll" checked={allChecked} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} disabled={loading || queriedReservations.length === 0} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">User</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Airline</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Flight Number</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check In At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check Out At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Room Detail</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Program Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Status</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Price/package</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Total Price</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Amount Paid</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Amount Due</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                            {
                                loading
                                    ? (
                                        <>
                                            {
                                                [...Array(10)].map((_, i) => (
                                                    <tr key={i} className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                        <td>
                                                        </td>
                                                        <td></td>
                                                        <td colSpan={12} className="skeleton"></td>
                                                    </tr>
                                                ))
                                            }
                                        </>
                                    )
                                    : (
                                        queriedReservations.length === 0
                                            ? (
                                                <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                    <td colSpan={10} className="text-center">No reservation found</td>
                                                </tr>
                                            )
                                            : queriedReservations.map((reservation, i) => (
                                                <PackageReservationColumn
                                                    key={i}
                                                    res={reservation}
                                                    checkPermission={checkPermission}
                                                    select={select}
                                                    unselect={unselect}
                                                    selected={selected}
                                                    loading={loading}
                                                    addPayment={addPayment}
                                                    deleteReservation={deleteReservation}
                                                    updateReservation={updateReservation}
                                                />
                                            ))
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {
                checkPermission('haji-umrah.package.reservation-create') && (
                    <CreatePackageReservation refetch={getReservations} />
                )
            }

            {
                checkPermission('haji-umrah.package.reservation-delete') && (
                    <Modal id="deletePackageReservationModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Package Reservation?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{toDelete.length} Package Reservation{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{toDelete.length} Package Reservation{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => deleteReservations()} className="btn-light mt-3 border-0 dark:btn-dark !w-full !relative">
                                Delete Them
                                <ExclamationTriangleIcon className="w-5 h-5 opacity-30 text-rose-600 absolute right-2 bottom-2" />
                            </button>
                        </Modal.Footer>
                    </Modal>
                )
            }

            {
                checkPermission('haji-umrah.package.reservation-add-payment') && reservation && (
                    <PackagePayment reservation={reservation} setReservation={setReservation} refetch={getReservations} />
                )
            }

            {
                checkPermission('haji-umrah.package.reservation-update') && reservation && (
                    <UpdatePackageReservation reservation={reservation} setReservation={setReservation} refetch={getReservations} />
                )
            }
        </>
    );
};

Reservation.getLayout = page => <AppLayout title="Package Reservation" permissions={['haji-umrah.package.reservation-read']}>{page}</AppLayout>

export default Reservation;