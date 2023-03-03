import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Image from "@/components/image"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, inArray, searchString } from "@/util"
import { ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useSetRecoilState } from "recoil"
import { Input } from "../input"
import { InputError } from "../input-error"

export const UpdateFlightReservation = ({ refetchReservations = () => { }, reservation, setReservation }) => {

    const setModalState = useSetRecoilState(modalState)
    const [loading, setLoading] = useState(false)
    const [flights, setFlights] = useState([])
    const [companies, setCompanies] = useState([])
    const [users, setUsers] = useState([])
    const [showCompany, setShowCompany] = useState(false)
    const [query, setQuery] = useState('')
    const [message, setMessage] = useState(null)
    const { data, handleChange, setData, reset, errors, setErrors } = useForm({
        reservation_id: reservation.id,
        seats: reservation.seats,
        user: reservation.user,
        flight: reservation.flight,
        company: reservation.company,
    })

    const fetchData = async () => {
        setLoading(true)
        await axios.get("/users").then(res => {
            setUsers(res.data.users)
        }).catch(err => {
            toast.error("Failed to fetch users")
        })

        await axios.get("/companies").then(res => {
            setCompanies(res.data.data)
        }).catch(err => {
            toast.error("Failed to fetch companies")
        })

        await axios.get("/hajj-umrah/flights", {
            params: {}
        }).then(res => {
            setFlights(res.data.flights)
        }).catch(err => {
            toast.error("Failed to fetch flights")
        })

        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        setMessage(null)
        const transformed = {
            reservation_id: data.reservation_id,
            seats: data.seats,
            user_id: data.user.id,
            flight_id: data.flight.id,
            company_id: data.company.id,
            pool: data.flight.company_id === null || moment(data.flight.depart_at).diff(moment(), 'days') < 45
        }

        await axios.post('/hajj-umrah/flights/reservations/update', transformed).then(res => {
            setLoading(false)
            toast.success("Reservation updated")
            setModalState(null)
            reset()
            refetchReservations()
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to update reservation")
            if (err.response.status === 422) {
                setErrors(err.response.data.errors)
                setMessage('The given data was invalid.')
            } else {
                setMessage('Failed to update reservation.')
            }
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
            || searchString(query, company.email)
            || searchString(query, company.ppiu_number)
            || searchString(query, company.phone ?? '')
    })

    const queriedFlights = query.trim().length === 0 ? flights : flights.filter(flight => {
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
    })

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <Modal id="updateFlightReservationModal" size="lg" static>
            {
                loading && (
                    <div className="absolute z-[100] inset-0 w-full bg-white/50 dark:bg-black/50 grid place-items-center">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>
                    Update Flight Reservation
                </Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start">
                    <div className="w-full mb-3">
                        {
                            message && (
                                <Alert title="Something went wrong!" type="error">
                                    {message}
                                </Alert>
                            )
                        }
                        <Combobox value={data.user} onChange={handleUser}>
                            <Combobox.Input showButton onChange={(e) => setQuery(e.target.value)} label="User / Agent" displayValue={
                                (u) => u.name ? u.name : ''
                            } />
                            <Combobox.Container afterLeave={() => setQuery('')}>
                                {
                                    queriedUsers.length === 0
                                        ? <p className="text-center">No user/agent found</p>
                                        : queriedUsers.map(user => (
                                            <Combobox.Option key={user.email} value={user}>
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full overflow-hidden">
                                                        <Image src={user.avatar} alt={user.name} width={100} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold">{user.name}</p>
                                                        <p className="text-xs text-gray-500">{user.email}</p>
                                                    </div>
                                                </div>
                                            </Combobox.Option>
                                        ))
                                }
                            </Combobox.Container>
                        </Combobox>
                        <InputError messages={errors.user_id} />
                    </div>
                    {
                        showCompany && (
                            <div className="w-full mb-3">
                                <Combobox value={data.company} onChange={(value) => handleChange('company', value)}>
                                    <Combobox.Input showButton onChange={(e) => setQuery(e.target.value)} label="Company / PPIU" displayValue={
                                        (c) => c.name ? `${c.name} (PPIU: ${c.ppiu_number})` : ''
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
                    <div className="w-full mb-3">
                        <Combobox value={data.flight} onChange={(value) => handleChange('flight', value)}>
                            <Combobox.Input showButton label="Flight" displayValue={(flight) => {
                                return flight.flight_number ? `${flight.flight_number} (${flight.departure_airport.name} <-> ${flight.arrival_airport.name})` : "Select Flight"
                            }} onChange={e => setQuery(e.target.value)} />
                            <Combobox.Container afterLeave={() => setQuery('')}>
                                {
                                    queriedFlights.length === 0
                                        ? <p className="text-center">No flight found</p>
                                        : queriedFlights.map(flight => (
                                            <Combobox.Option key={flight.id} value={flight}>
                                                <div className="flex flex-col">
                                                    <p className="font-semibold flex items-center text-sm">{flight.airline.code}-{flight.flight_number} ({flight.departure_airport.name} <ArrowsRightLeftIcon className="w-4 h-4 mx-1" /> {flight.arrival_airport.name})</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400">{flight.airline.name} Depart at: {moment(flight.depart_at).format('DD MMM YYYY HH:mm')}</p>
                                                    <p className="text-sm font-medium dark:text-gray-300">{flight.available_seats} seats available - {formatIDR(flight.price)}/<span className="text-xs opacity-70">seat</span></p>
                                                </div>
                                            </Combobox.Option>
                                        ))
                                }
                            </Combobox.Container>
                        </Combobox>
                        <InputError messages={errors.flight_id} />
                    </div>
                    <div className="w-full mb-3">
                        <Input type="number" min={1} value={data.seats} max={data.flight.available_seats ?? 0} onChange={e => handleChange('seats', e.target.value)} label="Seats" />
                        <InputError messages={errors.seats} />
                    </div>
                    <div className="flex flex-col items-end justify-end py-2">
                        <p className="text-sm font-medium dark:text-white">Price/<span className="text-xs opacity-60">seat</span>: {formatIDR(!data.flight.flight_number ? 0 : data.flight.price)}</p>
                        <p className="text-sm font-medium dark:text-white">Total: {formatIDR(!data.flight.flight_number ? 0 : data.flight.price * data.seats)}</p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2 py-2">
                    <button type="button" className="btn-text" onClick={() => {
                        setModalState('')
                        setReservation(null)
                    }}>Cancel</button>
                    <button type="submit" className="btn-rose" >Store</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}