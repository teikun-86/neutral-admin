import { modalState } from "@/atom"
import { useForm } from "@/hooks/form"
import { axios } from "@/libs/axios"
import { searchString } from "@/util"
import { useCallback, useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useRecoilState } from "recoil"
import Combobox from "../combobox/combobox"
import Image from "../image"
import Loader from "../loader"
import { Modal } from "../modal"
import { Input } from "./input"
import { InputError } from "./input-error"
import { Options } from "./options"

export const CreateUser = ({ refetch }) => {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [roles, setRoles] = useState([])
    const [companies, setCompanies] = useState([])
    const [countries, setCountries] = useState([])
    const [query, setQuery] = useState('')
    const [modal, setModalState] = useRecoilState(modalState)
    const [showPassword, setShowPassword] = useState(false)

    const { data, handleChange, errors, setErrors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        user_type: "personal",
        country: {},
        role: {},
        company: {},
    })

    const fetchData = useCallback(async () => {
        setLoading(true)
        await axios.get("/companies").then(res => {
            setCompanies(res.data.data)
        }).catch(err => {
            toast.error("Failed to fetch companies.")
        })

        await axios.get("/roles").then(res => {
            setRoles(res.data.data)
        }).catch(err => {
            toast.error("Failed to fetch roles.")
        })

        await axios.get('/countries').then(res => {
            setCountries(res.data.data)
        }).catch(err => {
            toast.error("Failed to fetch countries.")
        })
        
        setLoading(false)
    }, [modal])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        setErrors({})
        let transformed = {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: data.password,
            password_confirmation: data.password_confirmation,
            user_type: data.user_type,
            country_id: data.country.id,
            role_id: data.role.id,
            company_id: data.company?.id,
        }
        await axios.post("/users/store", transformed).then(res => {
            setLoading(false)
            toast.success("User created successfully")
            refetch()
            setModalState('')
            reset()
        }).catch(err => {
            setLoading(false)
            if (err.response.status === 422) {
                setErrors(err.response.data.errors)
            }
            setMessage(err.response.data.message)
            toast.error("Failed to create user.")
        })
    }
    
    const queriedCompanies = companies.filter(company => searchString(query, company.name))

    const queriedCountries = query.trim().length === 0 ? countries : countries.filter(country => {
        return searchString(query, country.name) || searchString(query, country.dial_code)
    })
    
    useEffect(() => {
        fetchData()
    }, [fetchData])

    return (
        <Modal id="createUserModal" size="lg" static>
            {
                loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-white/50 dark:bg-black/20">
                        <Loader className="w-10 h-10 text-rose-600" />
                    </div>
                )
            }
            <Modal.Header>
                <Modal.Title>Create User</Modal.Title>
            </Modal.Header>
            <form onSubmit={handleSubmit}>
                <Modal.Body className="text-start max-h-[80vh] overflow-y-auto gray-scrollbar">
                    <div className="w-full flex flex-wrap">
                        <div className="w-full md:w-1/2 p-2">
                            <Input name="name" label="Name" value={data.name} onChange={e => handleChange('name', e.target.value)} required />
                            <InputError messages={errors.name} />
                        </div>
                        <div className="w-full md:w-1/2 p-2">
                            <Input name="email" type="email" label="Email" value={data.email} onChange={e => handleChange('email', e.target.value)} required />
                            <InputError messages={errors.email} />
                        </div>
                        <div className="w-full flex items-center p-2">
                            <div className="w-1/4">
                                <Combobox value={data.country} onChange={(val) => handleChange('country', val)}>
                                    <Combobox.Input className="rounded-r-none" label="Country" showButton displayValue={(country) => country.name ? `${country.code} (${country.dial_code})` : "Select Country"} onChange={e => setQuery(e.target.value)} />
                                    <Combobox.Container className="!w-72 left-0" afterLeave={() => setQuery('')}>
                                        <Combobox.Options>
                                            {
                                                queriedCountries.length === 0
                                                ? (
                                                    <div className="p-2 text-center text-gray-500 dark:text-gray-400">
                                                        No countries found
                                                    </div>
                                                )
                                                : queriedCountries.map(country => (
                                                    <Combobox.Option key={country.id} value={country}>
                                                        <div className="flex items-center">
                                                            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                                                                <Image src={country.flag} className="w-5 h-5" alt={country.name} />
                                                            </div>
                                                            <div className="ml-2">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{country.name}</div>
                                                                <div className="text-sm text-gray-500 dark:text-gray-400">{country.dial_code}</div>
                                                            </div>
                                                        </div>
                                                    </Combobox.Option>
                                                ))
                                            }
                                        </Combobox.Options>
                                    </Combobox.Container>
                                </Combobox>
                                <InputError messages={errors.country_id} />
                            </div>
                            <div className="w-3/4">
                                <Input placeholder="81234567890" type="text" id="phone" name="phone" label="Phone Number" value={data.phone} onChange={(e) => handleChange('phone', e.target.value)} onlyNumbers className="rounded-l-none" />
                                <InputError errors={errors.phone} />
                            </div>
                        </div>
                        {
                            data.user_type === 'company' && (
                                <div className="w-full md:w-1/2 p-2">
                                    <Combobox value={data.company} onChange={(val) => handleChange('company', val)} nullable>
                                        <Combobox.Input label="Company" showButton displayValue={(company) => company.name ? `${company.name} (PPIU: ${company.ppiu_number})` : "Select Company"} onChange={e => setQuery(e.target.value)} />
                                        <Combobox.Container afterLeave={() => setQuery('')}>
                                            <Combobox.Options>
                                                {
                                                    queriedCompanies.length === 0
                                                        ? (
                                                            <div className="p-2 text-center text-gray-500 dark:text-gray-400">
                                                                No companies found
                                                            </div>
                                                        )
                                                        : queriedCompanies.map(company => (
                                                            <Combobox.Option key={company.id} value={company}>
                                                                {company.name}
                                                            </Combobox.Option>
                                                        ))
                                                }
                                            </Combobox.Options>
                                        </Combobox.Container>
                                    </Combobox>
                                    <InputError messages={errors.company_id} />
                                </div>
                            )
                        }
                        <div className="w-full md:w-1/2 p-2">
                            <Options label="User Type" onChange={e => handleChange('user_type', e.target.value)}>
                                <Options.Option selected={data.user_type === "personal"} value="personal">Personal</Options.Option>
                                <Options.Option selected={data.user_type === "agent"} value="agent">Agent</Options.Option>
                                <Options.Option selected={data.user_type === "company"} value="company">Company</Options.Option>
                            </Options>
                        </div>
                        <div className="w-full md:w-1/2 p-2">
                            <Options label="Role" onChange={e => handleChange('role_id', e.target.value)}>
                                <Options.Option selected={data.role_id === null} value={null}>No Role</Options.Option>
                                {
                                    roles.map(role => (
                                        <Options.Option key={role.id} selected={data.role_id === role.id} value={role.id}>{role.display_name}</Options.Option>
                                    ))
                                }
                            </Options>
                        </div>
                        <div className="w-full md:w-1/2 p-2">
                            <Input name="password" type={showPassword ? 'text' : 'password'} label="Password" value={data.password} onChange={e => handleChange('password', e.target.value)} required />
                            <InputError messages={errors.password} />
                        </div>
                        <div className="w-full md:w-1/2 p-2">
                            <Input name="password_confirmation" type={showPassword ? 'text' : 'password'} label="Password Confirmation" value={data.password_confirmation} onChange={e => handleChange('password_confirmation', e.target.value)} required />
                            <InputError messages={errors.password_confirmation} />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end space-x-2">
                    <button type="button" className="btn-light dark:btn-dark" disabled={loading} onClick={() => {
                        reset()
                        setModalState('')
                    }}>Close</button>
                    <button type="submit" className="btn-rose" disabled={loading}>Create</button>
                </Modal.Footer>
            </form>
        </Modal>
    )
}