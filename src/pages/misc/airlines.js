import { modalState } from "@/atom";
import { CreateAirline, UpdateAirline } from "@/components/form";
import Image from "@/components/image";
import Loader from "@/components/loader";
import { Modal } from "@/components/modal";
import { useAuth } from "@/hooks/auth";
import AppLayout from "@/layouts/app";
import { axios } from "@/libs/axios";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Fragment, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useSetRecoilState } from "recoil";

const Airlines = () => {
    const { user, checkPermission } = useAuth()
    const checkAllRef = useRef(null)
    const setModalState = useSetRecoilState(modalState)
    const [airlines, setAirlines] = useState([])
    const [loading, setLoading] = useState(false)
    const [airline, setAirline] = useState(null)
    const [deleting, setDeleting] = useState(false)
    
    const fetchAirlines = async () => {
        setLoading(true)
        await axios.get("/airlines").then(res => {
            setAirlines(res.data.data)
            setLoading(false)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch airlines data. Please refresh the page.")
        })
    }

    const updateAirline = (airline) => {
        setAirline(airline)
        setModalState('updateAirlineModal')
    }

    const deleteAirline = (airline) => {
        setAirline(airline)
        setModalState('deleteAirlineModal')
    }

    const doDelete = async () => {
        setDeleting(true)
        await axios.delete("/airlines/delete", {
            params: {
                id: airline.id
            }
        }).then(res => {
            setDeleting(false)
            toast.success("Airline deleted successfully")
            setModalState('')
            fetchAirlines()
        }).catch(err => {
            setDeleting(false)
            toast.error("Failed to delete airline. Please try again later.")
        })
    }

    useEffect(() => {
        fetchAirlines()
    }, [])

    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Airlines</h2>

            <div className="flex items-center justify-end mb-3">
                <button onClick={() => setModalState('createAirlineModal')} className="btn-light dark:btn-dark">Add Airline</button>
            </div>

            <div className="w-full lg:rounded-lg shadow bg-white dark:bg-gray-900 px-2 lg:px-4 py-2">
                <div className="w-full max-w-full overflow-x-auto gray-scrollbar lg:px-2 overflow-y-auto max-h-[80vh]">
                    <table className={`w-full whitespace-nowrap ${loading ? "border-separate" : ""}`}>
                        <thead>
                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-500 [&_>_th]:font-medium [&_>_th]:text-xs [&_>_th]:tracking-wider [&_>_th]:uppercase [&_>_th]:text-start">
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Logo</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Name</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Code</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Code Context</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900"></th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 dark:text-gray-300">
                            {
                                loading
                                    ? (
                                        <>
                                            {
                                                [...Array(10)].map((_, i) => (
                                                    <tr key={i} className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                        <td colSpan={5} className="skeleton"></td>
                                                    </tr>
                                                ))
                                            }
                                        </>
                                    )
                                    : (
                                        <>
                                            {
                                                airlines.length === 0
                                                    ? (
                                                        <>
                                                            <tr>
                                                                <td colSpan="5" className="text-center py-4">No Airlines found</td>
                                                            </tr>
                                                        </>
                                                    )
                                                    : airlines.map((airline, i) => (
                                                        <tr key={i} className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                            <td>
                                                                <Image className="w-auto h-10" src={airline.logo} alt={airline.name} />
                                                            </td>
                                                            <td>{airline.name}</td>
                                                            <td>{airline.code}</td>
                                                            <td>{airline.code_context}</td>
                                                            <td>
                                                                <div className="flex items-center space-x-2">
                                                                    <button onClick={() => updateAirline(airline)} className="btn-light dark:btn-dark">
                                                                        Update
                                                                    </button>
                                                                    <button onClick={() => deleteAirline(airline)} className="btn-rose">
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                            }
                                        </>
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            <CreateAirline refetch={fetchAirlines} />

            {
                airline && (
                    <UpdateAirline airline={airline} setAirline={setAirline} refetch={fetchAirlines} />
                )
            }

            {
                airline && (
                    <Modal id="deleteAirlineModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Flight?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete <strong>{airline.name}</strong>?</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to delete <strong>{airline.name}</strong>?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setAirline(null)
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => doDelete()} className="btn-light mt-3 border-0 dark:btn-dark !w-full">Delete It!</button>
                        </Modal.Footer>
                    </Modal>
                )
            }
        </>
    );
};

Airlines.getLayout = page => <AppLayout title="Airlines">{page}</AppLayout>

export default Airlines;