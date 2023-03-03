import { useCallback, useEffect, useState } from "react";

export default function useViewport({
    onScroll = () => {},
    onResize = () => {},
}) {
    const [scroll, setScroll] = useState({
        x: 0,
        y: 0,
    })
    const [width, setWidth] = useState(0)
    const [height, setHeight] = useState(0)

    const handleScroll = useCallback(() => {
        setScroll({
            x: window.scrollX,
            y: window.scrollY,
        })
        onScroll()
    }, [onScroll])
    
    const handleResize = useCallback(() => {
        setWidth(window.innerWidth)
        setHeight(window.innerHeight)
        onResize()
    }, [onResize])

    useEffect(() => {
        window.addEventListener('scroll', handleScroll)
        window.addEventListener('resize', handleResize)

        return () => {
            window.removeEventListener('scroll', handleScroll)
            window.removeEventListener('resize', handleResize)
        }
    }, [handleResize, handleScroll])

    useEffect(() => {
        onScroll()
        onResize()
    }, [])

    return {
        scroll,
        width,
        height,
        handleResize,
        handleScroll
    }
}