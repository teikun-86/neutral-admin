import { modalState } from "@/atom";
import { Dropdown } from "@/components/dropdown";
import { CreateHotel, UpdateHotel } from "@/components/form";
import { AscendingIcon } from "@/components/icons/ascending";
import { DescendingIcon } from "@/components/icons/descending";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/layouts/app";
import { axios } from "@/libs/axios";
import { formatIDR, searchString } from "@/util";
import { BanknotesIcon, CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrashIcon } from "@heroicons/react/24/outline";
import moment from "moment";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

const Hotel = () => {
    const { checkPermission } = useAuth()
    const setModalState = useSetRecoilState(modalState)
    const checkAllRef = useRef(null)
    const [hotels, setHotels] = useState([])
    const [hotel, setHotel] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [selected, setSelected] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [query, setQuery] = useState('')
    const [orderBy, setOrderBy] = useState({
        column: 'created_at',
        direction: 'desc'
    })
    
    const getHotels = useCallback(async () => {
        setLoading(true)
        await axios.get("hajj-umrah/hotels", {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
            }
        }).then(res => {
            setHotels(res.data.hotels)
            setLoading(false)
        }).catch(err => {
            toast.error("Failed to load hotels.")
            setLoading(false)
        })
    }, [orderBy])

    const queriedHotels = query.trim().length === 0 ? hotels : hotels.filter(hotel => {
        return searchString(query, hotel.company ? hotel.company.name : '')
            || searchString(query, hotel.location_1)
            || searchString(query, hotel.location_2)
            || searchString(query, hotel.price_per_package)
            || searchString(query, hotel.room_detail.quad)
            || searchString(query, hotel.room_detail.triple)
            || searchString(query, hotel.room_detail.double)
            || searchString(query, moment(hotel.first_check_in_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.first_check_out_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.last_check_in_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.last_check_out_at).format('DD MMMM YYYY'))
    })

    const allChecked = selected.length === queriedHotels.length && selected.length > 0

    const sortBy = (col, dir) => {
        setOrderBy({
            column: col,
            direction: dir
        })
        setQuery('')
    }

    const selectAll = () => setSelected(queriedHotels.map(hotel => hotel.id))

    const unselectAll = () => setSelected([])

    const select = (id) => setSelected([...selected, id])

    const unselect = (id) => setSelected(selected.filter(selectedId => selectedId !== id))

    const updateHotel = hotel => {
        setHotel(hotel)
        setModalState('updateHajiUmrahHotelModal')
    }

    const deleteHotels = async () => {
        setDeleting(true)
        await axios.delete("hajj-umrah/hotels/destroy", {
            params: {
                ids: toDelete
            }
        }).then(res => {
            toast.success("Hotel deleted.")
            setToDelete([])
            getHotels()
            setDeleting(false)
            setModalState('')
            setSelected([])
        }).catch(err => {
            toast.error("Failed to delete hotel. Please try again later.")
            setDeleting(false)
        })
    }

    const deleteHotel = (ids) => {
        setToDelete(Array.isArray(ids) ? ids : [ids])
        setModalState('deleteHajiUmrahHotelModal')
    }
    
    useEffect(() => {
        getHotels()
    }, [getHotels])

    useEffect(() => {
        if (checkAllRef.current) {
            checkAllRef.current.indeterminate = selected.length > 0 && selected.length < queriedHotels.length
        }
    }, [selected])
    
    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Hotels</h2>

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
                    checkPermission('haji-umrah.hotel-create') && (
                        <button onClick={() => setModalState('createHajiUmrahHotelModal')} className="btn-light dark:btn-dark">Create Hotel</button>
                    )
                }
                {
                    checkPermission('haji-umrah.hotel-delete') && (
                        <Dropdown className="z-30">
                            <Dropdown.Button disabled={selected.length === 0} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5 ml-2" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Item className="space-x-2" onClick={() => deleteHotel(selected)}>
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
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('first_check_in_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Check In At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('first_check_in_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Check In At</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('first_check_out_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Check Out At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('first_check_out_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Check Out At</span>
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
                                    checkPermission('haji-umrah.hotel-delete') && (
                                        <th className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                            <input ref={checkAllRef} type="checkbox" className="form-checkbox" name="selectall" id="selectAll" checked={allChecked} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} disabled={loading || queriedHotels.length === 0} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Assigned Company</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check In At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Check Out At</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Room Detail</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Program Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Price/package</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Packages Available</th>
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
                                        <>
                                            {
                                                queriedHotels.length === 0
                                                    ? (
                                                        <>
                                                            <tr>
                                                                <td colSpan="12" className="text-center py-4">No hotels found</td>
                                                            </tr>
                                                        </>
                                                    )
                                                    : queriedHotels.map((hotel, i) => (
                                                        <Fragment key={i}>
                                                            <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                                {
                                                                    checkPermission('haji-umrah.hotel-delete') && (
                                                                        <td rowSpan={2} className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                                                            <input type="checkbox" className="form-checkbox" name="select" id={`select-${hotel.id}`} checked={selected.includes(hotel.id)} onChange={(e) => e.target.checked ? select(hotel.id) : unselect(hotel.id)} disabled={loading} />
                                                                        </td>
                                                                    )
                                                                }
                                                                <td className="sticky left-4 bg-white dark:bg-gray-900"><span className="text-xs font-medium uppercase text-gray-500">{hotel.location_1}</span></td>
                                                                <td rowSpan={2}>
                                                                    {hotel.company ? hotel.company.name : "No Company"}
                                                                </td>
                                                                <td>{moment(hotel.first_check_in_at).format('DD MMM YYYY')}</td>
                                                                <td>{moment(hotel.first_check_out_at).format('DD MMM YYYY')}</td>
                                                                <td rowSpan={2}>
                                                                    <p>{hotel.room_detail.quad} Quad</p>
                                                                    <p>{hotel.room_detail.triple} Triple</p>
                                                                    <p>{hotel.room_detail.double} Double</p>
                                                                </td>
                                                                <td rowSpan={2}>{hotel.program_type} Days</td>
                                                                <td rowSpan={2}>{formatIDR(hotel.price_per_package)}</td>
                                                                <td rowSpan={2}>{hotel.packages_left}/<small className="text-xs opacity-60">{hotel.packages_available} packages</small></td>
                                                                <td rowSpan={2}>
                                                                    <div className="flex items-center justify-start flex-nowrap space-x-2">
                                                                        <button onClick={() => updateHotel(hotel)} className="btn-light dark:btn-dark">Update</button>
                                                                        <button onClick={() => deleteHotel(hotel.id)} className="btn-rose">Delete</button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            <tr className="[&:not(:last-child)]:border-b border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                                <td className="sticky left-4 bg-white dark:bg-gray-900"><span className="text-xs font-medium uppercase text-gray-500">{hotel.location_2}</span></td>
                                                                <td>{moment(hotel.last_check_in_at).format('DD MMM YYYY')}</td>
                                                                <td>{moment(hotel.last_check_out_at).format('DD MMM YYYY')}</td>
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
                checkPermission('haji-umrah.hotel-create') && (
                    <CreateHotel refetchHotel={getHotels} />
                )
            }

            {
                checkPermission('haji-umrah.hotel-update') && hotel && (
                    <UpdateHotel refetchHotel={getHotels} hotel={hotel} setHotel={setHotel} />
                )
            }

            {
                checkPermission('haji-umrah.hotel-delete') && (
                    <Modal id="deleteHajiUmrahHotelModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Hotel?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{toDelete.length} Hotel{toDelete.length > 1 ? 's' : ''}</strong>? This action will also delete all the Hotels&apos; reservations too.</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{toDelete.length} Hotel{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => deleteHotels()} className="btn-light mt-3 border-0 dark:btn-dark !w-full">Delete Them</button>
                        </Modal.Footer>
                    </Modal>
                )
            }
        </>
    );
};

Hotel.getLayout = page => <AppLayout title="Hotels" permissions={['haji-umrah.hotel-read']}>{page}</AppLayout>

export default Hotel;