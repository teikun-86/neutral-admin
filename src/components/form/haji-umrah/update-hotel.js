import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, objectExceptKeys, searchString } from "@/util"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useSetRecoilState } from "recoil"
import { Input } from "../input"
import { InputError } from "../input-error"
import { Options } from "../options"

export const UpdateHotel = ({
    refetchHotel = () => { },
    hotel,
    setHotel = () => {}
}) => {
    const setModalState = useSetRecoilState(modalState)
    const { data, errors, setErrors, handleChange } = useForm({
        id: hotel.id,
        location_1: hotel.location_1,
        location_2: hotel.location_2,
        first_check_in_at: moment(hotel.first_check_in_at).format("YYYY-MM-DD"),
        first_check_out_at: moment(hotel.first_check_out_at).format("YYYY-MM-DD"),
        last_check_in_at: moment(hotel.last_check_in_at).format("YYYY-MM-DD"),
        last_check_out_at: moment(hotel.last_check_out_at).format("YYYY-MM-DD"),
        company: hotel.company,
        room_detail: {
            quad: hotel.room_detail.quad,
            triple: hotel.room_detail.triple,
            double: hotel.room_detail.double,
        },
        price_per_package: hotel.price_per_package,
        packages_available: hotel.packages_available,
        program_type: hotel.program_type,
    })

    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)
    const [companies, setCompanies] = useState([])
    const [query, setQuery] = useState('')

    const queriedCompanies = query.trim().length === 0 ? companies : companies.filter(company => {
        return searchString(query, company.name)
            || searchString(query, company.email)
            || searchString(query, company.phone)
            || searchString(query, company.ppiu_number)
    })

    const getCompanies = async () => {
        setLoading(true)
        await axios.get("/companies").then(res => {
            setLoading(false)
            setCompanies(res.data.data)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch companies. Please try again later.")
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setErrors({})
        setLoading(true)
        setStatus(null)
        let transformed = {
            ...objectExceptKeys(data, 'company'),
            company_id: data.company?.id ?? null,
        }
        await axios.post("/hajj-umrah/hotels/update", transformed).then(res => {
            setLoading(false)
            toast.success("Hotel updated successfully")
            setModalState('')
            refetchHotel()
            setHotel(null)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to update hotel. Please try again later.")
            if (err.response.status === 422) setErrors(err.response.data.errors)
            setStatus(err.response.data.message)
        })
    }

    const handleRoomsChange = (type, rooms) => {
        let roomDetail = data.room_detail
        roomDetail[type] = rooms
        handleChange('room_detail', roomDetail)
    }

    useEffect(() => {
        getCompanies()
    }, [])

    return (
        <Modal size="lg" id="updateHajiUmrahHotelModal" static>
            {
                loading && (
                    <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Update Hotel</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start max-h-[70vh] overflow-y-auto gray-scrollbar">
                    {
                        status && (
                            <Alert type="error" title="Something went wrong">{status}</Alert>
                        )
                    }
                    <div className="w-full flex flex-wrap">
                        <div className="w-full p-2">
                            <div className="mb-3">
                                <Combobox value={data.company} nullable onChange={(val) => handleChange('company', val)}>
                                    <Combobox.Input placeholder="Search company" onChange={(e) => setQuery(e.target.value)} label="Company" displayValue={(comp) => comp !== null ? `${comp.name} (PPIU: ${comp.ppiu_number})` : "No Company"} />
                                    <Combobox.Container afterLeave={() => setQuery('')}>
                                        <Combobox.Options>
                                            {
                                                queriedCompanies.length === 0
                                                    ? <div className="p-2 text-center text-gray-500">No company found</div>
                                                    : queriedCompanies.map((company, index) => (
                                                        <Combobox.Option key={index} value={company}>
                                                            <div className="block text-start">
                                                                <p className="font-semibold text-gray-800 dark:text-gray-200">{company.name}</p>
                                                                <p className="text-sm text-gray-500 dark:text-gray-400">PPIU: <u>{company.ppiu_number}</u></p>
                                                            </div>
                                                        </Combobox.Option>
                                                    ))
                                            }
                                        </Combobox.Options>
                                    </Combobox.Container>
                                </Combobox>
                                <InputError messages={errors.company_id} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.location_1} name="location_1" label="Location 1" type="text" onChange={(e) => handleChange('location_1', e.target.value)} />
                                <InputError messages={errors.location_1} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.location_2} name="location_2" label="Location 2" type="text" onChange={(e) => handleChange('location_2', e.target.value)} />
                                <InputError messages={errors.location_2} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.first_check_in_at} name="first_check_in_at" label="Location 1 Check In" type="date" onChange={(e) => handleChange('first_check_in_at', e.target.value)} />
                                <InputError messages={errors.first_check_in_at} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.first_check_out_at} name="first_check_out_at" label="Location 1 Check Out" type="date" onChange={(e) => handleChange('first_check_out_at', e.target.value)} />
                                <InputError messages={errors.first_check_out_at} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.last_check_in_at} name="last_check_in_at" label="Location 2 Check In" type="date" onChange={(e) => handleChange('last_check_in_at', e.target.value)} />
                                <InputError messages={errors.last_check_in_at} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input value={data.last_check_out_at} name="last_check_out_at" label="Location 2 Check Out" type="date" onChange={(e) => handleChange('last_check_out_at', e.target.value)} />
                                <InputError messages={errors.last_check_out_at} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 xl:w-1/3 p-2">
                            <div className="mb-3">
                                <Options label="Quad Room" onChange={(e) => handleRoomsChange('quad', e.target.value)} value={data.room_detail.quad}>
                                    {
                                        [...Array(10)].map((_, index) => (
                                            <Options.Option key={index} value={index + 1}>{index + 1} {index === 0 ? "Room" : "Rooms"}</Options.Option>
                                        ))
                                    }
                                </Options>
                                <InputError messages={errors.room_detail} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 xl:w-1/3 p-2">
                            <div className="mb-3">
                                <Options label="Triple Room" onChange={(e) => handleRoomsChange('triple', e.target.value)} value={data.room_detail.triple}>
                                    {
                                        [...Array(10)].map((_, index) => (
                                            <Options.Option key={index} value={index + 1}>{index + 1} {index === 0 ? "Room" : "Rooms"}</Options.Option>
                                        ))
                                    }
                                </Options>
                                <InputError messages={errors.room_detail} />
                            </div>
                        </div>
                        <div className="w-full xl:w-1/3 p-2">
                            <div className="mb-3">
                                <Options label="Double Room" onChange={(e) => handleRoomsChange('double', e.target.value)} value={data.room_detail.double}>
                                    {
                                        [...Array(10)].map((_, index) => (
                                            <Options.Option key={index} value={index + 1}>{index + 1} {index === 0 ? "Room" : "Rooms"}</Options.Option>
                                        ))
                                    }
                                </Options>
                                <InputError messages={errors.room_detail} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input type="number" value={data.packages_available} label="Packages Available" onChange={(e) => handleChange('packages_available', e.target.value)} required min={1} />
                                <InputError messages={errors.packages_available} />
                            </div>
                        </div>
                        <div className="w-full lg:w-1/2 p-2">
                            <div className="mb-3">
                                <Input type="number" value={data.price_per_package} label="Price/package" onChange={(e) => handleChange('price_per_package', e.target.value)} required min={1} />
                                <small className="text-gray-600 dark:text-gray-400 text-xs font-medium">{formatIDR(data.price_per_package)}</small>
                                <InputError messages={errors.price_per_package} />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button type="button" className="btn-text" onClick={() => {
                        setHotel('')
                        setModalState('')
                    }}>Close</button>
                    <button type="submit" className="btn-rose" disabled={loading}>Store</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}