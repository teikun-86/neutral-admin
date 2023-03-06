import { modalState } from "@/atom"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { useState } from "react"
import { toast } from "react-toastify"
import { useSetRecoilState } from "recoil"
import Loader from "../loader"
import { Modal } from "../modal"
import { Input } from "./input"
import { InputError } from "./input-error"

export const UpdateAirline = ({
    refetch,
    airline,
    setAirline,
}) => {
    const [loading, setLoading] = useState(false)
    const setModalState = useSetRecoilState(modalState)
    const { data, handleChange, errors, setErrors, reset } = useForm({
        name: airline.name,
        code: airline.code,
        logo: null,
        code_context: airline.code_context,
        id: airline.id
    })

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        let fdata = new FormData()
        fdata.append("id", data.id)
        fdata.append("name", data.name)
        fdata.append("code", data.code)
        fdata.append("code_context", data.code_context)
        if (data.logo !== null) {
            fdata.append("logo", data.logo)
        }
        await axios.post("/airlines/update", fdata, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }).then(res => {
            toast.success("Successfully updated airline.")
            reset()
            refetch()
            setModalState('')
            setAirline(null)
        }).catch(err => {
            setErrors(err.response.data.errors)
            toast.error("Failed to update airline.")
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <Modal id="updateAirlineModal" size="md" static>
            {
                loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-white/50 dark:bg-black/20">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Update Airline</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start">
                    <div className="w-full p-2">
                        <div className="mb-3">
                            <Input name="name" label="Name" value={data.name} onChange={e => handleChange('name', e.target.value)} required />
                            <InputError messages={errors.name} />
                        </div>
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-3">
                            <Input name="code" label="Code" value={data.code} onChange={e => handleChange('code', e.target.value)} required />
                            <InputError messages={errors.code} />
                        </div>
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-3">
                            <Input name="code_context" label="Code Context" value={data.code_context} onChange={e => handleChange('code_context', e.target.value)} required />
                            <InputError messages={errors.code_context} />
                        </div>
                    </div>
                    <div className="w-full p-2">
                        <div className="mb-3">
                            <Input accept=".jpg, .png, .jpeg, .gif, .svg, .webp" name="logo" label="Logo" type="file" onChange={e => handleChange('logo', e.target.files[0])} />
                            <InputError messages={errors.logo} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button type="button" className="btn-light dark:btn-dark" disabled={loading} onClick={() => {
                        reset()
                        setModalState('')
                        setAirline(null)
                    }}>Close</button>
                    <button type="submit" className="btn-rose" disabled={loading}>Create</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}