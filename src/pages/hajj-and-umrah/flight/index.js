import { modalState } from "@/atom";
import { Dropdown } from "@/components/dropdown";
import { CreateFlight, UpdateFlight } from "@/components/form";
import { AscendingIcon } from "@/components/icons/ascending";
import { DescendingIcon } from "@/components/icons/descending";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/layouts/app";
import { axios } from "@/libs/axios";
import { formatIDR, searchString } from "@/util";
import { BanknotesIcon, CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment/moment";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

const Flight = () => {
    const setModalState = useSetRecoilState(modalState)
    const checkAllRef = useRef(null)
    const [flights, setFlights] = useState([])
    const [flight, setFlight] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [orderBy, setOrderBy] = useState({
        column: 'depart_at',
        direction: 'asc',
    })

    const { checkPermission } = useAuth()

    const queriedFlights = (query.trim().length === 0
        ? flights
        : flights.filter(flight => {
            const queries = query.trim().split(' ')

            return queries.every(q => {
                return searchString(q, flight.airline.code + '-' + flight.flight_number)
                    || searchString(q, flight.airline.name)
                    || searchString(q, flight.departure_airport.name)
                    || searchString(q, flight.arrival_airport.name)
                    || searchString(q, flight.departure_airport.iata)
                    || searchString(q, flight.arrival_airport.iata)
                    || searchString(q, flight.program_type + " days")
                    || searchString(q, moment(flight.depart_at).format("DD MMMM YYYY"))
            })
        }))

    const allChecked = selected.length === queriedFlights.length && queriedFlights.length > 0

    const selectAll = () => {
        setSelected(queriedFlights.map(flight => flight.id))
    }

    const unselectAll = () => {
        setSelected([])
    }

    const handleCheck = (id, checked) => {
        if (checked) {
            setSelected([...selected, id])
        } else {
            setSelected(selected.filter(selectedId => selectedId !== id))
        }
    }

    const getFlights = useCallback(async () => {
        setLoading(true)
        await axios.get("/hajj-umrah/flights", {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
                with_expired: true
            }
        }).then(res => {
            setFlights(res.data.flights)
            setLoading(false)
        })
    }, [orderBy])

    const deleteFlight = (flightId = []) => {
        setToDelete(Array.isArray(flightId) ? flightId : [flightId])
        setModalState('deleteHajiUmrahFlightModal')
    }

    const updateFlight = flight => {
        setFlight(flight)
        setModalState('updateHajiUmrahFlightModal')
    }

    const deleteFlights = async () => {
        setDeleting(true)
        await axios.delete("/hajj-umrah/flights/delete", {
            params: {
                ids: toDelete
            }
        }).then(res => {
            setDeleting(false)
            setModalState('')
            getFlights()
            toast.success(res.data.message)
            setToDelete([])
        }).catch(err => {
            setDeleting(false)
            toast.error(err.response.data.message)
        })
    }

    const sortBy = (column, direction) => {
        setOrderBy({
            column,
            direction
        })
    }

    useEffect(() => {
        getFlights()
    }, [getFlights])

    useEffect(() => {
        if (checkAllRef.current) {
            checkAllRef.current.indeterminate = selected.length > 0 && selected.length < queriedFlights.length
        }
    }, [selected])

    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Flights</h2>

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
                    checkPermission('haji-umrah.flight-create') && (
                        <button onClick={() => setModalState('createHajiUmrahFlightModal')} className="btn-light dark:btn-dark">Create Flight</button>
                    )
                }
                {
                    checkPermission('haji-umrah.flight-delete') && (
                        <Dropdown className="z-30">
                            <Dropdown.Button disabled={selected.length === 0} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5 ml-2" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Item className="space-x-2" onClick={() => deleteFlight(selected)}>
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
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('depart_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Departure At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('depart_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Departure At</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('arrive_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Arrive At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('arrive_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Arrive At</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('program_type', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Program Type</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('program_type', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Program Type</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('price', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <BanknotesIcon className="w-5 h-5 opacity-50" />
                                <span>Price</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('price', 'desc')}>
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
                                    checkPermission('haji-umrah.flight-delete') && (
                                        <th className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                            <input ref={checkAllRef} type="checkbox" className="form-checkbox" name="selectall" id="selectAll" checked={allChecked} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Airline</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Assigned Company</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Flight Number</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Arrival</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Arrive At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Program Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Price</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Seats</th>
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
                                                        {
                                                            checkPermission('haji-umrah.flight-delete') && (
                                                                <td></td>
                                                            )
                                                        }
                                                        <td></td>
                                                        <td colSpan={10} className="skeleton"></td>
                                                        <td></td>
                                                    </tr>
                                                ))
                                            }
                                        </>
                                    )
                                    : (
                                        <>
                                            {
                                                queriedFlights.length === 0
                                                    ? (
                                                        <>
                                                            <tr>
                                                                <td colSpan="12" className="text-center py-4">No flights found</td>
                                                            </tr>
                                                        </>
                                                    )
                                                    : queriedFlights.map((flight, i) => (
                                                        <Fragment key={i}>
                                                            <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                                {
                                                                    checkPermission('haji-umrah.flight-delete') && (
                                                                        <td rowSpan={2} className="sticky -left-2 bg-white dark:bg-gray-900">
                                                                            <input type="checkbox" name="selected" checked={selected.includes(flight.id)} className="form-checkbox" onChange={(e) => handleCheck(flight.id, e.target.checked)} />
                                                                        </td>
                                                                    )
                                                                }
                                                                <td><span className="text-xs font-medium uppercase text-gray-500">Departure</span></td>
                                                                <td className="text-center">{flight.airline.name}</td>
                                                                <td rowSpan={2} className="text-center">{flight.company ? flight.company.name : "No Company"}</td>
                                                                <td className="text-center">{flight.airline.code}-{flight.flight_number}</td>
                                                                <td>{flight.departure_airport.name} ({flight.departure_airport.iata})</td>
                                                                <td>{flight.arrival_airport.name} ({flight.arrival_airport.iata})</td>
                                                                <td>{moment(flight.depart_at).format("DD MMM YYYY HH:mm")} </td>
                                                                <td>{moment(flight.arrive_at).format("DD MMM YYYY HH:mm")} </td>
                                                                <td rowSpan={2}>{flight.program_type} Days</td>
                                                                <td rowSpan={2}>{formatIDR(flight.price)}</td>
                                                                <td rowSpan={2}>{flight.available_seats} / {flight.seats}</td>
                                                                <td rowSpan={2}>
                                                                    <div className="flex items-center justify-center space-x-2">
                                                                        {
                                                                            checkPermission('haji-umrah.flight-update') && (
                                                                                <button onClick={() => updateFlight(flight)} className="btn-light dark:btn-dark">Update</button>
                                                                            )
                                                                        }
                                                                        {
                                                                            checkPermission('haji-umrah.flight-delete') && (
                                                                                <button onClick={() => deleteFlight([flight.id])} className="btn-rose">Delete</button>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr className="[&:not(:last-child)]:border-b border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                                <td><span className="text-xs font-medium uppercase text-gray-500">Return</span></td>
                                                                <td className="text-center">{flight.airline.name}</td>
                                                                <td className="text-center">{flight.airline.code}-{flight.return_flight_number}</td>
                                                                <td>{flight.return_departure_airport.name} ({flight.return_departure_airport.iata})</td>
                                                                <td>{flight.return_arrival_airport.name} ({flight.return_arrival_airport.iata})</td>
                                                                <td>{moment(flight.return_depart_at).format("DD MMM YYYY HH:mm")} </td>
                                                                <td>{moment(flight.return_arrive_at).format("DD MMM YYYY HH:mm")} </td>
                                                            </tr>
                                                        </Fragment>
                                                    ))
                                            }
                                        </>
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {
                checkPermission('haji-umrah.flight-create') && (
                    <CreateFlight refetchFlights={getFlights} />
                )
            }

            {
                checkPermission('haji-umrah.flight-update') && flight !== null && (
                    <UpdateFlight refetchFlights={getFlights} flight={flight} setFlight={setFlight} />
                )
            }

            {
                checkPermission('haji-umrah.flight-delete') && (
                    <Modal id="deleteHajiUmrahFlightModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Flight?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{toDelete.length} Flight{toDelete.length > 1 ? 's' : ''}</strong>? This action will also delete all the Flights&apos; reservations too.</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{toDelete.length} Flight{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => deleteFlights()} className="btn-light mt-3 border-0 dark:btn-dark !w-full">Delete Them</button>
                        </Modal.Footer>
                    </Modal>
                )
            }

        </>
    );
};

Flight.getLayout = page => <AppLayout title="Flights" permissions={['haji-umrah.flight-read']}>{page}</AppLayout>

export default Flight;