import { config } from "@/util"
import Image from "@/components/image"
import logo from "@/assets/images/tripla-logo.png"

const AppLogo = ({ className = "", ...rest }) => {
    return (
        <Image alt={config('app.name')} src={logo} width={512} className={`${className}`} />
    )
}

export default AppLogo