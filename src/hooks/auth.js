import useSWR from 'swr'
import { axios } from '@/libs/axios'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'

export const useAuth = ({ middleware, redirectIfAuthenticated, ...options } = {}) => {
    const router = useRouter()
    const [authenticating, setAuthenticating] = useState(true)

    const { data: user, error, mutate } = useSWR('/user', () => {
        setAuthenticating(true)

        return axios
            .get('/user')
            .then(res => {
                setAuthenticating(false)
                return res.data
            })
            .catch(error => {
                setAuthenticating(false)
                if (error.response.status !== 409) throw error

                router.push('/auth/verify-email')
            })
    })

    const csrf = () => axios.get('/sanctum/csrf-cookie')

    const register = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, ...props }) => {
        setLoading(true)
        setErrors([])

        await csrf()

        let data = {
            ...props,
            lang: router.locale,
        }

        axios
            .post('/auth/register', data)
            .then((res) => {
                setLoading(false)
                mutate()
                router.push(`/auth/verify-email`)
            })
            .catch(error => {
                setLoading(false)

                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const login = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, ...props }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)
        let tload = toast.loading('Logging in...')

        await csrf()

        let data = {
            ...props,
            lang: router.locale,
        }

        axios
            .post('/auth/login', data)
            .then(() => {
                setLoading(false)
                toast.dismiss(tload)
                toast.success("Logged in")
                return mutate()
            })
            .catch(error => {
                setLoading(false)
                toast.dismiss(tload)
                toast.error("Failed to login")
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const updateProfile = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, after = () => { }, ...props }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        await csrf()

        const data = {
            ...props,
            lang: router.locale,
        }

        axios
            .post('/profile/update', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })
            .then(() => {
                setLoading(false)
                setStatus('success')
                mutate()
                after()
            })
            .catch(error => {
                setLoading(false)
                if (error.response.status !== 422) throw error

                // get all errors
                const errors = Object.values(error.response.data.errors).flat()

                setErrors(errors)
            })
    }

    const updateCredentials = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, after = () => { }, ...props }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        await csrf()

        const data = {
            ...props,
            lang: router.locale,
        }

        axios
            .post('/profile/update-credentials', data)
            .then(() => {
                setLoading(false)
                setStatus('success')
                mutate()
                after()
            })
            .catch(error => {
                setLoading(false)
                if (error.response.status !== 422) throw error

                setErrors(error.response.data.errors)
            })
    }

    const forgotPassword = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, email }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        await csrf()


        axios
            .post('/auth/forgot-password', { email })
            .then(response => {
                setStatus(response.data.status)
                setLoading(false)
            })
            .catch(error => {
                setLoading(false)

                if (error.response.status !== 422) throw error

                setErrors(Object.values(error.response.data.errors).flat())
            })
    }

    const resetPassword = async ({ setErrors = () => { }, setStatus = () => { }, setLoading = () => { }, ...props }) => {
        setLoading(true)
        setErrors([])
        setStatus(null)

        await csrf()

        const data = {
            ...props,
            lang: router.locale,
            token: router.query.token,
        }

        axios
            .post('/auth/reset-password', data)
            .then(response => {
                setLoading(false)
                router.push('/auth/login?reset=' + btoa(response.data.status))
            })
            .catch(error => {
                setLoading(false)

                if (error.response.status !== 422) throw error
                setErrors(error.response.data.errors)
            })
    }

    const resendEmailVerification = ({ setStatus, setLoading }) => {
        setLoading(true)
        axios
            .post('/auth/email/verification-notification')
            .then(response => {
                setStatus(response.data.status)
                setLoading(false)
            })
    }

    const logout = async () => {
        if (!error) {
            let t = toast.loading('Logging out...')
            
            await axios.post('/auth/logout').then(() => {
                toast.dismiss(t)
                toast.success('Logged out.')
                mutate()
            }).catch(err => {
                toast.dismiss(t)
                toast.error('Failed to log out. Try again later')
            })
        }

        window.location.pathname = `/auth/login`
    }

    const socialLogin = async (provider, user_id) => {
        await csrf()
        return await axios
            .post(`/auth/social/${provider}/login`, { provider, user_id })
            .then(() => mutate())
            .catch(error => {
                if (error.response.status !== 422) throw error
            })
    }

    const checkRole = useCallback((requiredRoles) => {
        if (!user) return false
        let userRoles = user.roles.map(role => role.name)
        let hasRole = false
        requiredRoles.forEach(role => {
            if (userRoles.includes(role)) hasRole = true
        })
        return hasRole
    }, [user])

    const checkPermission = (requiredPermissions) => {
        if (!user) return false
        if (! Array.isArray(requiredPermissions)) requiredPermissions = [requiredPermissions]
        let permissions = user.roles.map(role => role.permissions.map(permission => permission.name)).flat()
        let hasPermission = false
        requiredPermissions.forEach(permission => {
            if (permissions.includes(permission)) hasPermission = true
        })
        return hasPermission
    }


    useEffect(() => {
        // if (user && user.email_verified_at === null) {
        // router.push('/auth/verify-email')
        // return
        // }

        if (middleware === 'guest' && redirectIfAuthenticated && user)
            router.push(redirectIfAuthenticated)

        if (
            router.pathname === '/auth/verify-email' &&
            user?.email_verified_at
        )
            router.push(redirectIfAuthenticated)


        if (middleware === 'auth' && error) logout()

        if (!authenticating) {
            if (options && options.hasCompany) {
                if (!user?.company) {
                    router.push('/', undefined, { shallow: true }).then(() => {
                        toast.warning(__('info.no_company'))
                    })
                }
            }

            if (options && options.userType) {
                if (!user?.user_type || !options.userType.includes(user.user_type)) {
                    window.location.replace("/403")
                    return;
                }
            }

            if (options && options.permissions && !checkPermission(options.permissions)) {
                window.location.replace("/403")
                return;
            }

            if (options && options.roles && !checkRole(options.roles)) {
                window.location.replace("/403")
                return;
            }
        }


    }, [user, error, authenticating])

    return {
        user,
        register,
        login,
        forgotPassword,
        resetPassword,
        resendEmailVerification,
        logout,
        socialLogin,
        updateProfile,
        updateCredentials,
        authenticating,
        checkRole,
        checkPermission,
    }
}