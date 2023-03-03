import { config } from "@/util"
import Axios from "axios"

export const axios = Axios.create({
    baseURL: config('app.backendUrl'),
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        "X-Trp-App": "1",
    },
    withCredentials: true
})