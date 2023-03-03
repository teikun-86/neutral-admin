import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Image from "@/components/image"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, searchString } from "@/util"
import { ArrowRightIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState, useSetRecoilState } from "recoil"
import { Input } from "../input"
import { InputError } from "../input-error"

export const UpdateHotelReservation = ({ refetch, reservation, setReservation }) => {
    const [modalOpenState, setModalState] = useRecoilState(modalState)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const { data, handleChange, setData, reset, errors, setErrors } = useForm({
        id: reservation.id,
        hotel: reservation.hotel,
        user: reservation.user,
        company: reservation.company,
        amount: reservation.amount,
    })
    const [query, setQuery] = useState('')

    const [companies, setCompanies] = useState([])
    const [users, setUsers] = useState([])
    const [hotels, setHotels] = useState([])
    const [showCompany, setShowCompany] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        await axios.get("/companies").then(res => setCompanies(res.data.data))
            .catch(err => {
                toast.error("Failed to fetch companies")
            })

        await axios.get("/users").then(res => setUsers(res.data.users))
            .catch(err => {
                toast.error("Failed to fetch users")
            })

        await axios.get("/hajj-umrah/hotels").then(res => setHotels(res.data.hotels))
            .catch(err => {
                toast.error("Failed to fetch hotels")
            })

        setLoading(false)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        setMessage(null)
        const transformed = {
            id: data.id,
            user_id: data.user?.id,
            company_id: data.company?.id,
            hotel_id: data.hotel?.id,
            amount: data.amount,
        }
        await axios.post("/hajj-umrah/hotels/reservations/update", transformed).then(res => {
            toast.success("Successfully updated hotel reservation")
            reset()
            refetch()
            setReservation(null)
            setModalState(null)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to update hotel reservation")
            setMessage(err.response.data.message)
            if (err.response.status === 422) setErrors(err.response.data.errors)
        })
    }

    const queriedUsers = query.trim().length === 0 ? users : users.filter(user => {
        return searchString(query, user.name)
            || searchString(query, user.email)
            || searchString(query, user.phone ?? '')
    })

    const queriedCompanies = query.trim().length === 0 ? companies : companies.filter(company => {
        return searchString(query, company.name)
            || searchString(query, company.email ?? '')
            || searchString(query, company.ppiu_number)
            || searchString(query, company.phone ?? '')
    })

    const queriedHotels = query.trim().length === 0 ? hotels : hotels.filter(hotel => {
        return searchString(query, hotel.company ? hotel.company.name : '')
            || searchString(query, hotel.location_1)
            || searchString(query, hotel.location_2)
            || searchString(query, hotel.program_type + " days")
            || searchString(query, formatIDR(hotel.price_per_package))
            || searchString(query, `${hotel.room_detail.quad}`)
            || searchString(query, `${hotel.room_detail.triple}`)
            || searchString(query, `${hotel.room_detail.double}`)
            || searchString(query, moment(hotel.first_check_in_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.first_check_out_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.last_check_in_at).format('DD MMMM YYYY'))
            || searchString(query, moment(hotel.last_check_out_at).format('DD MMMM YYYY'))
    })

    useEffect(() => {
        fetchData()
    }, [reservation])

    useEffect(() => {
        setData({
            ...data,
            hotel: reservation.hotel,
            user: reservation.user,
            company: reservation.company,
            amount: reservation.amount,
        })
    }, [reservation])

    return (
        <Modal id="updateHotelReservationModal" size="lg" static>
            {
                loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Update Hotel Reservation</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start">
                    {
                        message && (
                            <Alert title="Something went wrong!" type="error">
                                {message}
                            </Alert>
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
                                <Combobox value={data.hotel} onChange={(value) => handleChange('hotel', value)}>
                                    <Combobox.Input showButton label="Hotel" displayValue={(hotel) => {
                                        return hotel.id ? `${hotel.location_1} - ${hotel.location_2} (${moment(hotel.first_check_in_at).format('DD MMM YYYY')})` : "Select Hotel"
                                    }} onChange={e => setQuery(e.target.value)} />
                                    <Combobox.Container afterLeave={() => setQuery('')}>
                                        {
                                            queriedHotels.length === 0
                                                ? <p className="text-center">No hotel found</p>
                                                : queriedHotels.map(hotel => (
                                                    <Combobox.Option disabled={hotel.packages_left === 0} key={hotel.id} value={hotel} className="flex-col !justify-start !items-start">
                                                        <div className="flex items-center">
                                                            <span>{hotel.location_1}</span>
                                                            <ArrowRightIcon className="w-4 h-4 mx-1" />
                                                            <span>{hotel.location_2}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <small className="text-xs opacity-70">{hotel.program_type} days program</small>
                                                            <small className="text-sm opacity-80">&middot; {formatIDR(hotel.price_per_package)}</small>
                                                        </div>
                                                        <p className="text-xs opacity-60">{moment(hotel.first_check_in_at).format("DD MMMM YYYY")} - {moment(hotel.last_check_out_at).format('DD MMMM YYYY')}</p>
                                                        <p className="text-xs opacity-50">Available: {hotel.packages_left}x</p>
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
                                <Input type="number" min={1} value={data.amount} name="amount" label="Amount" onChange={(e) => handleChange('amount', e.target.value)} />
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
                    <button type="submit" className="btn-rose">Update</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}