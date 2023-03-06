import { Dropdown } from "@/components/dropdown"
import { useAuth } from "@/hooks/auth"
import AppLayout from "@/layouts/app"
import { axios } from "@/libs/axios"
import { config, formatIDR, searchString, splitString, truncateString } from "@/util"
import { ArrowRightIcon, ArrowsRightLeftIcon, ArrowTopRightOnSquareIcon, CalendarDaysIcon, ChevronDownIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import Image from "@/components/image"
import { Fragment, useCallback, useEffect, useRef, useState } from "react"
import { toast } from "react-toastify"
import { CreateFlightReservation, FlightPayment, UpdateFlightReservation } from "@/components/form"
import { useSetRecoilState } from "recoil"
import { modalState } from "@/atom"
import { Modal } from "@/components/modal"
import Loader from "@/components/loader"
import { Tab } from "@/components/tab"
import Link from "next/link"
import { FlightReservationColumn } from "@/components/table/flight-reservation"
import { DescendingIcon } from "@/components/icons/descending"
import { AscendingIcon } from "@/components/icons/ascending"

const Reservations = () => {
    const { checkPermission } = useAuth()
    const setModalState = useSetRecoilState(modalState)
    const checkAllRef = useRef(null)
    const [query, setQuery] = useState('')
    const [reservations, setReservations] = useState([])
    const [reservation, setReservation] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [validating, setValidating] = useState(false)
    const [selected, setSelected] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [orderBy, setOrderBy] = useState({
        column: 'created_at',
        direction: 'asc'
    })

    const [toValidate, setToValidate] = useState(null)

    const queriedReservations = query.trim().length === 0 ? reservations : reservations.filter(reservation => {
        return searchString(query, reservation.company.name)
            || searchString(query, reservation.company.email)
            || searchString(query, reservation.company.ppiu)
            || searchString(query, reservation.user.name)
            || searchString(query, reservation.user.email)
            || searchString(query, reservation.flight.airline.name)
            || searchString(query, reservation.flight.airline.code)
            || searchString(query, `${reservation.flight.airline.code}-${reservation.flight.flight_number}`)
            || searchString(query, `${reservation.flight.airline.code}-${reservation.flight.return_flight_number}`)
            || searchString(query, reservation.flight.departure_airport.name)
            || searchString(query, reservation.flight.arrival_airport.name)
            || searchString(query, reservation.flight.departure_airport.city.name)
            || searchString(query, reservation.flight.arrival_airport.city.name)
            || searchString(query, reservation.flight.departure_airport.country.name)
            || searchString(query, reservation.flight.arrival_airport.country.name)
            || searchString(query, reservation.flight.return_departure_airport.name)
            || searchString(query, reservation.flight.return_arrival_airport.name)
            || searchString(query, reservation.flight.return_departure_airport.city.name)
            || searchString(query, reservation.flight.return_arrival_airport.city.name)
            || searchString(query, reservation.flight.return_departure_airport.country.name)
            || searchString(query, reservation.flight.return_arrival_airport.country.name)
    })

    const checkedAll = selected.length === queriedReservations.length && selected.length > 0

    const getReservations = useCallback(async () => {
        setLoading(true)
        setSelected([])
        await axios.get('/hajj-umrah/flights/reservations', {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
            }
        }).then(res => {
            setReservations(res.data.reservations)
            setLoading(false)
        }).catch(err => {
            toast.error(err.response.data.message)
            setLoading(false)
        })
    }, [orderBy])

    const sortBy = (column, direction) => {
        setOrderBy({
            column,
            direction
        })
    }

    const selectAll = () => {
        setSelected(queriedReservations.map(reservation => reservation.id))
    }

    const unselectAll = () => {
        setSelected([])
    }

    const select = (id) => setSelected([...selected, id])

    const unselect = (id) => setSelected(selected.filter(selectedId => selectedId !== id))

    const reservationDetail = (reservation) => {
        setReservation(reservation)
        setModalState('flightReservationDetailModal')
    }

    const updateReservation = (reservation) => {
        setReservation(reservation)
        console.log({reservation});
        setModalState('updateFlightReservationModal')
    }

    const deleteReservation = (reservation_id) => {
        setToDelete(
            Array.isArray(reservation_id) ? reservation_id : [reservation_id]
        )
        setModalState('deleteFlightReservationModal')
    }

    const deleteReservations = async () => {
        setDeleting(true)
        await axios.delete('/hajj-umrah/flights/reservations/delete', {
            params: {
                ids: toDelete
            }
        }).then(res => {
            setDeleting(false)
            getReservations()
            setModalState(null)
            toast.success(res.data.message)
            setToDelete([])
        }).catch(err => {
            setDeleting(false)
            toast.error(err.response.data.message)
        })
    }

    const addPayment = (res) => {
        setReservation(res)
        setModalState('createFlightReservationPaymentModal')
    }

    const validatePayment = (code) => {
        setToValidate(code)
        setModalState('validateFlightReservationPaymentModal')
    }

    const doValidatePayment = async () => {
        console.log({
            toValidate
        });
        setValidating(true)
        await axios.post("/payment/validate", {
            payment_code: toValidate
        }).then(res => {
            setValidating(false)
            setModalState('')
            toast.success(res.data.message)
            getReservations()
        }).catch(err => {
            setValidating(false)
            toast.error(err.response.data.message)
        })
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
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Flight Reservations</h2>
            <div className="w-full my-2">
                <div className="relative w-full">
                    <input placeholder="Search" type="text" name="search" id="search" value={query} onChange={(e) => {
                        setQuery(e.target.value)
                        setSelected([])
                    }} className="w-full border-b border-gray-600 dark:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-all bg-transparent border-0 focus:outline-none focus:ring-0 ring-0 outline-none peer/search" />
                    <MagnifyingGlassIcon className="absolute right-2 bottom-2 w-6 h-6 text-gray-900 dark:text-white peer-focus/search:opacity-80 transition-opacity opacity-50" />
                </div>
            </div>

            <div className="w-full flex items-center justify-end my-2 space-x-2">
                {
                    checkPermission('haji-umrah.flight.reservation-create') && (
                        <button onClick={() => setModalState('createFlightReservationModal')} className="btn-light dark:btn-dark">Add Reservation</button>
                    )
                }
                {
                    checkPermission('haji-umrah.flight.reservation-delete') && (
                        <Dropdown className="z-50">
                            <Dropdown.Button disabled={selected.length === 0 || loading} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Content>
                                    <Dropdown.Item className="space-x-2" onClick={() => deleteReservation(selected)}>
                                        <TrashIcon className="w-5 h-5 opacity-50" />
                                        <span>Delete</span>
                                    </Dropdown.Item>
                                </Dropdown.Content>
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
                    </Dropdown.Content>
                </Dropdown>
            </div>
            
            <div className="w-full lg:rounded-lg shadow bg-white dark:bg-gray-900 px-2 lg:px-4 py-2">
                <div className="w-full max-w-full overflow-x-auto gray-scrollbar lg:px-2 overflow-y-auto max-h-[80vh]">
                    <table className={`w-full whitespace-nowrap ${loading ? "border-separate" : ""}`}>
                        <thead>
                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-500 [&_>_th]:font-medium [&_>_th]:text-xs [&_>_th]:tracking-wider [&_>_th]:uppercase [&_>_th]:text-start">
                                {
                                    checkPermission('haji-umrah.flight.reservation-delete') && (
                                        <th className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                            <input ref={checkAllRef} type="checkbox" disabled={queriedReservations.length === 0} className="form-checkbox" name="selectall" id="selectAll" checked={checkedAll} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">User</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Company</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Flight Number</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Arrival</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Arrive At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Created At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Status</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Program Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Price</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Seats</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Total Price</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Amount Paid</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300 [&_td]:p-2">
                            {
                                loading
                                    ? [...Array(10)].map((_, i) => (
                                        <tr key={i}>
                                            <td></td>
                                            <td colSpan={15} className="skeleton p-3"></td>
                                        </tr>
                                    ))
                                    : (
                                        queriedReservations.length === 0
                                            ? (
                                                <tr>
                                                    <td colSpan={16} className="text-center py-3">No reservations found</td>
                                                </tr>
                                            )
                                            : queriedReservations.map((reservation, i) => (
                                                <FlightReservationColumn
                                                    key={i}
                                                    res={reservation}
                                                    setReservation={setReservation}
                                                    select={select}
                                                    unselect={unselect}
                                                    selected={selected}
                                                    checkPermission={checkPermission}
                                                    addPayment={addPayment}
                                                    updateReservation={updateReservation}
                                                    deleteReservation={deleteReservation}
                                                    reservationDetail={reservationDetail}
                                                    loading={loading}
                                                />
                                            ))
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
            
            {
                checkPermission('haji-umrah.flight.reservation-create') && (
                    <CreateFlightReservation refetchReservations={getReservations} />
                )
            }
            
            {
                checkPermission('haji-umrah.flight.reservation-update') && reservation && (
                    <UpdateFlightReservation refetchReservations={getReservations} setReservation={setReservation} reservation={reservation} />
                )
            }

            {
                checkPermission('haji-umrah.flight.reservation-read') && reservation && (
                    <Modal id="flightReservationDetailModal" size="lg" static>
                        <Modal.Header>
                            <Modal.Title>Flight Reservation Detail</Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="text-start">
                            <div className="w-full block">
                                <div className="w-full p-2 flex items-center space-x-2 flex-wrap">
                                    <div className="flex items-center space-x-2">
                                        <Image alt={reservation.user.name} src={reservation.user.avatar} className="w-10 h-10 rounded-full object-cover" />
                                        <div className="block">
                                            <p className="text-gray-900 dark:text-white font-medium">{reservation.user.name}</p>
                                            <p className="text-gray-700 dark:text-gray-300 font-medium text-xs">{reservation.user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-full p-2">
                                    <p className="text-base font-medium text-gray-800 dark:text-gray-100">
                                        {reservation.flight.airline.name}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        Reservation ID: {reservation.id}
                                    </p>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        Program Type: {reservation.flight.program_type} Days
                                    </p>
                                </div>
                                <Tab>
                                    <Tab.List>
                                        <Tab.Item>Flight</Tab.Item>
                                        <Tab.Item>Manifest</Tab.Item>
                                        <Tab.Item>Payments</Tab.Item>
                                    </Tab.List>
                                    <Tab.Panels>
                                        <Tab.Panel>
                                            <div className="w-full flex flex-wrap items-end justify-between">
                                                <div className="w-full lg:w-1/2 p-2">
                                                    <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                        Departure Flight
                                                    </h5>
                                                    <h6 className="flex items-center text-gray-800 dark:text-gray-100 font-medium text-sm">
                                                        {reservation.flight.airline.code}-{reservation.flight.flight_number}&nbsp;-&nbsp;
                                                        {reservation.flight.departure_airport.iata} <ArrowRightIcon className="w-4 h-4 mx-2" /> {reservation.flight.arrival_airport.iata}
                                                    </h6>
                                                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                        Departure At {moment(reservation.flight.depart_at).format('DD MMMM YYYY HH:mm')}
                                                    </h6>
                                                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                        Arrive At {moment(reservation.flight.arrive_at).format('DD MMMM YYYY HH:mm')}
                                                    </h6>
                                                </div>
                                                <div className="w-full lg:w-1/2 p-2">
                                                    <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                        Return Flight
                                                    </h5>
                                                    <h6 className="flex items-center text-gray-800 dark:text-gray-100 font-medium text-sm">
                                                        {reservation.flight.airline.code}-{reservation.flight.return_flight_number}&nbsp;-&nbsp;
                                                        {reservation.flight.return_departure_airport.iata} <ArrowRightIcon className="w-4 h-4 mx-2" /> {reservation.flight.return_arrival_airport.iata}
                                                    </h6>
                                                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                        Return At {moment(reservation.flight.return_depart_at).format('DD MMMM YYYY HH:mm')}
                                                    </h6>
                                                    <h6 className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                                        Arrive At {moment(reservation.flight.return_arrive_at).format('DD MMMM YYYY HH:mm')}
                                                    </h6>
                                                </div>
                                            </div>
                                        </Tab.Panel>
                                        <Tab.Panel>
                                            <div className="w-full p-2">
                                                <h5 className="text-base font-semibold text-gray-900 dark:text-white">
                                                    Manifest
                                                </h5>
                                                {
                                                    reservation.manifest === null
                                                    ? <p className="text-center text-gray-700 dark:text-gray-300">No Manifest has been added for this reservation.</p>
                                                    : (
                                                            <>
                                                                <div className="w-full max-w-full overflow-auto gray-scrollbar max-h-[40vh]">
                                                                    <table className="w-full">
                                                                        <thead className="sticky top-0 bg-white dark:bg-gray-900 outline outline-1 outline-gray-300 dark:outline-gray-700">
                                                                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-900 dark:text-white">
                                                                                <th>Name</th>
                                                                                <th>Passport Number</th>
                                                                                <th>VISA Number</th>
                                                                                <th>Date of Birth</th>
                                                                                <th>Gender</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                reservation.manifest.passengers.length === 0
                                                                                    ? (
                                                                                        <tr className=" [&_>_td]:p-2 [&_>_td]:whitespace-nowrap text-gray-900 dark:text-white text-center">
                                                                                            <td colSpan={5}>No Passenger found.</td>
                                                                                        </tr>
                                                                                    )
                                                                                    : reservation.manifest.passengers.map((passenger, i) => (
                                                                                        <tr key={i} className="border-b border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap text-gray-900 dark:text-white text-center">
                                                                                            <td>{passenger.name}</td>
                                                                                            <td>{passenger.passport_number}</td>
                                                                                            <td>{passenger.visa_number}</td>
                                                                                            <td>
                                                                                                {
                                                                                                    passenger.date_of_birth !== null
                                                                                                        ? moment(passenger.date_of_birth).format('DD MMMM YYYY')
                                                                                                        : '-'
                                                                                                }
                                                                                            </td>
                                                                                            <td className="capitalize">
                                                                                                {
                                                                                                    passenger.gender !== null
                                                                                                        ? passenger.gender
                                                                                                        : "-"
                                                                                                }
                                                                                            </td>
                                                                                        </tr>
                                                                                    ))
                                                                            }
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>
                                                    )
                                                }
                                            </div>
                                        </Tab.Panel>
                                        <Tab.Panel>
                                            <div className="flex flex-col w-full">
                                                <div className="w-full p-2 max-w-full overflow-x-auto gray-scrollbar">
                                                    <h5 className="text-gray-800 dark:text-gray-100 text-lg font-semibold">Payments</h5>
                                                    {
                                                        reservation.payments.length === 0
                                                            ? (
                                                                <div className="w-full flex flex-col items-center justify-center">
                                                                    <span className="text-gray-500 dark:text-gray-400 text-center">No payment has been made for this reservation</span>
                                                                </div>
                                                            )
                                                            : (
                                                                <div className="w-full">
                                                                    <table className="w-full">
                                                                        <thead>
                                                                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-900 dark:text-white">
                                                                                <th>Payment Method</th>
                                                                                <th>Payment Code</th>
                                                                                <th>Paid At</th>
                                                                                <th>Status</th>
                                                                                <th>Amount</th>
                                                                                <th></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {
                                                                                reservation.payments.map((payment, i) => (
                                                                                    <tr key={i} className="border-b border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap text-gray-900 dark:text-white text-center">
                                                                                        <td>{payment.payment_method.name}</td>
                                                                                        <td>
                                                                                            {
                                                                                                payment.status === 'paid'
                                                                                                    ? payment.payment_code
                                                                                                    : (
                                                                                                        <a href={`${config('app.publicUrl')}/payments/${payment.payment_code}`} target="_blank" className="flex items-center justify-center underline hover:text-rose-500" rel="noreferrer">
                                                                                                            {payment.payment_code}
                                                                                                            <sup>
                                                                                                                <ArrowTopRightOnSquareIcon className="w-3 h-3" />
                                                                                                            </sup>
                                                                                                        </a>
                                                                                                    )
                                                                                            }
                                                                                        </td>
                                                                                        <td>{moment(payment.created_at).format('DD MMMM YYYY')}</td>
                                                                                        <td className="capitalize">{payment.status}</td>
                                                                                        <td className="text-end">{formatIDR(payment.amount)}</td>
                                                                                        <td>
                                                                                            {
                                                                                                payment.status === 'unpaid' && (
                                                                                                    <button className="btn-light dark:btn-dark" onClick={() => validatePayment(payment.payment_code)}>Validate</button>
                                                                                                )
                                                                                            }
                                                                                        </td>
                                                                                    </tr>
                                                                                ))
                                                                            }
                                                                        </tbody>
                                                                        <tfoot>
                                                                            <tr className="dark:border-gray-800 [&_>_th]:whitespace-nowrap text-gray-900 dark:text-white">
                                                                                <th className="text-end" colSpan="4">Total Paid</th>
                                                                                <th className="text-end">{formatIDR(reservation.amount_paid)}</th>
                                                                            </tr>
                                                                            <tr className="dark:border-gray-800 [&_>_th]:whitespace-nowrap text-gray-900 dark:text-white">
                                                                                <th className="text-end" colSpan="4">Leftover</th>
                                                                                <th className="text-end">{formatIDR(reservation.total_price - reservation.amount_paid)}</th>
                                                                            </tr>
                                                                            <tr className="dark:border-gray-800 [&_>_th]:whitespace-nowrap text-gray-900 dark:text-white">
                                                                                <th className="text-end" colSpan="4">Total</th>
                                                                                <th className="text-end">{formatIDR(reservation.total_price)}</th>
                                                                            </tr>
                                                                        </tfoot>
                                                                    </table>
                                                                </div>
                                                            )

                                                    }
                                                </div>
                                            </div>
                                        </Tab.Panel>
                                    </Tab.Panels>
                                </Tab>
                                <div className="md:flex items-end w-full justify-between">
                                    <div className="block p-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            Reserved at {moment(reservation.created_at).format('DD MMMM YYYY HH:mm')}
                                        </p>
                                        <div className="mb-2">
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Price per seat: {formatIDR(reservation.flight.price)}</p>
                                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Seats Reserved: {reservation.seats} seats</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end justify-end p-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400">Total Price</span>
                                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                                            {formatIDR(reservation.total_price)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="flex items-center justify-end space-x-2">
                            <button className="btn-text" onClick={() => {
                                setModalState('')
                                setReservation(null)
                            }}>Close</button>
                        </Modal.Footer>
                    </Modal>
                )
            }

            {
                checkPermission('haji-umrah.flight.reservation-delete') && toDelete.length > 0 && (
                    <Modal id="deleteFlightReservationModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute z-50 inset-0 bg-white/50 dark:bg-gray-900/50 grid place-items-center w-full h-full">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <Modal.Title>Delete Flight Reservation</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="text-gray-900 dark:text-white font-medium">Are you sure want to delete the selected flight reservation?<br/>The deleted data will not be able to be recovered. Keep deleting?</p>
                        </Modal.Body>
                        <Modal.Footer className="flex items-center justify-end space-x-2">
                            <button className="btn-text" onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }}>Cancel</button>
                            <button className="btn-rose" onClick={deleteReservations}>Delete</button>
                        </Modal.Footer>
                    </Modal>
                )
            }

            {
                checkPermission('haji-umrah.flight.reservation-add-payment') && toValidate !== null && (
                    <Modal id="validateFlightReservationPaymentModal" static size="md">
                        {
                            validating && (
                                <div className="absolute z-50 inset-0 bg-white/50 dark:bg-gray-900/50 grid place-items-center w-full h-full">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <Modal.Title>Validate Reservation Payment</Modal.Title>
                        </Modal.Header>
                        <Modal.Body>
                            <p className="text-gray-900 dark:text-white font-medium">Are you sure want to validate payment with code <code>{toValidate}</code> </p>
                        </Modal.Body>
                        <Modal.Footer className="flex items-center justify-end space-x-2">
                            <button className="btn-text" onClick={() => {
                                setToValidate(null)
                                setModalState('flightReservationDetailModal')
                            }}>Cancel</button>
                            <button className="btn-rose" onClick={doValidatePayment}>Validate</button>
                        </Modal.Footer>
                    </Modal>
                )
            }

            {
                checkPermission('haji-umrah.flight.reservation-add-payment') && reservation && (
                    <FlightPayment reservation={reservation} setReservation={setReservation} refetch={getReservations} />
                )
            }
        </>
    )
}

Reservations.getLayout = page => <AppLayout title="Flight Reservations" permissions={['haji-umrah.flight.reservation-read']}>{page}</AppLayout>

export default Reservations