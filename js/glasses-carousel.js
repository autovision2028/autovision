// Smart Glasses Carousel - Continuous one-by-one rotation
(function() {
  'use strict';

  const glassesData = [
    { img: 'img/01495039-6afb-47d4-8d62-492468539057.jpg', alt: 'Smart Glasses Model 1' },
    { img: 'img/IMG_1031.jpg', alt: 'Smart Glasses Model 2' },
    { img: 'img/IMG_8269.jpg', alt: 'Smart Glasses Model 3' },
    { img: 'img/smart 8.jpg', alt: 'Smart Glasses Model 4' },
    { img: 'img/smart 9.jpg', alt: 'Smart Glasses Model 5' },
    { img: 'img/new1.jpg', alt: 'Smart Glasses Model 6' },
    { img: 'img/img7.jpg', alt: 'Smart Glasses Model 7' },
    { img: 'img/img5.jpg', alt: 'Smart Glasses Model 8' },
    { img: 'img/gallery1.jpg', alt: 'Smart Glasses Model 9' },
    { img: 'img/img2.jpg', alt: 'Smart Glasses Model 10' },
    { img: 'img/gallery2.jpg', alt: 'Smart Glasses Model 11' },
    { img: 'img/img1.jpg', alt: 'Smart Glasses Model 12' }
  ];

  let currentIndex = 0;
  let autoplayInterval = null;
  let isTransitioning = false;

  const track = document.querySelector('.glasses-carousel-track');
  const dotsContainer = document.getElementById('glasses-dots');
  const prevBtn = document.getElementById('glasses-prev');
  const nextBtn = document.getElementById('glasses-next');

  if (!track || !dotsContainer || !prevBtn || !nextBtn) return;

  // Determine visible cards based on screen size
  function getVisibleCount() {
    return window.innerWidth >= 1024 ? 3 : 2;
  }

  // Create card HTML
  function createCard(data, index) {
    return `
      <div class="glasses-card flex-shrink-0 px-2 sm:px-3">
        <div class="relative rounded-2xl overflow-hidden shadow-lg group transition-all duration-300 hover:scale-105 hover:shadow-2xl">
          <img src="${data.img}" alt="${data.alt}" class="w-full h-48 sm:h-56 lg:h-64 object-cover" loading="lazy" decoding="async" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div class="absolute bottom-4 left-4 right-4">
              <a href="join.html" class="block w-full px-4 py-2 bg-[#00CFFF] text-[#00132B] rounded-full text-sm font-semibold text-center hover:bg-[#21DAFF] transition-colors shadow-lg">
                Apply Now
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Initialize carousel
  function initCarousel() {
    const visibleCount = getVisibleCount();
    
    // Clone items for infinite loop
    const extendedData = [...glassesData, ...glassesData, ...glassesData];
    
    track.innerHTML = extendedData.map((item, idx) => createCard(item, idx % visibleCount)).join('');
    
    // Set initial position to middle set
    currentIndex = glassesData.length;
    updateCarousel(false);
    
    // Create dots
    dotsContainer.innerHTML = glassesData.map((_, idx) => 
      `<button class="glasses-dot w-2 h-2 rounded-full transition-all ${idx === 0 ? 'bg-cyan-bright w-6' : 'bg-white/40'}" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>`
    ).join('');
    
    attachDotListeners();
  }

  // Update carousel position
  function updateCarousel(animate = true) {
    const visibleCount = getVisibleCount();
    const cardWidth = track.querySelector('.glasses-card')?.offsetWidth || 0;
    const offset = -currentIndex * cardWidth;
    
    if (!animate) {
      track.style.transition = 'none';
    } else {
      track.style.transition = 'transform 1s ease-in-out';
    }
    
    track.style.transform = `translateX(${offset}px)`;
    
    // Update dots
    const actualIndex = currentIndex % glassesData.length;
    document.querySelectorAll('.glasses-dot').forEach((dot, idx) => {
      if (idx === actualIndex) {
        dot.classList.add('bg-cyan-bright', 'w-6');
        dot.classList.remove('bg-white/40');
      } else {
        dot.classList.remove('bg-cyan-bright', 'w-6');
        dot.classList.add('bg-white/40');
      }
    });
  }

  // Handle infinite loop reset
  function handleLoopReset() {
    if (currentIndex >= glassesData.length * 2) {
      setTimeout(() => {
        currentIndex = glassesData.length;
        updateCarousel(false);
      }, 1000);
    } else if (currentIndex < glassesData.length) {
      setTimeout(() => {
        currentIndex = glassesData.length * 2 - 1;
        updateCarousel(false);
      }, 1000);
    }
  }

  // Navigate to next slide
  function nextSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;
    updateCarousel(true);
    handleLoopReset();
    setTimeout(() => { isTransitioning = false; }, 1000);
  }

  // Navigate to previous slide
  function prevSlide() {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex--;
    updateCarousel(true);
    handleLoopReset();
    setTimeout(() => { isTransitioning = false; }, 1000);
  }

  // Attach dot listeners
  function attachDotListeners() {
    document.querySelectorAll('.glasses-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        if (isTransitioning) return;
        const targetIndex = parseInt(dot.dataset.index);
        currentIndex = glassesData.length + targetIndex;
        updateCarousel(true);
        resetAutoplay();
      });
    });
  }

  // Autoplay
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 3500);
  }

  function stopAutoplay() {
    if (autoplayInterval) {
      clearInterval(autoplayInterval);
      autoplayInterval = null;
    }
  }

  function resetAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  // Event listeners
  nextBtn.addEventListener('click', () => {
    nextSlide();
    resetAutoplay();
  });

  prevBtn.addEventListener('click', () => {
    prevSlide();
    resetAutoplay();
  });

  // Pause on hover
  track.addEventListener('mouseenter', stopAutoplay);
  track.addEventListener('mouseleave', startAutoplay);

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      initCarousel();
      startAutoplay();
    }, 250);
  });

  // Initialize
  initCarousel();
  startAutoplay();

  // Reduced motion support
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    stopAutoplay();
  }
})();
