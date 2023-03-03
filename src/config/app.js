export const app = {
    name: process.env.NEXT_PUBLIC_APP_NAME,
    url: process.env.NEXT_PUBLIC_APP_URL,
    backendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
    publicUrl: process.env.NEXT_PUBLIC_PUBLIC_URL,
    images: {
        availableSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024, 2048]
    }
}