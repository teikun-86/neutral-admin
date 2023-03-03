import { generateMetadata } from "@/util";
import Head from "next/head";


const Metadata = ({ title, description, image, url}) => {
    return (
        <Head>
            <title>{title}</title>
            {generateMetadata({
                title,
                description,
                image,
                url: url,
                openGraph: {
                    type: "website",
                    title,
                    description,
                    url,
                    images: [image],
                },
                twitter: {
                    card: "summary_large_image",
                    title,
                    description,
                    url,
                    images: [image],
                },
            })}
            <link rel="icon" href="/favicon.ico" />
        </Head>
    )
}

export default Metadata;