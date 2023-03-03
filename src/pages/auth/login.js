import GuestLayout from "@/layouts/guest"
import * as Auth from "@/components/auth"
import { useForm } from "@/hooks/form"
import { useAuth } from "@/hooks/auth"
import { useState } from "react"
import { Input, InputError, Switch } from "@/components/form"
import { LockClosedIcon } from "@heroicons/react/24/solid"
import Loader from "@/components/loader"
import { config } from "@/util"
import { FacebookIcon } from "@/components/icons/facebook"
import { GoogleIcon } from "@/components/icons/google"

const Login = () => {
    const { data, handleChange } = useForm({
        login: '',
        password: '',
        remember: false,
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errors, setErrors] = useState([])
    const [status, setStatus] = useState(null)
    const [loading, setLoading] = useState(false)

    const { login, user } = useAuth({
        middleware: 'guest',
        redirectIfAuthenticated: "/dashboard",
    })
    
    const handleSubmit = async e  => {
        e.preventDefault()
        console.log(data)
        login({
            setErrors,
            setStatus,
            setLoading,
            ...data
        })
    }
    
    const loginWith = (provider) => {
        window.location.href = `${config('app.backendUrl')}/auth/social/${provider}?__sso_admin=1`
    }
    
    return (
        <GuestLayout title="Login">
            <Auth.Card>
                {
                    loading && (
                        <div className="absolute inset-0 w-full h-full grid place-items-center z-50 bg-white/50 dark:bg-black/50">
                            <Loader className="animate-spin w-8 h-8 text-rose-600" />
                        </div>
                    )
                }
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <Input required type="text" label="Email/Phone" id="login" name="login" autoCapitalize="none" onChange={(e) => handleChange('login', e.target.value)} />
                        <InputError messages={errors.login} />
                    </div>
                    <div className="mb-3">
                        <Input required type={showPassword ? "text" : "password"} label="Password" id="password" name="password" enableShowPassword onChange={(e) => handleChange('password', e.target.value)} />
                        <InputError messages={errors.password} />
                    </div>
                    <div className="w-full flex items-center justify-between space-x-2 py-2">
                        <Switch id="remember" value={true} label="Remember me" checked={data.remember} onChange={(e) => handleChange('remember', e.target.checked)} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="bg-white text-gray-600 text-xs font-medium dark:text-gray-300 dark:bg-gray-900 p-2 rounded hocus:bg-gray-100 dark:hocus:bg-gray-800 transition-all">
                            {showPassword ? "Hide" : "Show"} Password
                        </button>
                    </div>
                    <button disabled={loading} type="submit" className="w-full px-3 py-2 rounded-lg bg-rose-600 text-xs font-semibold uppercase text-white hocus:bg-rose-500 transition-all relative group disabled:opacity-60 disabled:cursor-not-allowed">
                        <LockClosedIcon className="absolute right-2 top-2 text-gray-300 w-4 h-4 opacity-70 group-hover:opacity-100 group-focus:opacity-100 transition-all" />
                        Log in
                    </button>

                    <div className="flex items-center justify-center my-2">
                        <hr className="w-10 border-t border-gray-300" />
                        <span className="text-center w-auto text-xs text-gray-600 dark:text-gray-400 font-medium mx-2">Or Sign in with</span>
                        <hr className="w-10 border-t border-gray-300" />
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                        <button type="button" onClick={() => loginWith("facebook")} className="btn-light dark:btn-dark">
                            <FacebookIcon className="w-6 h-6 mr-2" />
                            Facebook
                        </button>
                        <button type="button" onClick={() => loginWith('google')} className="btn-light dark:btn-dark">
                            <GoogleIcon className="w-6 h-6 mr-2" />
                            Google
                        </button>
                    </div>
                </form>
            </Auth.Card>
        </GuestLayout>
    )
}

export default Login