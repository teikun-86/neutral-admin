import { modalState } from "@/atom";
import Combobox from "@/components/combobox/combobox";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { useForm } from "@/hooks/form";
import { axios } from "@/libs/axios";
import { formatIDR, searchString, truncateString } from "@/util";
import moment from "moment";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";
import { Input } from "../input";
import { InputError } from "../input-error";

export const UpdateFlight = ({ refetchFlights = () => { }, flight, setFlight }) => {
    const setModalState = useSetRecoilState(modalState)
    const [airports, setAirports] = useState([])
    const [airlines, setAirlines] = useState([])
    const [companies, setCompanies] = useState([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState([])
    const [message, setMessage] = useState(null)
    const [query, setQuery] = useState('')

    const queriedAirlines = airlines.filter(airline => searchString(query, airline.name))
    const queriedCompanies = companies.filter(company => searchString(query, company.name))

    const queriedAirports = query.trim().length < 3 ? [] : airports.filter(airport => {
        return searchString(query.trim(), airport.iata)
            || searchString(query.trim(), airport.name)
            || searchString(query.trim(), airport.country.name)
            || searchString(query.trim(), airport.city.name)
    })

    const { data, handleChange, reset } = useForm({
        id: flight.id,
        company: flight.company,
        airline: flight.airline,
        departure_airport: flight.departure_airport,
        arrival_airport: flight.arrival_airport,
        depart_at: moment(flight.depart_at).format('YYYY-MM-DD\THH:mm'),
        arrive_at: moment(flight.arrive_at).format('YYYY-MM-DD\THH:mm'),
        return_departure_airport: flight.return_departure_airport,
        return_arrival_airport: flight.return_arrival_airport,
        return_depart_at: moment(flight.return_depart_at).format('YYYY-MM-DD\THH:mm'),
        return_arrive_at: moment(flight.return_arrive_at).format('YYYY-MM-DD\THH:mm'),
        flight_number: flight.flight_number,
        return_flight_number: flight.return_flight_number,
        program_type: flight.program_type,
        seats: flight.seats,
        price: flight.price,
    })

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true)
        setMessage(null)
        setErrors({})
        let transformed = transform()
        await axios.post('/hajj-umrah/flights/update', transformed).then(res => {
            setModalState('')
            reset()
            refetchFlights()
            setFlight(null)
            setLoading(false)
            setMessage(res.data.message)
            setErrors({})
        }).catch(err => {
            setLoading(false)
            if (err.response.status === 422) {
                setErrors(err.response.data.errors)
            }
            setMessage(err.response.data.message)
        })
    }

    const transform = () => {
        return {
            id: data.id,
            company_id: data.company ? data.company.id : null,
            airline_id: data.airline.id,
            departure_airport_id: data.departure_airport.id,
            arrival_airport_id: data.arrival_airport.id,
            depart_at: moment(data.depart_at).format("YYYY-MM-DD HH:mm"),
            arrive_at: moment(data.arrive_at).format("YYYY-MM-DD HH:mm"),
            flight_number: data.flight_number,
            program_type: data.program_type,
            seats: data.seats,
            price: data.price,
            return_departure_airport_id: data.return_departure_airport.id,
            return_arrival_airport_id: data.return_arrival_airport.id,
            return_depart_at: moment(data.return_depart_at).format("YYYY-MM-DD HH:mm"),
            return_arrive_at: moment(data.return_arrive_at).format("YYYY-MM-DD HH:mm"),
            return_flight_number: data.return_flight_number,
        }
    }

    const fetchData = useCallback(async () => {
        setLoading(true)
        await axios.get("/companies").then(res => {
            setCompanies(res.data.data)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch data")
        })

        await axios.get("/airlines").then(res => {
            let providers = res.data.data
            setAirlines(providers)
            if (providers.length > 0) {
                handleChange('airline', providers[0])
            }
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch data")
        })

        await axios.get("/airports?intl=1").then(res => {
            setAirports(res.data.airports)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch data")
        })

        setLoading(false)
    }, [])

    useEffect(() => {
        fetchData()
    }, [])

    return (
        <Modal id="updateHajiUmrahFlightModal" static size="lg" onClose={() => {}}>
            {
                loading && (
                    <div className="w-full h-full absolute z-[100] inset-0 bg-white/50 dark:bg-black/50 grid place-items-center">
                        <Loader className="w-12 h-12 text-rose-500" />
                    </div>
                )
            }
            <Modal.Header>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Update Flight</h4>
            </Modal.Header>
            {
                flight && (
                    <form onSubmit={handleSubmit}>
                        <Modal.Body className="max-h-[60vh] overflow-y-auto gray-scrollbar text-start">
                            <div className="flex flex-wrap w-full">
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox nullable value={data.company} className="w-full" onChange={(value) => {
                                        handleChange('company', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Company" showButton displayValue={(d) => d !== null ? d.name : "No Company"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedCompanies.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center">
                                                            No Companies found
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedCompanies.map(company => (
                                                                    <Combobox.Option key={company.id} value={company}>
                                                                        {company.name}
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.company_id} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox nullable value={data.program_type} className="w-full" onChange={(value) => {
                                        handleChange('program_type', value)
                                    }}>
                                        <Combobox.Input readOnly onChange={(e) => setQuery(e.target.value)} label="Program Type" showButton displayValue={(d) => `${d} Days`} />
                                        <Combobox.Container>
                                            <Combobox.Options>
                                                <Combobox.Option value="9">
                                                    9 Days
                                                </Combobox.Option>
                                                <Combobox.Option value="12">
                                                    12 Days
                                                </Combobox.Option>
                                            </Combobox.Options>
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.program_type} />
                                </div>
                            </div>
                            <div className="w-full text-start flex flex-wrap">
                                <h5 className="text-sm w-full font-semibold text-gray-700 dark:text-gray-200 uppercase my-2">Flight Detail</h5>
                                <div className="w-full p-2">
                                    <Combobox value={data.airline} className="w-full" onChange={(value) => {
                                        handleChange('airline', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Airline" showButton displayValue={(d) => d !== null ? `${d.name} (${d.code})` : "Select Airline"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedAirlines.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center">
                                                            No airline found
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedAirlines.map(airline => (
                                                                    <Combobox.Option key={airline.id} value={airline}>
                                                                        {airline.name}
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.airline_id} />
                                </div>
                                <h6 className="text-xs w-full font-medium text-gray-600 dark:text-gray-300 uppercase my-2">Departure</h6>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox value={data.departure_airport} className="w-full" onChange={(value) => {
                                        handleChange('departure_airport', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Departure Airport" showButton displayValue={(d) => d !== null ? `${d.name} (${d.iata})` : "No Airport"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedAirports.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center text-gray-500">
                                                            {
                                                                query.trim().length < 3 ? "Type minimum 3 characters to search" : "No airport found"
                                                            }
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedAirports.map(airport => (
                                                                    <Combobox.Option className="!flex-col !items-start" key={airport.id} value={airport}>
                                                                        {truncateString(airport.name, 20)} ({airport.iata})
                                                                        <small className="text-xs font-medium text-gray-500">
                                                                            {airport.city.name}, {airport.country.name}
                                                                        </small>
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.departure_airport_id} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox value={data.arrival_airport} className="w-full" onChange={(value) => {
                                        handleChange('arrival_airport', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Departure Airport" showButton displayValue={(d) => d !== null ? `${d.name} (${d.iata})` : "No Airport"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedAirports.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center text-gray-500">
                                                            {
                                                                query.trim().length < 3 ? "Type minimum 3 characters to search" : "No airport found"
                                                            }
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedAirports.map(airport => (
                                                                    <Combobox.Option className="!flex-col !items-start" key={airport.id} value={airport}>
                                                                        {truncateString(airport.name, 20)} ({airport.iata})
                                                                        <small className="text-xs font-medium text-gray-500">
                                                                            {airport.city.name}, {airport.country.name}
                                                                        </small>
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.arrival_airport_id} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="datetime-local" label="Departure At" value={data.depart_at} onChange={(e) => handleChange('depart_at', e.target.value)} />
                                    <InputError messages={errors.depart_at} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="datetime-local" label="Arrive At" value={data.arrive_at} onChange={(e) => handleChange('arrive_at', e.target.value)} />
                                    <InputError messages={errors.arrive_at} />
                                </div>
                                <div className="w-full p-2">
                                    <Input type="text" name="flight_number" placeholder="1234" required value={data.flight_number} onChange={e => handleChange('flight_number', e.target.value)} label="Flight Number" />
                                    <InputError messages={errors.flight_number} />
                                </div>
                                <h6 className="text-xs w-full font-medium text-gray-600 dark:text-gray-300 uppercase my-2">Return</h6>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox value={data.return_departure_airport} className="w-full" onChange={(value) => {
                                        handleChange('return_departure_airport', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Departure Airport" showButton displayValue={(d) => d !== null ? `${d.name} (${d.iata})` : "No Airport"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedAirports.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center text-gray-500">
                                                            {
                                                                query.trim().length < 3 ? "Type minimum 3 characters to search" : "No airport found"
                                                            }
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedAirports.map(airport => (
                                                                    <Combobox.Option className="!flex-col !items-start" key={airport.id} value={airport}>
                                                                        {truncateString(airport.name, 20)} ({airport.iata})
                                                                        <small className="text-xs font-medium text-gray-500">
                                                                            {airport.city.name}, {airport.country.name}
                                                                        </small>
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.return_departure_airport_id} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Combobox value={data.return_arrival_airport} className="w-full" onChange={(value) => {
                                        handleChange('return_arrival_airport', value)
                                    }}>
                                        <Combobox.Input onChange={(e) => setQuery(e.target.value)} label="Departure Airport" showButton displayValue={(d) => d !== null ? `${d.name} (${d.iata})` : "No Airport"} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            {
                                                queriedAirports.length === 0
                                                    ? (
                                                        <p className="py-3 px-2 text-center text-gray-500">
                                                            {
                                                                query.trim().length < 3 ? "Type minimum 3 characters to search" : "No airport found"
                                                            }
                                                        </p>
                                                    )
                                                    : (
                                                        <Combobox.Options>
                                                            {
                                                                queriedAirports.map(airport => (
                                                                    <Combobox.Option className="!flex-col !items-start" key={airport.id} value={airport}>
                                                                        {truncateString(airport.name, 20)} ({airport.iata})
                                                                        <small className="text-xs font-medium text-gray-500">
                                                                            {airport.city.name}, {airport.country.name}
                                                                        </small>
                                                                    </Combobox.Option>
                                                                ))
                                                            }
                                                        </Combobox.Options>
                                                    )
                                            }
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.return_arrival_airport_id} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="datetime-local" label="Departure At" value={data.return_depart_at} onChange={(e) => handleChange('return_depart_at', e.target.value)} />
                                    <InputError messages={errors.return_depart_at} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="datetime-local" label="Arrive At" value={data.return_arrive_at} onChange={(e) => handleChange('return_arrive_at', e.target.value)} />
                                    <InputError messages={errors.return_arrive_at} />
                                </div>
                                <div className="w-full p-2">
                                    <Input type="text" name="return_flight_number" placeholder="5678" required value={data.return_flight_number} onChange={e => handleChange('return_flight_number', e.target.value)} label="Flight Number" />
                                    <InputError messages={errors.return_flight_number} />
                                </div>
                            </div>
                            <div className="w-full text-start flex flex-wrap mt-3">
                                <h5 className="text-sm w-full font-semibold text-gray-700 dark:text-gray-200 uppercase my-2">Seats & Price</h5>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="number" min={1} value={data.seats} name="seats" onChange={(e) => handleChange('seats', e.target.value)} label="Seats Available" />
                                    <InputError messages={errors.seats} />
                                </div>
                                <div className="w-full lg:w-1/2 p-2">
                                    <Input type="number" min={1} value={data.price} name="price" onChange={(e) => handleChange('price', e.target.value)} label="Price/seat" />
                                    <small className="text-xs font-medium text-gray-500">{formatIDR(data.price)}</small>
                                    <InputError messages={errors.price} />
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="flex items-center justify-end py-2 space-x-3">
                            <button type="button" className="btn-text" onClick={() => setModalState('')}>Cancel</button>
                            <button type="submit" className="btn-rose">Update</button>
                        </Modal.Footer>
                    </form>
                )
            }
        </Modal>
    )
}