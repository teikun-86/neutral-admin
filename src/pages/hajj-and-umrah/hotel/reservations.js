import { modalState } from "@/atom";
import { Dropdown } from "@/components/dropdown";
import { CreateHotelReservation, HotelPayment, UpdateHotelReservation } from "@/components/form";
import { AscendingIcon } from "@/components/icons/ascending";
import { DescendingIcon } from "@/components/icons/descending";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { HotelReservationColumn } from "@/components/table/hotel-reservation";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/layouts/app";
import { axios } from "@/libs/axios";
import { searchString } from "@/util";
import { BanknotesIcon, CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

const Reservation = () => {
    const setModalState = useSetRecoilState(modalState)
    const { checkPermission } = useAuth()
    const checkAllRef = useRef(null)
    const [query, setQuery] = useState('')
    const [reservations, setReservations] = useState([])
    const [reservation, setReservation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selected, setSelected] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [orderBy, setOrderBy] = useState({
        column: 'created_at',
        direction: 'desc'
    })

    const getReservations = useCallback(async () => {
        setLoading(true)
        await axios.get("/hajj-umrah/hotels/reservations", {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
            }
        }).then(res => {
            setLoading(false)
            setReservations(res.data.reservations)
        }).catch(err => {
            setLoading(false)
            toast.error(err.response.data.message)
        })
    }, [orderBy])

    const queriedReservations = query.trim().length === 0 ? reservations : reservations.filter(res => {
        console.log({res});
        return searchString(query, res.user.name)
            || searchString(query, res.user.email)
            || searchString(query, res.user.phone ?? '')
            || searchString(query, res.hotel.location_1)
            || searchString(query, res.hotel.location_2)
            || searchString(query, res.company.name)
            || searchString(query, res.company.ppiu_number)
            || searchString(query, moment(res.hotel.first_check_in_at).format("DD MMMM YYYY"))
            || searchString(query, moment(res.hotel.first_check_out_at).format("DD MMMM YYYY"))
    })

    const allChecked = selected.length === queriedReservations.length && selected.length > 0

    const selectAll = () => setSelected(queriedReservations.map(res => res.id))

    const unselectAll = () => setSelected([])

    const select = id => setSelected([...selected, id])

    const unselect = id => setSelected(selected.filter(selectedId => selectedId !== id))

    const sortBy = (column, direction) => setOrderBy({ column, direction })

    const deleteReservation = (ids) => {
        setToDelete(Array.isArray(ids) ? ids : [ids])
        setModalState('deleteHotelReservationModal')
    }

    const deleteReservations = async () => {
        setDeleting(true)
        await axios.delete("/hajj-umrah/hotels/reservations/destroy", {
            params: {
                ids: toDelete
            }
        }).then(res => {
            setToDelete([])
            setDeleting(false)
            setModalState('')
            toast.success(res.data.message)
            getReservations()
            setSelected([])
        }).catch(err => {
            setDeleting(false)
            toast.error(err.response.data.message)
        })
    }
    
    const updateReservation = reservation => {
        setReservation(reservation)
        setModalState('updateHotelReservationModal')
    }

    const addPayment = res => {res
        console.log("add payment for reservation: ", res);
        setReservation(res)
        setModalState('createHotelReservationPaymentModal')
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
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Hotel Reservations</h2>

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
                    checkPermission('haji-umrah.hotel.reservation-create') && (
                        <button onClick={() => setModalState('createHotelReservationModal')} className="btn-light dark:btn-dark">Create Reservation</button>
                    )
                }
                {
                    checkPermission('haji-umrah.hotel.reservation-delete') && (
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
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">User</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Company</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check In At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check Out At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Status</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Room Detail</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Program Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Price/package</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Amount</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Total Price</th>
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
                                                        <td colSpan={9} className="skeleton"></td>
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
                                            <HotelReservationColumn
                                                key={i}
                                                res={reservation}
                                                select={select}
                                                selected={selected}
                                                loading={loading}
                                                unselect={unselect}
                                                checkPermission={checkPermission}
                                                updateReservation={updateReservation}
                                                deleteReservation={deleteReservation}
                                                addPayment={addPayment}
                                            />
                                        ))
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {
                checkPermission('haji-umrah.hotel.reservation-create') && (
                    <CreateHotelReservation refetch={getReservations} />
                )
            }

            {
                checkPermission('haji-umrah.hotel.reservation-update') && reservation && (
                    <UpdateHotelReservation refetch={getReservations} reservation={reservation} setReservation={setReservation} />
                )
            }

            {
                checkPermission('haji-umrah.hotel.reservation-delete') && (
                    <Modal id="deleteHotelReservationModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Hotel Reservation?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{toDelete.length} Hotel Reservation{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{toDelete.length} Hotel Reservation{toDelete.length > 1 ? 's' : ''}</strong>?</p>
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
                checkPermission('haji-umrah.hotel.reservation-add-payment') && reservation && (
                    <HotelPayment reservation={reservation} setReservation={setReservation} refetch={getReservations} />
                )
            }
        </>
    );
};

Reservation.getLayout = page => <AppLayout title="Hotel Reservations" permissions={['haji-umrah.hotel.reservation-read']}>{page}</AppLayout>;

export default Reservation;