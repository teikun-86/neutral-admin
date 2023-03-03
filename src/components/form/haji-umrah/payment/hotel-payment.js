import { modalState } from "@/atom"
import Alert from "@/components/alert"
import Combobox from "@/components/combobox/combobox"
import Loader from "@/components/loader"
import { Modal } from "@/components/modal"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { formatIDR, searchString } from "@/util"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useSetRecoilState } from "recoil"
import { Input } from "../../input"
import { InputError } from "../../input-error"
import { Options } from "../../options"

export const HotelPayment = ({ reservation, refetch, setReservation }) => {
    const setModalState = useSetRecoilState(modalState)
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [paymentMethods, setPaymentMethods] = useState([])
    const [query, setQuery] = useState('')
    const { data, handleChange, errors, setErrors, reset } = useForm({
        payment_method: {},
        amount: 0,
    })

    const fetchPaymentMethods = async () => {
        setLoading(true)
        await axios.get("/payment/payment-methods").then(res => {
            setLoading(false)
            setPaymentMethods(res.data.data)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch payment methods. Please refresh the page.")
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setErrors({})
        let transformed = {
            id: reservation.id,
            payment_method_code: data.payment_method.code,
            amount: data.amount
        }
        await axios.post("/hajj-umrah/hotels/reservations/add-payment", transformed).then(res => {
            setLoading(false)
            toast.success("Payment added successfully")
            setModalState('')
            setReservation(null)
            refetch()
        }).catch(err => {
            setLoading(false)
            if (err.response.status === 422) {
                setErrors(err.response.data.errors)
            }
            setMessage(err.response.data.message)
            toast.error("Failed to add payment.")
        })
    }

    const cancel = () => {
        setModalState('')
        setReservation(null)
        reset()
    }

    const queriedPaymentMethods = query.trim().length === 0 ? paymentMethods : paymentMethods.filter(pm => {
        return searchString(query, pm.name)
            || searchString(query, pm.code)
    })

    useEffect(() => {
        fetchPaymentMethods()
        console.log("Add payment ");
    }, [reservation])

    return (
        <Modal size="lg" id="createHotelReservationPaymentModal" static>
            {
                loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-white/50 dark:bg-black/20">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Add Payment</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start">
                    {
                        message && (
                            <div className="p-2">
                                <Alert type="error" title="Something went wrong!">{message}</Alert>
                            </div>
                        )
                    }
                    <div className="flex w-full flex-wrap">
                        <div className="w-full p-2">
                            <Combobox value={data.payment_method} onChange={(val) => handleChange('payment_method', val)}>
                                <Combobox.Input label="Payment Method" onChange={e => setQuery(e.target.value)} displayValue={(pm) => pm.name ? `${pm.name} (${pm.code})` : "Select Payment Method"} showButton />
                                <Combobox.Container>
                                    <Combobox.Options>
                                        {
                                            queriedPaymentMethods.length === 0
                                            ? <div className="p-2 text-center text-gray-500 dark:text-gray-400">No payment method found</div>
                                            : queriedPaymentMethods.map(pm => (
                                                <Combobox.Option key={pm.id} value={pm}>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="flex-1">
                                                            <div className="font-semibold">{pm.name}</div>
                                                            <div className="text-sm text-gray-500 dark:text-gray-400">{pm.code}</div>
                                                        </div>
                                                    </div>
                                                </Combobox.Option>
                                            ))
                                        }
                                    </Combobox.Options>
                                </Combobox.Container>
                            </Combobox>
                            <InputError messages={errors.payment_method_code} />
                        </div>
                        <div className="w-full p-2">
                            <Input type="number" value={data.amount} label="Amount" onChange={(e) => handleChange('amount', e.target.value)} max={reservation.amount_due} min={0} />
                            <div className={`flex items-center justify-start ${data.amount > reservation.amount_due ? "text-rose-600 animate-shake" : "text-gray-600 dark:text-gray-300"}`}>
                                <small className="text-gray-800 dark:text-gray-100 text-xs">
                                    {formatIDR(data.amount)}
                                </small>
                                <span className="opacity-80 text-xs">/Max: {formatIDR(reservation.amount_due)}</span>
                            </div>
                            <InputError messages={errors.amount} />
                        </div>
                        <div className="w-full p-2">
                            <div className="flex items-center justify-between">
                                <h6 className="text-gray-900 dark:text-white text-sm">Total Price</h6>
                                <h6 className="text-gray-900 dark:text-white text-sm">{formatIDR(reservation.total_price)}</h6>
                            </div>
                            <div className="flex items-center justify-between">
                                <h6 className="text-gray-900 dark:text-white text-sm">Amount Paid</h6>
                                <h6 className="text-gray-900 dark:text-white text-sm">{formatIDR(reservation.amount_paid)}</h6>
                            </div>
                            <div className="flex items-center justify-between">
                                <h6 className="text-gray-900 dark:text-white text-sm">Amount Due</h6>
                                <h6 className="text-gray-900 dark:text-white text-sm">{formatIDR(reservation.amount_due)}</h6>
                            </div>
                            <div className="flex items-center justify-between">
                                <h6 className="text-gray-900 dark:text-white text-sm">Payment</h6>
                                <h6 className="text-gray-900 dark:text-white text-sm">{formatIDR(data.amount)}</h6>
                            </div>
                            <div className="flex items-center justify-between">
                                <h6 className="text-gray-900 dark:text-white text-sm">Amount Due After This Payment</h6>
                                <h6 className="text-gray-900 dark:text-white text-sm">{formatIDR(reservation.amount_due - data.amount)}</h6>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button onClick={cancel} disabled={loading} type="button" className="btn-light dark:btn-dark">Close</button>
                    <button type="submit" className="btn-rose" disabled={loading}>Submit</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}