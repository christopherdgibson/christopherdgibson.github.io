export function initCarouselFlex(loadSignal: AbortSignal) {
    const carousel: HTMLElement | null = document.querySelector(".carousel-flex");
    const list: HTMLElement | null = document.querySelector(".carousel-flex-list");
    const prevBtn: HTMLElement | null = document.querySelector(".btn-prev");
    const nextBtn: HTMLElement | null = document.querySelector(".btn-next");
    const resumeBtn: HTMLElement | null = document.querySelector(".btn-resume");
    const carouselBtns: (HTMLElement | null)[] = [resumeBtn, prevBtn, nextBtn];

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
        resumeBtn?.classList.toggle('pause-carousel', true);
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

    const handleSlideKey = (e: any) => {
        switch(e.key) {
            case 'a':
            case 'ArrowLeft':
                handlePrevClick();
                break;
            case 'd':
            case 'ArrowRight':
                handleNextClick();
                break;
            case 's':
                togglePause();
                break;
            case 'Enter':
                const active = document.activeElement;
                if (!(active instanceof HTMLElement) || !carouselBtns.includes(active)) {
                    togglePause();
                }
                break;
            case "Escape":
                e.preventDefault();
                e.target.blur();
                if (!carousel) return;

                carousel.classList.add('focus-no-outline'); // remove focus-visible outline
                carousel.focus();
                carousel.addEventListener('blur', () => {
                    carousel.classList.remove('focus-no-outline');
                }, { once: true });
        }
    }

    const startAuto = () => {
        resumeBtn?.classList.toggle('pause-carousel', false);
        autoplay = setInterval( autoSlide, 3000 );
    }

    const togglePause = () => {
        if (!resumeBtn) return;
        if (resumeBtn.classList.contains('pause-carousel')) {
            nextSlide();
            startAuto();
        } else {
            pauseAuto();
        }
    }

    startAuto();

    carouselBtns.forEach(btn => {
        btn?.addEventListener("click", (e) => {
            if (e.detail !== 0) { // keep focus for e.detail === 0 (keyboard events)
                carousel?.focus();
            }
        });
    })

    resumeBtn?.addEventListener( "click", togglePause);
    prevBtn?.addEventListener( "click", handlePrevClick );
    nextBtn?.addEventListener( "click", handleNextClick );
    list?.addEventListener( "click", handleSlideClick );
    // list?.addEventListener( "focusin", handleSlideClick );
    carousel?.addEventListener( "keydown", handleSlideKey );

    loadSignal.addEventListener('abort', pauseAuto, {once: true});
}