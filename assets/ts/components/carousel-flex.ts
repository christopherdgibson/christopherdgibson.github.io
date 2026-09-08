export function initCarouselFlex(loadSignal: AbortSignal) {
    const prev = document.querySelector(".btn-prev");
    const next = document.querySelector(".btn-next");
    const resume = document.querySelector(".btn-resume");
    const list = document.querySelector(".carousel-flex-list");
    let autoplay: number;
    let pauser;

    const getSlides: () => Element[] = () => [...document.querySelectorAll(".carousel-flex-item")];

    const getActiveIndex = (slides: Element[]) => slides.findIndex(el => el.hasAttribute('data-active'));

    const getSlideIndex = (slide: Element) => getSlides().indexOf( slide );

    const prevSlide = () => {
        const slides = getSlides();
        const index = getActiveIndex(slides);
        const last = slides[slides.length - 1];
        last.remove();
        list?.prepend(last);
        if (index !== undefined) activateSlide(getSlides()[index] as HTMLElement);
    };
    
    const nextSlide = () => {
        const slides = getSlides();
        const index = getActiveIndex(slides);
        const first = slides[0];
        first.remove();
        list?.append(first);
        if (index !== undefined) activateSlide(getSlides()[index] as HTMLElement);
    }

    const chooseSlide = (e: any) => {
        const max = (window.matchMedia("screen and ( max-width: 600px)").matches) ? 5 : 8;
        const slide = e.target.closest( ".carousel-flex-item" );
        const index = getSlideIndex( slide );
        if ( index < 3 || index > max ) return;
        if ( index === max ) nextSlide();
        if ( index === 3 ) prevSlide();
        activateSlide(slide);
    }

    const activateSlide = (slide: HTMLElement) => {
        if (!slide) return;
        const slides = getSlides();
        slides.forEach(el => el.removeAttribute('data-active'));
        slide.setAttribute( 'data-active', 'true' );
    }

    const autoSlide = () => {
        nextSlide();
    }

    const pauseAuto = () => {
        clearInterval( autoplay );
        clearTimeout( pauser );
        resume?.classList.toggle('pause-carousel', true);
    }

    const handleNextClick = (e: any) => {
        pauseAuto();
        nextSlide();
    }

    const handlePrevClick = (e: any) => {
        pauseAuto();
        prevSlide();
    }

    const handleSlideClick = (e: any) => {
        pauseAuto();
        chooseSlide(e);
    }

    const handleSlideKey = (e: any) => {
        switch(e.keyCode) {
            case 37:
            case 65:
                handlePrevClick(e);
                break;
            case 39:
            case 68:
                handleNextClick(e);
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
    list?.addEventListener( "keyup", handleSlideKey );

    loadSignal.addEventListener('abort', pauseAuto, {once: true});
}