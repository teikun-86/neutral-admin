import { modalState } from '@/atom';
import { Dropdown } from '@/components/dropdown';
import { CreatePackage, UpdatePackage } from '@/components/form';
import { AscendingIcon } from '@/components/icons/ascending';
import { DescendingIcon } from '@/components/icons/descending';
import Loader from '@/components/loader';
import { Modal } from '@/components/modal';
import { useAuth } from '@/hooks/auth';
import AppLayout from '@/layouts/app';
import { axios } from '@/libs/axios';
import { formatIDR, searchString } from '@/util';
import { BanknotesIcon, CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, PaperAirplaneIcon, TrashIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';

const Package = () => {
    const { checkPermission } = useAuth()
    const checkAllRef = useRef(null)
    const setModalState = useSetRecoilState(modalState)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState([])
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [packages, setPackages] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [pkg, setPkg] = useState(null)
    const [orderBy, setOrderBy] = useState({
        column: 'created_at',
        direction: 'desc'
    })
    
    const getPackages = useCallback(async () => {
        setLoading(true)
        setQuery('')
        setSelected([])
        await axios.get('/hajj-umrah/packages', {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction
            }
        }).then(res => {
            setPackages(res.data.packages)
            setLoading(false)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch packages. Please try again later.")
            console.log(err)
        })
    }, [orderBy])

    const sortBy = (column, direction) => setOrderBy({ column, direction })

    const select = id => setSelected([...selected, id])

    const unselect = id => setSelected(selected.filter(s => s !== id))

    const selectAll = () => setSelected(packages.map(pak => pak.id))

    const unselectAll = () => setSelected([])

    const updatePackage = value => {
        setPkg(value)
        setModalState('updatePackageModal')
    }

    const deletePackage = (ids) => {
        setToDelete(Array.isArray(ids) ? ids : [ids])
        setModalState('deletePackageModal')
    }

    const deletePackages = async () => {
        setDeleting(true)
        await axios.delete('/hajj-umrah/packages/destroy', {
            data: {
                ids: toDelete
            }
        }).then(res => {
            setDeleting(false)
            setModalState(null)
            getPackages()
            toast.success("Successfully deleted package(s).")
        }).catch(err => {
            setDeleting(false)
            setModalState(null)
            toast.error("Failed to delete package(s). Please try again later.")
            console.log(err)
        })
    }

    const queriedPackages = query.trim().length === 0 ? packages : packages.filter(pak => {
        return searchString(query, pak.hotel.location_1)
            || searchString(query, pak.hotel.location_2)
            || searchString(query, pak.flight.airline.name)
            || searchString(query, pak.flight.departure_airport.name)
            || searchString(query, pak.flight.arrival_airport.name)
            || searchString(query, moment(pak.flight.depart_at).format("DD MMM YYYY"))
            || searchString(query, moment(pak.flight.return_depart_at).format("DD MMM YYYY"))
    })

    const allChecked = selected.length === queriedPackages.length && selected.length !== 0

    useEffect(() => {
        getPackages()
    }, [getPackages])
    
    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mx-4 lg:mx-0">Flight & Hotel Packages</h2>

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
                    checkPermission('haji-umrah.package-create') && (
                        <button onClick={() => setModalState('createPackageModal')} className="btn-light dark:btn-dark">Create Package</button>
                    )
                }
                {
                    checkPermission('haji-umrah.package-delete') && (
                        <Dropdown className="z-30">
                            <Dropdown.Button disabled={selected.length === 0} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5 ml-2" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Item className="space-x-2" onClick={() => deletePackage(selected)}>
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
                                            <input ref={checkAllRef} type="checkbox" className="form-checkbox" name="selectall" id="selectAll" checked={allChecked} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} disabled={loading || queriedPackages.length === 0} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Airline</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Flight Number</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Departure At</th>
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
                                                queriedPackages.length === 0
                                                    ? (
                                                        <>
                                                            <tr>
                                                                <td colSpan="10" className="text-center py-4">No packages found</td>
                                                            </tr>
                                                        </>
                                                    )
                                                    : queriedPackages.map((pkg, i) => (
                                                        <Fragment key={i}>
                                                            <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                                {
                                                                    checkPermission('haji-umrah.package-delete') && (
                                                                        <td className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                                                            <input type="checkbox" className="form-checkbox" name="select" id={`select-${pkg.id}`} checked={selected.includes(pkg.id)} onChange={(e) => e.target.checked ? select(pkg.id) : unselect(pkg.id)} disabled={loading} />
                                                                        </td>
                                                                    )
                                                                }
                                                                <td>
                                                                    {pkg.flight.airline.name}
                                                                </td>
                                                                <td>
                                                                    <p>Departure: {pkg.flight.airline.code}-{pkg.flight.flight_number}</p>
                                                                    <p>Return: {pkg.flight.airline.code}-{pkg.flight.return_flight_number}</p>
                                                                </td>
                                                                <td>
                                                                    <p>Departure: {moment(pkg.flight.depart_at).format("DD MMM YYYY")}</p>
                                                                    <p>Return: {moment(pkg.flight.return_depart_at).format("DD MMM YYYY")}</p>
                                                                </td>
                                                                <td>
                                                                    <p>{pkg.hotel.location_1}: {moment(pkg.hotel.first_check_in_at).format('DD MMM YYYY')}</p>
                                                                    <p>{pkg.hotel.location_2}: {moment(pkg.hotel.last_check_in_at).format('DD MMM YYYY')}</p>
                                                                </td>
                                                                <td>
                                                                    <p>{pkg.hotel.location_1}: {moment(pkg.hotel.first_check_out_at).format('DD MMM YYYY')}</p>
                                                                    <p>{pkg.hotel.location_2}: {moment(pkg.hotel.last_check_out_at).format('DD MMM YYYY')}</p>
                                                                </td>
                                                                <td>
                                                                    <p>{pkg.hotel.room_detail.quad} Quad</p>
                                                                    <p>{pkg.hotel.room_detail.triple} Triple</p>
                                                                    <p>{pkg.hotel.room_detail.double} Double</p>
                                                                </td>
                                                                <td>{pkg.program_type} Days</td>
                                                                <td>{formatIDR(pkg.price_per_package)}</td>
                                                                <td>{pkg.packages_left} / {pkg.packages_available}</td>
                                                                <td>
                                                                    <div className="flex items-center space-x-2">
                                                                        {
                                                                            checkPermission('haji-umrah.package-update') && (
                                                                                <button onClick={() => updatePackage(pkg)} className="btn-light dark:btn-dark">Update</button>
                                                                            )
                                                                        }
                                                                        {
                                                                            checkPermission('haji-umrah.package-delete') && (
                                                                                <button onClick={() => deletePackage(pkg.id)} className="btn-rose">Delete</button>
                                                                            )
                                                                        }
                                                                    </div>
                                                                </td>
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
                checkPermission('haji-umrah.package-create') && (
                    <CreatePackage refetch={getPackages} />
                )
            }

            {
                checkPermission('haji-umrah.package-update') && pkg && (
                    <UpdatePackage refetch={getPackages} pkg={pkg} setPkg={setPkg} />
                )
            }

            {
                checkPermission('haji-umrah.package-delete') && (
                    <Modal id="deletePackageModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Package?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{toDelete.length} Package{toDelete.length > 1 ? 's' : ''}</strong>? This action will also delete all the Hotels&apos; reservations too.</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{toDelete.length} Package{toDelete.length > 1 ? 's' : ''}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => deletePackages()} className="btn-light mt-3 border-0 dark:btn-dark !w-full">Delete Them</button>
                        </Modal.Footer>
                    </Modal>
                )
            }
        </>
    );
};

Package.getLayout = page => <AppLayout title="Packages" permissions={['haji-umrah.package-read']}>{page}</AppLayout>

export default Package;