import { useCountdown } from "@/hooks/countdown"
import { axios } from "@/libs/axios"
import { formatIDR, splitString, truncateString } from "@/util"
import moment from "moment"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import Image from "../image"

export const FlightReservationColumn = ({
    res,
    selected,
    select,
    unselect,
    loading,
    updateReservation,
    deleteReservation,
    checkPermission,
    reservationDetail,
    addPayment
}) => {
    const [reservation, setReservation] = useState(res)
    const { isExpired, timeLeft } = useCountdown(new Date(reservation.expired_at))

    const refetch = async () => {
        await axios.get("/hajj-umrah/flights/reservations", {
            params: {
                id: reservation.id
            }
        }).then(res => {
            setReservation(res.data.reservation)
        }).catch(err => {
            toast.error("Failed to refetch reservation data. Please refresh the page.")
        })
    }

    useEffect(() => {
        if (isExpired && !reservation.is_expired) {
            refetch()
        }
    }, [isExpired])

    return (
        <>
            {
                !reservation
                ? (
                    <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                        <td colSpan={12} className="skeleton"></td>
                    </tr>
                )
                : (
                    <>
                        <tr>
                            {
                                checkPermission('haji-umrah.flight.reservation-delete') && (
                                    <td rowSpan={2} className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                        <input type="checkbox" className="form-checkbox" name="select" id={`select-${reservation.id}`} checked={selected.includes(reservation.id)} onChange={(e) => e.target.checked ? select(reservation.id) : unselect(reservation.id)} />
                                    </td>
                                )
                            }
                            <td rowSpan={2}>
                                <div className="flex items-center space-x-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                                        <Image alt={reservation.user.name} src={reservation.user.avatar} className="w-10 h-10 text-gray-500 dark:text-gray-300 rounded-full object-cover" width={100} height={100} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium">{truncateString(reservation.user.name, 16)}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{splitString(reservation.user.email, 8, 10)}</p>
                                    </div>
                                </div>
                            </td>
                            <td rowSpan={2}>
                                <p className="text-sm font-medium">{reservation.company.name}</p>
                            </td>
                            <td className={`md:sticky bg-white dark:bg-gray-900 ${checkPermission('haji-umrah.flight.reservation-delete') ? "left-4" : "-left-2"}`}>
                                <span className="text-xs font-medium uppercase text-gray-500">Departure</span>
                            </td>
                            <td>{reservation.flight.airline.code}-{reservation.flight.flight_number}</td>
                            <td>
                                {reservation.flight.departure_airport.name} ({reservation.flight.departure_airport.iata})
                            </td>
                            <td>
                                {reservation.flight.arrival_airport.name} ({reservation.flight.arrival_airport.iata})
                            </td>
                            <td>
                                {moment(reservation.flight.depart_at).format('DD MMM YYYY HH:mm')}
                            </td>
                            <td>
                                {moment(reservation.flight.arrive_at).format('DD MMM YYYY HH:mm')}
                            </td>
                            <td rowSpan={2}>
                                {moment(reservation.created_at).format('DD MMM YYYY HH:mm')}
                            </td>
                            <td rowSpan={2}>
                                {
                                    reservation.status === 'expired'
                                    ? <p className="text-xs font-medium uppercase text-red-500">Expired at<br/>{moment(reservation.expired_at).format('DD MMM YYYY HH:mm:ss')}</p>
                                    : (
                                        reservation.status === 'pending'
                                        ? <p className="text-xs font-medium uppercase text-yellow-500">
                                            Pending<br/>
                                            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Expires in
                                                    {timeLeft.days > 0 ? `${timeLeft.days}d` : ""}&nbsp;
                                                    {timeLeft.hours > 0 ? `${timeLeft.hours}h` : ""}&nbsp;
                                                    {timeLeft.minutes > 0 ? `${timeLeft.minutes}m` : ""}&nbsp;
                                                    {timeLeft.seconds > 0 ? `${timeLeft.seconds}s` : ""}
                                            </span>
                                        </p>
                                        : <p className="text-xs font-semibold uppercase text-green-500">
                                            {reservation.status === 'paid' ? 'Paid' : 'Partially Paid'}<br/>
                                        </p>
                                    )
                                }
                            </td>
                            <td rowSpan={2}>
                                {reservation.flight.program_type} Days
                            </td>
                            <td rowSpan={2}>
                                {formatIDR(reservation.price_per_seat)}/seat
                            </td>
                            <td rowSpan={2}>
                                {reservation.seats} seats
                            </td>
                            <td rowSpan={2}>
                                {formatIDR(reservation.total_price)}
                            </td>
                            <td rowSpan={2}>
                                {formatIDR(reservation.amount_paid)}
                            </td>
                            <td rowSpan={2}>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => reservationDetail(reservation)} className="btn-light dark:btn-dark">Detail</button>
                                    {
                                        checkPermission('haji-umrah.flight.reservation-update') && (
                                            <button className="btn-light dark:btn-dark" onClick={() => updateReservation(reservation)} disabled={reservation.is_expired}>Update</button>
                                        )
                                    }
                                    {
                                        checkPermission('haji-umrah.flight.reservation-add-payment') && (
                                            <button className="btn-light dark:btn-dark" onClick={() => addPayment(reservation)} disabled={reservation.is_expired || reservation.total_price - reservation.amount_paid <= 0}>Add Payment</button>
                                        )
                                    }
                                    {
                                        checkPermission('haji-umrah.flight.reservation-delete') && (
                                            <button className="btn-rose" onClick={() => deleteReservation(reservation.id)}>Delete</button>
                                        )
                                    }
                                </div>
                            </td>
                        </tr>
                        <tr className="border-b border-gray-300 dark:border-gray-800">
                            <td className={`md:sticky bg-white dark:bg-gray-900 ${checkPermission('haji-umrah.flight.reservation-delete') ? "left-4" : "-left-2"}`}>
                                <span className="text-xs font-medium uppercase text-gray-500">Return</span>
                            </td>
                            <td>{reservation.flight.airline.code}-{reservation.flight.return_flight_number}</td>
                            <td>
                                {reservation.flight.return_departure_airport.name} ({reservation.flight.return_departure_airport.iata})
                            </td>
                            <td>
                                {reservation.flight.return_arrival_airport.name} ({reservation.flight.return_arrival_airport.iata})
                            </td>
                            <td>
                                {moment(reservation.flight.return_depart_at).format('DD MMM YYYY HH:mm')}
                            </td>
                            <td>
                                {moment(reservation.flight.return_arrive_at).format('DD MMM YYYY HH:mm')}
                            </td>
                        </tr>
                    </>
                )
            }
        </>
    )
}