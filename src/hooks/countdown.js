import { useCallback, useEffect, useRef, useState } from "react"

/**
 * @param {Date} endTime
 */
export const useCountdown = (endTime, options = {
    onExpired: () => {}
}) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })
    const expiredOnce = useRef(false)
    const timer = useRef(null)

    const isExpired = endTime < new Date().getTime()

    const calculateTimeLeft = useCallback(() => {
        const difference = endTime - new Date().getTime()
        let timeLeft = {}

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60)
            }
        }

        return timeLeft
    }, [endTime])

    const stop = useCallback(() => {
        clearInterval(timer.current)
    }, [])

    const tick = useCallback(() => {
        setTimeLeft(calculateTimeLeft())
    }, [setTimeLeft, calculateTimeLeft])

    useEffect(() => {
        const ticker = endTime ? setInterval(tick, 1000) : null
        timer.current = ticker
        
        return () => clearInterval(timer.current)
    }, [tick, endTime])

    useEffect(() => {
        if (isExpired && !expiredOnce.current) {
            expiredOnce.current = true
            options.onExpired()
        }
    }, [isExpired, options])

    return { timeLeft, isExpired, stop }
}