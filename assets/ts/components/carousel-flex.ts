export function initCarouselFlex(loadSignal: AbortSignal) {
    const carousel: HTMLElement | null = document.querySelector(".carousel-flex");
    const list: HTMLElement | null = document.querySelector(".carousel-flex-list");
    const prev: HTMLElement | null = document.querySelector(".btn-prev");
    const next: HTMLElement | null = document.querySelector(".btn-next");
    const resume: HTMLElement | null = document.querySelector(".btn-resume");

    let autoplay: number;

    let slides = [...document.querySelectorAll<HTMLElement>(".carousel-flex-item")];

    const getSlideIndex = (slide: HTMLElement) => slides.indexOf(slide);

    const getActiveIndex = () => {
        const i = slides.findIndex(el => el.hasAttribute('data-active'));
        return i === -1 ? undefined : i;
    };

    const prevSlide = () => {
        const index = getActiveIndex();
        const last = slides.pop()!;
        list?.prepend(last);
        slides.unshift(last);
        if (index !== undefined) activateSlide(slides[index]);
    };

    const nextSlide = () => {
        const index = getActiveIndex();
        const first = slides.shift()!;
        list?.append(first);
        slides.push(first);
        if (index !== undefined) activateSlide(slides[index]);
    };

    const chooseSlide = (slide: HTMLElement) => {
        const max = (window.matchMedia("screen and ( max-width: 600px)").matches) ? 5 : 8;
        const index = getSlideIndex( slide );
        if ( index < 3 || index > max ) return;
        if ( index === max ) nextSlide();
        if ( index === 3 ) prevSlide();
        activateSlide(slide);
    }

    const activateSlide = (slide: HTMLElement) => {
        if (!slide) return;
        slides.forEach(el => el.removeAttribute('data-active'));
        slide.setAttribute('data-active', 'true');
    };

    const autoSlide = () => {
        nextSlide();
    }

    const pauseAuto = () => {
        clearInterval( autoplay );
        resume?.classList.toggle('pause-carousel', true);
    }

    const handleNextClick = () => {
        pauseAuto();
        nextSlide();
    }

    const handlePrevClick = () => {
        pauseAuto();
        prevSlide();
    }

    const handleSlideClick = (e: any) => {
        pauseAuto();
        const slide = e.target.closest( ".carousel-flex-item" );
        chooseSlide(slide);
    }

    const isButtonTarget = (target: EventTarget | null) => target instanceof Element && target.closest("button") !== null;

    const handleSlideKey = (e: any) => {
        switch(e.key) {
            case 'a':
            case 'ArrowLeft':
                if (!isButtonTarget(e.target)) handlePrevClick();
                break;
            case 'd':
            case 'ArrowRight':
                if (!isButtonTarget(e.target)) handleNextClick();
                break;
            case 'Enter':
                if (!isButtonTarget(e.target)) {
                    e.preventDefault();
                    e.stopPropagation();
                    togglePause();
                }
                break;
        }
    }

    const startAuto = () => {
        resume?.classList.toggle('pause-carousel', false);
        autoplay = setInterval( autoSlide, 3000 );
    }

    const togglePause = () => {
        if (!resume) return;
        if (resume.classList.contains('pause-carousel')) {
            nextSlide();
            startAuto();
        } else {
            pauseAuto();
        }
    }

    startAuto();

    resume?.addEventListener( "click", togglePause );
    prev?.addEventListener( "click", handlePrevClick );
    next?.addEventListener( "click", handleNextClick );
    list?.addEventListener( "click", handleSlideClick );
    // list?.addEventListener( "focusin", handleSlideClick );
    carousel?.addEventListener( "keyup", handleSlideKey );

    loadSignal.addEventListener('abort', pauseAuto, {once: true});
}