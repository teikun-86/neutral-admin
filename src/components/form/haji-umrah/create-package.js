import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, objectExceptKeys, searchString } from "@/util"
import { ArrowRightIcon, ArrowsRightLeftIcon } from "@heroicons/react/24/outline"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState } from "recoil"
import { Input } from "../input"
import { InputError } from "../input-error"
import { Options } from "../options"

export const CreatePackage = ({ refetch }) => {
    const [modalOpenState, setModalState] = useRecoilState(modalState)
    const [loading, setLoading] = useState(false)
    const [flights, setFlights] = useState([])
    const [hotels, setHotels] = useState([])
    const [query, setQuery] = useState('')
    const [message, setMessage] = useState(null)
    const { data, handleChange, reset, errors, setErrors } = useForm({
        flight: {},
        hotel: {},
        packages_available: 0,
        price_per_package: 0,
        seats_per_package: 0,
        hotels_per_package: 0,
        program_type: "9"
    })

    const fetchData = async () => {
        setLoading(true)
        await axios.get("/hajj-umrah/flights").then(res => {
            setFlights(res.data.flights)
        }).catch(err => {
            toast.error("Failed to fetch flight data.")
            console.log(err);
        })

        await axios.get("/hajj-umrah/hotels").then(res => {
            setHotels(res.data.hotels)
        }).catch(err => {
            toast.error("Failed to fetch hotel data.")
            console.log(err);
        })

        setLoading(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setMessage(null)
        setErrors({})
        setLoading(true)
        await axios.post("/hajj-umrah/packages/store", {
            flight_id: data.flight.id,
            hotel_id: data.hotel.id,
            packages_available: data.packages_available,
            price_per_package: data.price_per_package,
            seats_per_package: data.seats_per_package,
            hotels_per_package: data.hotels_per_package,
            program_type: data.program_type
        }).then(res => {
            setLoading(false)
            toast.success("Package created.")
            setModalState('')
            reset()
            refetch()
        }).catch(err => {
            toast.error("Failed to create package.")
            if (err.response.status === 422) setErrors(err.response.data.errors)

            setMessage(err.response.data.message)
            setLoading(false)
        })
    }

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
    }, [modalOpenState])

    return (
        <Modal id="createPackageModal" size="lg" static>
            {
                loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-white/50 dark:bg-black/50">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Create Package</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start max-h-[60vh] overflow-y-auto gray-scrollbar">
                    {
                        message && (
                            <Alert title="Something went wrong!" type="error">
                                {message}
                            </Alert>
                        )
                    }
                    <div className="w-full flex flex-wrap">
                        <div className="w-full lg:w-1/2 p-2">
                            <Combobox value={data.flight} onChange={(value) => handleChange('flight', value)}>
                                <Combobox.Input showButton label="Flight" displayValue={(flight) => {
                                    return flight.flight_number ? `${flight.flight_number} (${flight.departure_airport.name} <-> ${flight.arrival_airport.name})` : "Select Flight"
                                }} onChange={e => setQuery(e.target.value)} />
                                <Combobox.Container afterLeave={() => setQuery('')}>
                                    {
                                        queriedFlights.length === 0
                                            ? <p className="text-center">No flight found</p>
                                            : queriedFlights.map(flight => (
                                                <Combobox.Option disabled={flight.available_seats === 0} key={flight.id} value={flight}>
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
                        <div className="w-full lg:w-1/2 p-2">
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
                            <InputError messages={errors.hotel_id} />
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <Input type="number" label="Price" name="price_per_package" value={data.price_per_package} onChange={e => handleChange('price_per_package', e.target.value)} min={0} />
                            <small className="text-xs font-medium text-gray-500">{formatIDR(data.price_per_package)}</small>
                            <InputError messages={errors.price_per_package} />
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <Input type="number" label="Packages Available" name="packages_available" value={data.packages_available} onChange={e => handleChange('packages_available', e.target.value)} min={0} />
                            <InputError messages={errors.packages_available} />
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <Input type="number" label="Seats Per Package" name="seats_per_package" value={data.seats_per_package} onChange={e => handleChange('seats_per_package', e.target.value)} min={0} max={data.flight.available_seats ?? 0} />
                            <InputError messages={errors.seats_per_package} />
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <Input type="number" label="Hotel Packages Per Package" name="hotels_per_package" value={data.hotels_per_package} onChange={e => handleChange('hotels_per_package', e.target.value)} min={0} max={data.hotel.packages_left ?? 0} />
                            <InputError messages={errors.hotels_per_package} />
                        </div>
                        <div className="w-full p-2">
                            <Options label="Program Type" value={data.program_type} onChange={e => handleChange('program_type', e.target.value)}>
                                <Options.Option selected={data.program_type === "9"} value="9">9 Days</Options.Option>
                                <Options.Option selected={data.program_type === "12"} value="12">12 Days</Options.Option>
                            </Options>
                            <InputError messages={errors.hotel_per_package} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button className="btn-text" onClick={() => {
                        reset()
                        setModalState('')
                    }} type="button">Cancel</button>
                    <button className="btn-rose" type="submit">Create</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}