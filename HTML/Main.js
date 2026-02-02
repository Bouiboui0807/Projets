document.addEventListener('DOMContentLoaded', () => {
    // --- Slider ---
    const track = document.querySelector('.slider-track');
    const leftArrow = document.querySelector('.arrow-left');
    const rightArrow = document.querySelector('.arrow-right');
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.slide');
    const sliderBox = document.querySelector('.slider-box');
    const pasteBtn = document.getElementById('pasteBtn');
    const textInput = document.getElementById('textInput');
    const delBtn = document.getElementById('delBtn');
    const darkModeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const genBtn = document.querySelector('.gen');
    
    pasteBtn.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            textInput.value = text;
        } catch (err) {
            alert("Impossible d'accéder au presse-papier 😕");
        }
    });

    delBtn.addEventListener('click', async () => { textInput.value = ""; });

    function applyDarkMode(e) {
        if (e.matches) {
            document.body.classList.add('dark');
        } else {
            document.body.classList.remove('dark');
        }
    } 
    applyDarkMode(darkModeMedia);
    darkModeMedia.addEventListener('change', applyDarkMode);

    genBtn.addEventListener('click', (e) => {
        const rect = genBtn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        genBtn.style.setProperty('--x', `${x}px`);
        genBtn.style.setProperty('--y', `${y}px`);
        genBtn.classList.remove('pulse');
        void genBtn.offsetWidth;
        genBtn.classList.add('pulse');
    });

    let current = 0;

    function updateUI() {
        // Déplacer le slider
        track.style.transform = `translateX(-${current * 50}%)`;

        // Mettre à jour les dots
        dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

        // Activer/désactiver flèches
        leftArrow.classList.toggle('enabled', current > 0);
        rightArrow.classList.toggle('enabled', current < slides.length - 1);

        // Classes actives sur les slides (utile si tu as des styles)
        slides.forEach((slide, i) => slide.classList.toggle('active', i === current));
    }

    // Flèches
    rightArrow.addEventListener('click', () => {
        if (current < slides.length - 1) {
            current++;
            updateUI();
        }
    });
    leftArrow.addEventListener('click', () => {
        if (current > 0) {
            current--;
            updateUI();
        }
    });

    // Initialisation
    updateUI();

    // --- Info-icon pour scroll + slide ---
    const infoRecup = document.querySelector('.info-icon.recupset');
    const infoStyle = document.querySelector('.info-icon.styleset');

    function goToSlide(slideIndex) {
        // Scroll vers le slider de manière fluide
        sliderBox.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Mettre à jour le slider
        current = slideIndex;
        updateUI();
    }

    infoRecup.addEventListener('click', () => goToSlide(0));
    infoStyle.addEventListener('click', () => goToSlide(1));

    // --- Header shrink (optionnel, si tu veux conserver ton header animé) ---
    const header = document.querySelector('.headermain');
    const title = document.querySelector('.maintitle');
    const button = document.querySelector('.infosup');

    const MAX_SCROLL = 80;
    const HEADER_MAX = 50;
    const HEADER_MIN = 30;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = Math.min(window.scrollY, MAX_SCROLL);
                const progress = scrollY / MAX_SCROLL;

                header.style.height = `${HEADER_MAX - (HEADER_MAX - HEADER_MIN) * progress}px`;
                title.style.transform = `scale(${1 - progress * 0.25})`;
                button.style.transform = `scale(${1 - progress * 0.15})`;

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });
});
