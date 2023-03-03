import { isEqual } from "lodash"
import { useState } from "react"

export const useForm = (initialValues) => {
    const [data, setData] = useState(initialValues)
    const [errors, setErrors] = useState({})

    const isDirty = isEqual(data, initialValues)
    const reset = () => {
        setData(initialValues)
        setErrors({})
    }

    const handleChange = (field, value) => {
        setData({
            ...data,
            [field]: value
        })
    }

    return {
        data,
        setData,
        handleChange,
        isDirty,
        reset,
        errors,
        setErrors
    }
}