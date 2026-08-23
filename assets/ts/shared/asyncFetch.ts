interface FetchFragmentProps {
    path: string;
    signal: AbortSignal;
    validate?: (response: Response) => boolean;
}

interface FetchSvgIconProps {
    iconEl?: HTMLElement;
    iconName: string;
    signal: AbortSignal;
}

export async function fetchFragment({path, signal, validate = (response) => response.ok}: FetchFragmentProps): Promise<string | null> {
    try {
        const base = import.meta.env.BASE_URL;
        const response = await fetch(`${base}${path}`, {signal});
        if (!validate(response)) return null;

        const text = await response.text();
        if (base === "/") return text;
        return text.replace(/(["'(])\/(demos|downloads|images|pdfs|svgs|views)\//g, `$1${base}$2/`);
    } catch (error) {
        if (error.name === 'AbortError') return null;
        throw error;
    }
}

export async function fetchSvgIcon({iconEl, iconName, signal}: FetchSvgIconProps) {
    if (!iconEl) return;
    await fetchFragment({
        path: `svgs/${iconName}.svg`,
        signal,
        validate: (response) => {
            const contentType = response.headers.get("content-type");
            return !!contentType && contentType.includes("svg");
        }
    })
    .then((svg) => {
        if (!svg) return;
        iconEl.innerHTML = svg;
    })
    .catch((error) => {
        if (error.name === 'AbortError') return;
        console.error("SVG load failed:", error);
    });
}

export async function fetchIndexSvgIcons() {
    const neverAbortSignal = () => new AbortController().signal;
    const linkedInIcon: HTMLElement | null = document.querySelector("#footerIcon");
    await fetchSvgIcon({iconEl: linkedInIcon, iconName: "linkedin", signal: neverAbortSignal()});
}
