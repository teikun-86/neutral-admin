import { __config } from "./config";

export const generateMetadata = (metadata = {
    title: "",
    description: "",
    image: "",
    url: "",
    openGraph: {
        type: "website",
        title: "",
        description: "",
        images: [],
    },
    twitter: {
        card: "summary_large_image",
        title: "",
        description: "",
        images: [],
    },
}) => {
    const generateMetaTags = (metaObj, prefix) => {
        const metaTags = Object.entries(metaObj).map(([key, value]) => {
            if (Array.isArray(value)) {
                return value.length > 0
                    ? value.map((v, i) => (
                        <meta
                            key={`${prefix}:${key}-${i}`}
                            name={`${prefix}:${key}`}
                            content={v}
                        />
                    ))
                    : null;
            } else {
                return value
                    ? <meta key={`${prefix}:${key}`} name={`${prefix}:${key}`} content={value} />
                    : null;
            }
        });
        return metaTags;
    };

    const ogMetaTags = generateMetaTags(metadata.openGraph, "og");
    const twitterMetaTags = generateMetaTags(metadata.twitter, "twitter");

    return (
        <>
            <meta name="title" content={metadata.title} />
            <meta name="description" content={metadata.description} />
            <meta name="url" content={metadata.url} />
            <meta name="image" content={metadata.image} />
            {ogMetaTags}
            {twitterMetaTags}
        </>
    );
};

export const url = (path = "/", query = {}) => {
    const queryStr = new URLSearchParams(query).toString();
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL.endsWith("/")
        ? process.env.NEXT_PUBLIC_APP_URL
        : `${process.env.NEXT_PUBLIC_APP_URL}/`;
    return `${baseUrl}${path}${queryStr ? `?${queryStr}` : ""}`;
};

export const config = (key = null, defaultValue = null) => {
    const keys = key === null ? [] : key.split(".");
    let value = __config;
    for (let i = 0; i < keys.length; i++) {
        if (value[keys[i]] === undefined) {
            return defaultValue;
        }
        value = value[keys[i]];
    }
    return value ?? defaultValue;
}

export const setTheme = (theme) => {
    if (theme === 'system') {
        localStorage.removeItem('theme')
    } else {
        localStorage.setItem('theme', theme)
    }
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
}

export const truncateString = (string, length = 12) =>
    string.length > length ? `${string.substring(0, length)}...` : string;

export const splitString = (string = "", firstDigits = 8, lastDigits = 4) => {
    if (string.length > 16) {
        let first = string.substring(0, firstDigits);
        let last = string.substring(string.length - lastDigits);
        return first + "..." + last;
    }
    return string;
}

export const formatIDR = (amount, decimalPlaces = 0) =>
    Intl.NumberFormat("id-ID", {
        style: 'currency',
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
    }).format(amount)

export const formatCurrency = (amount, decimalPlaces = 0, currency = 'IDR') =>
    Intl.NumberFormat("id-ID", {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: decimalPlaces,
    }).format(amount)

export const searchString = (needle, haystack) =>
    haystack
        .toLowerCase()
        .replace(/\s+/g, '')
        .includes(needle.toLowerCase().replace(/\s+/g, ''))

export const randomString = (len = 16) => {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < len; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const inArray = (needle, haystack) => {
    return haystack.indexOf(needle) > -1;
}

export const objectOnlyKeys = (obj, ...keys) => {
    console.log({keys});
    let newObj = {};
    keys.forEach(key => {
        if (obj[key] !== undefined) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}

export const objectExceptKeys = (obj, ...keys) => {
    console.log({keys});
    let newObj = {};
    Object.keys(obj).forEach(key => {
        if (!inArray(key, keys)) {
            newObj[key] = obj[key];
        }
    });
    return newObj;
}