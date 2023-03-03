import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Image from "@/components/image"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, inArray, searchString } from "@/util"
import { ArrowRightIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState } from "recoil"
import { Input } from "../input"
import { InputError } from "../input-error"

export const CreatePackageReservation = ({ refetch }) => {
    const [modalOpenState, setModalState] = useRecoilState(modalState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [packages, setPackages] = useState([])
    const [users, setUsers] = useState([])
    const [companies, setCompanies] = useState([])
    const [query, setQuery] = useState('')
    const [showCompany, setShowCompany] = useState(false)

    const { data, errors, setData, setErrors, handleChange, reset } = useForm({
        package: {},
        user: {},
        company: {},
        amount: 0
    })

    const fetchData = async () => {
        setLoading(true)

        await axios.get("/hajj-umrah/packages").then(res => {
            setPackages(res.data.packages)
        }).catch(err => {
            toast(err.response.data.message)
        })

        await axios.get("/users").then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            toast(err.response.data.message)
        })

        await axios.get("/companies").then(res => {
            setCompanies(res.data.data  )
        }).catch(err => {
            toast(err.response.data.message)
        })

        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        setMessage(null)
        await axios.post("/hajj-umrah/packages/reservations/store", {
            package_id: data.package.id,
            user_id: data.user.id,
            company_id: data.company.id,
            amount: data.amount,
        }).then(res => {
            setLoading(false)
            toast.success(res.data.message)
            refetch()
            reset()
            setModalState('')
        }).catch(err => {
            setLoading(false)
            setMessage(err.response.data.message)
            if (err.response.status === 422) setErrors(err.response.data.errors)
            toast.error(err.response.data.message)
        })
    }

    const handleUser = (value) => {
        let toChange = {
            user: value,
        }
        toChange.company = value.user_type === 'company' ? value.company : {}
        setData({
            ...data,
            ...toChange,
        })
        setShowCompany(value.user_type !== 'company')
    }

    const queriedUsers = users.filter(user => inArray(user.user_type, ['agent', 'company'])).filter(user => {
        return query.trim().length > 0
            ? searchString(query, user.name)
            || searchString(query, user.email)
            || searchString(query, user.phone ?? '')
            : true
    })

    const queriedCompanies = query.trim().length === 0 ? companies : companies.filter(company => {
        return searchString(query, company.name)
            || searchString(query, company.email ?? '')
            || searchString(query, company.ppiu_number)
            || searchString(query, company.phone ?? '')
    })

    const queriedPackages = query.trim().length === 0 ? packages : packages.filter(pkg => {
        return searchString(query, pkg.hotel.location_1)
            || searchString(query, pkg.hotel.location_2)
            || searchString(query, pkg.flight.airline.name)
            || searchString(query, pkg.flight.flight_number)
            || searchString(query, pkg.flight.return_flight_number)
            || searchString(query, moment(pkg.flight.depart_at).format('DD MMM YYYY'))
            || searchString(query, moment(pkg.hotel.first_check_in_at).format('DD MMM YYYY'))
    })

    useEffect(() => {
        fetchData()
    }, [modalOpenState])

    return (
        <Modal id="createPackageReservationModal" size="lg" static>
            {
                loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[1001]">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Create Package Reservation</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start max-h-[70vh] overflow-y-auto gray-scrollbar">
                    {
                        message && (
                            <Alert type="error" title="Something went wrong">{message}</Alert>
                        )
                    }
                    <div className="w-full flex flex-wrap">
                        <div className="w-full xl:w-1/2 p-2">
                            <div className="mb-3">
                                <Combobox value={data.user} onChange={handleUser}>
                                    <Combobox.Input showButton onChange={(e) => setQuery(e.target.value)} label="User / Agent" displayValue={
                                        (u) => u.name ? u.name : 'Select User / Agent'
                                    } />
                                    <Combobox.Container afterLeave={() => setQuery('')}>
                                        <Combobox.Options className="max-h-[30vh] xl:max-h-[20vh]">
                                            {
                                                queriedUsers.length === 0
                                                    ? <p className="text-center">No user/agent found</p>
                                                    : queriedUsers.map(user => (
                                                        <Combobox.Option key={user.email} value={user}>
                                                            <div className="flex items-center space-x-2 text-start">
                                                                <div className="w-8 h-8 rounded-full overflow-hidden">
                                                                    <Image src={user.avatar} alt={user.name} width={100} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold">{user.name}</p>
                                                                    <p className="text-xs text-gray-500">{user.email}</p>
                                                                    <p className="text-xs text-gray-500">{user.company ? `${user.company.name} (${user.company.ppiu_number})` : '-'}</p>
                                                                </div>
                                                            </div>
                                                        </Combobox.Option>
                                                    ))
                                            }
                                        </Combobox.Options>
                                    </Combobox.Container>
                                </Combobox>
                                <InputError messages={errors.user_id} />
                            </div>
                        </div>
                        {
                            showCompany && (
                                <div className="w-full xl:w-1/2 mb-3 p-2">
                                    <Combobox value={data.company} onChange={(value) => handleChange('company', value)}>
                                        <Combobox.Input showButton onChange={(e) => setQuery(e.target.value)} label="Company / PPIU" displayValue={
                                            (c) => c.name ? `${c.name} (PPIU: ${c.ppiu_number})` : 'Select Company/PPIU'
                                        } />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedCompanies.length === 0
                                                    ? <p className="text-center">No company found</p>
                                                    : queriedCompanies.map(company => (
                                                        <Combobox.Option key={company.id} value={company}>
                                                            <div className="flex flex-col">
                                                                <p className="font-semibold">{company.name}</p>
                                                                <p className="text-xs text-gray-500">PPIU: {company.ppiu_number}</p>
                                                            </div>
                                                        </Combobox.Option>
                                                    ))
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.company_id} />
                                </div>
                            )
                        }
                        <div className="w-full xl:w-1/2 p-2">
                            <div className="w-full mb-3">
                                <Combobox value={data.package} onChange={(value) => handleChange('package', value)}>
                                    <Combobox.Input showButton label="Package" displayValue={(pkg) => {
                                        return pkg.id ? `PKG-${moment(pkg.created_at).format("YYYYMMDD")}${pkg.id}` : "Select Package"
                                    }} onChange={e => setQuery(e.target.value)} />
                                    <Combobox.Container afterLeave={() => setQuery('')}>
                                        {
                                            queriedPackages.length === 0
                                                ? <p className="text-center">No Package found</p>
                                                : queriedPackages.map(pkg => (
                                                    <Combobox.Option disabled={pkg.packages_left === 0} key={pkg.id} value={pkg} className="flex-col !justify-start !items-start">
                                                        <span>PKG-{moment(pkg.created_at).format("YYYYMMDD")}{pkg.id}</span>
                                                        <div className="flex items-center text-sm">
                                                            <span>{pkg.flight.departure_airport.name}</span>
                                                            <ArrowsRightLeftIcon className="w-4 h-4 mx-1" />
                                                            <span>{pkg.flight.arrival_airport.name}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm">
                                                            <span>{pkg.hotel.location_1}</span>
                                                            <ArrowRightIcon className="w-4 h-4 mx-1" />
                                                            <span>{pkg.hotel.location_2}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <small className="text-xs opacity-70">{pkg.program_type} days program</small>
                                                            <small className="text-sm opacity-80">&middot; {formatIDR(pkg.price_per_package)}</small>
                                                        </div>
                                                        <p className="text-xs opacity-60">{moment(pkg.flight.depart_at).format("DD MMMM YYYY")} - {moment(pkg.flight.return_depart_at).format('DD MMMM YYYY')}</p>
                                                        <p className="text-xs opacity-50">Available: {pkg.packages_left}x</p>
                                                    </Combobox.Option>
                                                ))
                                        }
                                    </Combobox.Container>
                                </Combobox>
                                <InputError messages={errors.flight_id} />
                            </div>
                        </div>
                        <div className="w-full xl:w-1/2 p-2">
                            <div className="w-full mb-3">
                                <Input type="number" min={1} value={data.amount} name="amount" label="Amount" onChange={(e) => handleChange('amount', e.target.value)} max={data.package.packages_left ?? 0} />
                                <InputError messages={errors.amount} />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button type="button" className="btn-text" onClick={() => {
                        reset()
                        setModalState('')
                    }}>Close</button>
                    <button type="submit" className="btn-rose">Store</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}