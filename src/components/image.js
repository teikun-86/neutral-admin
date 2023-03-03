import { useEffect, useState } from "react";
import Loader from "./loader";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { config } from "@/util";
import { isObject } from "lodash";
const NextImage = require("next/image");

const Image = ({ src, className = "", spinnerClassName = "w-8 h-8", alt = "", height = 100, width = 100, ...props }) => {
    if (isObject(src)) {
        src = src.src;
    }
    
    const [loading, setLoading] = useState(true)
    const [blob, setBlob] = useState(null)
    const [error, setError] = useState(false)
    const availableSizes = config('app.images.availableSizes')

    const w = availableSizes.reduce((prev, curr) => {
        return (Math.abs(curr - width) < Math.abs(prev - width) ? curr : prev)
    })

    const loadImage = async () => {
        setError(false)
        await fetch(`${config('app.url')}/_next/image?url=${src}&w=${w}&q=80`).then(async res => {
            if (res.status !== 200) throw new Error("Failed to load image from " + src)
            let result = await res.blob()
            let url = URL.createObjectURL(result)
            setBlob(url)
            setLoading(false)
        }).catch(err => {
            console.log("Failed to load image from " + src)
            setError(true)
            setLoading(false)
        })
    }

    useEffect(() => {
        loadImage()
    }, [src])
    
    return (
        <>
            {
                loading
                ? <Loader className={`${spinnerClassName} text-rose-600 dark:text-gray-100`} />
                : (
                    error && !blob
                    ?   <div onClick={loadImage} className={`${className} grid place-items-center`}>
                            <ArrowPathIcon className="w-6 h-6 text-rose-600 dark:text-white" />
                        </div>
                    : <NextImage src={blob} className={className} width={width} height={height} alt={alt} />
                )
            }
        </>
    )
}

export default Image