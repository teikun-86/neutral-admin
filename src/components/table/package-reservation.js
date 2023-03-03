import { useCountdown } from "@/hooks/countdown"
import { formatIDR, splitString, truncateString } from "@/util"
import moment from "moment"
import { useEffect, useState } from "react"
import Image from "../image"

export const PackageReservationColumn = ({
    res,
    selected,
    select,
    unselect,
    loading,
    updateReservation,
    deleteReservation,
    checkPermission,
    addPayment
}) => {
    const [reservation, setReservation] = useState(res)
    const { isExpired, timeLeft } = useCountdown(new Date(reservation.expired_at))

    const refetch = async () => {
        await axios.get("/hajj-umrah/packages/reservations", {
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
                        <tr className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                            {
                                checkPermission('haji-umrah.package.reservation-delete') && (
                                    <td className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                        <input type="checkbox" className="form-checkbox" name="select" id={`select-${reservation.id}`} checked={selected.includes(reservation.id)} onChange={(e) => e.target.checked ? select(reservation.id) : unselect(reservation.id)} />
                                    </td>
                                )
                            }
                            <td>
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
                            <td>
                                {reservation.package.flight.airline.name}
                            </td>
                            <td>
                                <p>Departure: {reservation.package.flight.airline.code}-{reservation.package.flight.flight_number}</p>
                                <p>Return: {reservation.package.flight.airline.code}-{reservation.package.flight.return_flight_number}</p>
                            </td>
                            <td>
                                <p>Departure: {moment(reservation.package.flight.depart_at).format("DD MMM YYYY")}</p>
                                <p>Return: {moment(reservation.package.flight.return_depart_at).format("DD MMM YYYY")}</p>
                            </td>
                            <td>
                                <p>{reservation.package.hotel.location_1}: {moment(reservation.package.hotel.first_check_in_at).format('DD MMM YYYY')}</p>
                                <p>{reservation.package.hotel.location_2}: {moment(reservation.package.hotel.last_check_in_at).format('DD MMM YYYY')}</p>
                            </td>
                            <td>
                                <p>{reservation.package.hotel.location_1}: {moment(reservation.package.hotel.first_check_out_at).format('DD MMM YYYY')}</p>
                                <p>{reservation.package.hotel.location_2}: {moment(reservation.package.hotel.last_check_out_at).format('DD MMM YYYY')}</p>
                            </td>
                            <td>
                                <p>{reservation.package.hotel.room_detail.quad} Quad</p>
                                <p>{reservation.package.hotel.room_detail.triple} Triple</p>
                                <p>{reservation.package.hotel.room_detail.double} Double</p>
                            </td>
                            <td>{reservation.package.program_type} Days</td>
                            <td>
                                {
                                    reservation.status === 'expired'
                                        ? <p className="text-xs font-medium uppercase text-red-500">Expired at<br />{moment(reservation.expired_at).format('DD MMM YYYY HH:mm:ss')}</p>
                                        : (
                                            reservation.status === 'pending'
                                                ? <p className="text-xs font-medium uppercase text-yellow-500">
                                                    Pending<br />
                                                    <span className="text-xs font-normal text-gray-500 dark:text-gray-400">Expires in
                                                        {timeLeft.days > 0 ? `${timeLeft.days}d` : ""}&nbsp;
                                                        {timeLeft.hours > 0 ? `${timeLeft.hours}h` : ""}&nbsp;
                                                        {timeLeft.minutes > 0 ? `${timeLeft.minutes}m` : ""}&nbsp;
                                                        {timeLeft.seconds > 0 ? `${timeLeft.seconds}s` : ""}
                                                    </span>
                                                </p>
                                                : <p className="text-xs font-semibold uppercase text-green-500">
                                                    {reservation.status === 'paid' ? 'Paid' : 'Partially Paid'}<br />
                                                </p>
                                        )
                                }
                            </td>
                            <td>{formatIDR(reservation.price_per_package)}</td>
                            <td>{formatIDR(reservation.total_price)}</td>
                            <td>{formatIDR(reservation.amount_paid)}</td>
                            <td>{formatIDR(reservation.amount_due)}</td>
                            <td>
                                <div className="flex items-center space-x-2">
                                    {
                                        checkPermission('haji-umrah.package.reservation-update') && (
                                            <button disabled={reservation.is_expired} className="btn-light dark:btn-dark" onClick={() => updateReservation(reservation)}>Update</button>
                                        )
                                    }
                                    {
                                        checkPermission('haji-umrah.package.reservation-add-payment') && (
                                            <button disabled={reservation.is_expired || reservation.total_price - reservation.amount_paid <= 0} className="btn-light dark:btn-dark" onClick={() => addPayment(reservation)}>Add Payment</button>
                                        )
                                    }
                                    {
                                        checkPermission('haji-umrah.package.reservation-delete') && (
                                            <button className="btn-rose" onClick={() => deleteReservation(reservation.id)}>Delete</button>
                                        )
                                    }
                                </div>
                            </td>
                        </tr>
                    )
            }
        </>
    )
}