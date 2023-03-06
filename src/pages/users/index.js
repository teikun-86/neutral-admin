import { modalState } from '@/atom';
import { Dropdown } from '@/components/dropdown';
import { CreateUser, UpdateUser } from '@/components/form';
import { AscendingIcon } from '@/components/icons/ascending';
import { DescendingIcon } from '@/components/icons/descending';
import Image from '@/components/image';
import Loader from '@/components/loader';
import { Modal } from '@/components/modal';
import { useAuth } from '@/hooks/auth';
import AppLayout from '@/layouts/app';
import { axios } from '@/libs/axios';
import { searchString } from '@/util';
import { CalendarDaysIcon, ChevronDownIcon, ExclamationTriangleIcon, MagnifyingGlassIcon, TrashIcon, UserIcon } from '@heroicons/react/24/outline';
import moment from 'moment';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useSetRecoilState } from 'recoil';

const User = () => {
    const { checkPermission } = useAuth()
    const checkAllRef = useRef(null)
    const setModalState = useSetRecoilState(modalState)
    const [users, setUsers] = useState([])
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [query, setQuery] = useState('')
    const [selected, setSelected] = useState([])
    const [toDelete, setToDelete] = useState([])
    const [orderBy, setOrderBy] = useState({
        column: 'name',
        direction: 'asc'
    })

    const sortBy = (column, direction) => setOrderBy({ column, direction })

    const getUsers = useCallback(async () => {
        setLoading(true)
        setSelected([])
        setQuery('')
        await axios.get("/users", {
            params: {
                order_by: orderBy.column,
                order_direction: orderBy.direction,
            }
        }).then(res => {
            setUsers(res.data.users)
            setLoading(false)
        }).catch(err => {
            setLoading(false)
            toast.error("Failed to fetch users data. Please refresh the page.")
        })
    }, [orderBy])

    const updateUser = user => {
        setUser(user)
        setModalState('updateUserModal')
    }

    const deleteUser = id => {
        setToDelete(Array.isArray(id) ? id : [id])
        setModalState('deleteUserModal')
    }

    const doDelete = async () => {
        setDeleting(true)
        await axios.delete("/users/destroy", {
            params: {
                ids: toDelete
            }
        }).then(res => {
            setDeleting(false)
            toast.success("User deleted successfully")
            getUsers()
            setModalState('')
        }).catch(err => {
            setDeleting(false)
            toast.error("Failed to delete user. Please try again later.")
        })
    }

    const queriedUsers = query.trim().length === 0 ? users : users.filter(user => {
        return searchString(query, user.name)
            || searchString(query, user.email)
            || searchString(query, user.phone ?? '')
            || searchString(query, user.roles[0]?.name ?? '')
            || searchString(query, user.user_type)
    })

    const allChecked = selected.length === queriedUsers.length && queriedUsers.length > 0

    const handleCheck = (id, checked) => {
        if (checked) {
            setSelected([...selected, id])
        } else {
            setSelected(selected.filter(s => s !== id))
        }
    }

    const selectAll = () => setSelected(queriedUsers.map(user => user.id))

    const unselectAll = () => setSelected([])

    useEffect(() => {
        getUsers()
    }, [getUsers])

    useEffect(() => {
        if (checkAllRef.current) {
            checkAllRef.current.indeterminate = selected.length > 0 && selected.length < queriedUsers.length
        }
    }, [selected])
    
    return (
        <>
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white">Users</h2>

            <div className="w-full my-2">
                <div className="relative w-full">
                    <input placeholder="Search" type="text" name="search" id="search" value={query} onChange={(e) => {
                        setQuery(e.target.value)
                        setSelected([])
                    }} className="w-full border-b border-gray-600 dark:border-gray-400 focus:border-gray-700 dark:focus:border-gray-300 transition-all bg-transparent border-0 focus:outline-none focus:ring-0 ring-0 outline-none peer/search" />
                    <MagnifyingGlassIcon className="absolute right-2 bottom-2 w-6 h-6 text-gray-900 dark:text-white peer-focus/search:opacity-80 transition-opacity opacity-50" />
                </div>
            </div>

            <div className="flex items-center justify-end my-2 px-2 lg:px-0 space-x-2 flex-wrap">
                {
                    checkPermission('users-create') && (
                        <button onClick={() => setModalState('createUserModal')} className="btn-light dark:btn-dark">Create User</button>
                    )
                }
                {
                    checkPermission('users-delete') && (
                        <Dropdown className="z-30">
                            <Dropdown.Button disabled={selected.length === 0} className="btn-light dark:btn-dark justify-between">
                                <span>With Selected</span>
                                <ChevronDownIcon className="w-5 h-5 ml-2" />
                            </Dropdown.Button>
                            <Dropdown.Content>
                                <Dropdown.Item className="space-x-2" onClick={() => deleteUser(selected)}>
                                    <TrashIcon className="w-5 h-5 opacity-50" />
                                    <span>Delete</span>
                                </Dropdown.Item>
                            </Dropdown.Content>
                        </Dropdown>
                    )
                }
                <Dropdown className="z-30">
                    <Dropdown.Button className="btn-light dark:btn-dark justify-between">
                        <span>Order By</span>
                        <ChevronDownIcon className="w-5 h-5 ml-2" />
                    </Dropdown.Button>
                    <Dropdown.Content>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('name', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 opacity-50" />
                                <span>Name</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('name', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 opacity-50" />
                                <span>Name</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('created_at', 'asc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Registered At</span>
                            </div>
                            <AscendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                        <Dropdown.Item className="space-x-2 justify-between" onClick={() => sortBy('created_at', 'desc')}>
                            <div className="flex items-center space-x-2">
                                <CalendarDaysIcon className="w-5 h-5 opacity-50" />
                                <span>Registered At</span>
                            </div>
                            <DescendingIcon iconClasses="w-3 h-3" />
                        </Dropdown.Item>
                    </Dropdown.Content>
                </Dropdown>
            </div>

            <div className="w-full lg:rounded-lg shadow bg-white dark:bg-gray-900 px-2 lg:px-4 py-2">
                <div className="w-full max-w-full overflow-x-auto gray-scrollbar lg:px-2 overflow-y-auto max-h-[80vh]">
                    <table className={`w-full whitespace-nowrap ${loading ? "border-separate" : ""}`}>
                        <thead>
                            <tr className="border-b-2 border-gray-300 dark:border-gray-800 [&_>_th]:p-2 [&_>_th]:whitespace-nowrap text-gray-500 [&_>_th]:font-medium [&_>_th]:text-xs [&_>_th]:tracking-wider [&_>_th]:uppercase [&_>_th]:text-start">
                                {
                                    checkPermission('users-delete') && (
                                        <th className="sticky z-30 -left-2 top-0 bg-white dark:bg-gray-900">
                                            <input ref={checkAllRef} type="checkbox" className="form-checkbox" name="selectall" id="selectAll" checked={allChecked} onChange={(e) => e.target.checked ? selectAll() : unselectAll()} />
                                        </th>
                                    )
                                }
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Avatar</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Name</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Email</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Phone</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Role</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">User Type</th>
                                <th className="sticky z-20 top-0 bg-white dark:bg-gray-900">Registered At</th>
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
                                                        {
                                                            checkPermission('users-delete') && (
                                                                <td></td>
                                                            )
                                                        }
                                                        <td colSpan={8} className="skeleton"></td>
                                                        <td></td>
                                                    </tr>
                                                ))
                                            }
                                        </>
                                    )
                                    : (
                                        <>
                                            {
                                                queriedUsers.length === 0
                                                    ? (
                                                        <>
                                                            <tr>
                                                                <td colSpan="9" className="text-center py-4">No users found</td>
                                                            </tr>
                                                        </>
                                                    )
                                                    : queriedUsers.map((user, i) => (
                                                        <tr key={i} className="border-gray-300 dark:border-gray-800 [&_>_td]:p-2 [&_>_td]:whitespace-nowrap">
                                                            {
                                                                checkPermission('users-delete') && (
                                                                    <td className="sticky -left-2 bg-white dark:bg-gray-900">
                                                                        <input type="checkbox" name="selected" checked={selected.includes(user.id)} className="form-checkbox" onChange={(e) => handleCheck(user.id, e.target.checked)} />
                                                                    </td>
                                                                )
                                                            }
                                                            
                                                            <td>
                                                                <Image src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                                                            </td>

                                                            <td>{user.name}</td>
                                                            <td>{user.email}</td>
                                                            <td>{user.country ? user.country.dial_code : ""}{user.phone ?? "-"}</td>
                                                            <td>
                                                                {user.roles.length > 0 ? user.roles[0].display_name : "-"}
                                                            </td>

                                                            <td className="capitalize">{user.user_type}</td>
                                                            <td>{moment(user.created_at).format("DD MMM YYYY HH:mm:ss")}</td>
                                                            
                                                            <td>
                                                                <div className="flex items-center justify-center space-x-2">
                                                                    {
                                                                        checkPermission('users-update') && (
                                                                            <button onClick={() => updateUser(user)} className="btn-light dark:btn-dark">Update</button>
                                                                        )
                                                                    }
                                                                    {
                                                                        checkPermission('users-delete') && (
                                                                            <button onClick={() => deleteUser([user.id])} className="btn-rose">Delete</button>
                                                                        )
                                                                    }
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

            {
                checkPermission('users-create') && (
                    <CreateUser refetch={getUsers} />
                )
            }

            {
                checkPermission('users-update') && user && (
                    <UpdateUser user={user} setUser={setUser} refetch={getUsers} />
                )
            }

            {
                checkPermission('users-delete') && toDelete.length > 0 && (
                    <Modal id="deleteUserModal" static size="md">
                        {
                            deleting && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-black/50 grid place-items-center z-[100]">
                                    <Loader className="w-10 h-10 text-rose-600" />
                                </div>
                            )
                        }
                        <Modal.Header>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Delete Users?</h4>
                        </Modal.Header>
                        <Modal.Body>
                            <div className="w-full flex items-center justify-center">
                                <span className="p-2 grid place-items-center bg-rose-100 dark:bg-rose-500/20 rounded-full">
                                    <ExclamationTriangleIcon className="w-8 h-8 text-rose-500" />
                                </span>
                            </div>
                            <p className="text-center text-gray-800 dark:text-gray-200">Delete the selected users?</p>
                            <p className="text-center text-gray-800 dark:text-gray-200">This action is irreversible. Are you sure want to Delete the selected users?</p>
                        </Modal.Body>
                        <Modal.Footer>
                            <button onClick={() => {
                                setToDelete([])
                                setModalState('')
                            }} className="btn-rose !w-full">Nevermind</button>
                            <button onClick={() => doDelete()} className="btn-light mt-3 border-0 dark:btn-dark !w-full">Delete Them</button>
                        </Modal.Footer>
                    </Modal>
                )
            }
        </>
    );
};

User.getLayout = page => <AppLayout title="Users" permissions={['users-read']}>{page}</AppLayout>

export default User;