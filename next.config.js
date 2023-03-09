/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        domains: [
            "purecatamphetamine.github.io",
            "graph.facebook.com",
            "lh3.googleusercontent.com",
            "avatars.githubusercontent.com",
            "localhost",
            "neutral-be.io",
            "secure.gravatar.com",
            "travel-neutral.sintegra.cloud"
        ],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 1024, 2048],
        dangerouslyAllowSVG: true
    },
}

module.exports = nextConfig
