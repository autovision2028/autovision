/**
 * Site JavaScript - Core functionality for AutoVision Initiative
 * Handles mobile menu toggle and smooth scrolling
 */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  console.log('AutoVision site loaded');

  // Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
      
      // Update button icon
      const svg = mobileMenuBtn.querySelector('svg path');
      if (svg) {
        if (mobileMenu.classList.contains('hidden')) {
          // Show hamburger icon
          svg.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        } else {
          // Show close icon
          svg.setAttribute('d', 'M6 18L18 6M6 6l12 12');
        }
      }
    });

    // Close mobile menu when clicking on a link
    const mobileMenuLinks = mobileMenu.querySelectorAll('a');
    mobileMenuLinks.forEach(link => {
      link.addEventListener('click', function() {
        mobileMenu.classList.add('hidden');
        const svg = mobileMenuBtn.querySelector('svg path');
        if (svg) {
          svg.setAttribute('d', 'M4 6h16M4 12h16M4 18h16');
        }
      });
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href !== '#' && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 80; // Account for sticky header
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    });
  });

  // Add scroll effect to header
  const header = document.querySelector('header');
  if (header) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        header.classList.add('shadow-md');
      } else {
        header.classList.remove('shadow-md');
      }
    });
  }

  // FAQ Accordion functionality
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  faqQuestions.forEach(question => {
    question.addEventListener('click', function() {
      const answer = this.nextElementSibling;
      const icon = this.querySelector('.faq-icon');
      
      // Toggle the answer visibility
      if (answer.classList.contains('hidden')) {
        // Close all other answers first
        document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
          otherAnswer.classList.add('hidden');
        });
        
        // Reset all icons
        document.querySelectorAll('.faq-icon').forEach(otherIcon => {
          otherIcon.classList.remove('rotate-180');
        });
        
        // Open this answer
        answer.classList.remove('hidden');
        icon.classList.add('rotate-180');
      } else {
        // Close this answer
        answer.classList.add('hidden');
        icon.classList.remove('rotate-180');
      }
    });
  });

  // -------------------------------
  // Desktop Drag-to-Scroll Sliders
  // -------------------------------
  function enableDragScroll(container) {
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    const onMouseDown = (e) => {
      isDown = true;
      container.classList.add('cursor-grabbing');
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    const onMouseLeave = () => { isDown = false; container.classList.remove('cursor-grabbing'); };
    const onMouseUp = () => { isDown = false; container.classList.remove('cursor-grabbing'); };
    const onMouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1; // scroll-fast factor
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener('mousedown', onMouseDown);
    container.addEventListener('mouseleave', onMouseLeave);
    container.addEventListener('mouseup', onMouseUp);
    container.addEventListener('mousemove', onMouseMove);
  }

  // Only enable drag on non-touch (desktop) devices
  const isTouch = matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    const servicesSlider = document.querySelector('#services .overflow-x-auto');
    const eligibilitySlider = document.querySelector('#eligibility .overflow-x-auto');
    enableDragScroll(servicesSlider);
    enableDragScroll(eligibilitySlider);
  }

  // -------------------------------
  // Active Nav State (IntersectionObserver)
  // -------------------------------
  const sectionIds = ['services', 'gallery', 'eligibility', 'faq'];
  const sections = sectionIds
    .map(id => document.getElementById(id))
    .filter(Boolean);
  const navLinks = Array.from(document.querySelectorAll('header nav a'));

  if (sections.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const id = entry.target.getAttribute('id');
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            if (href.endsWith(`#${id}`)) {
              link.classList.add('text-cyan-bright');
            } else if (sectionIds.some(sid => href.endsWith(`#${sid}`))) {
              link.classList.remove('text-cyan-bright');
            }
          });
        }
      });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.1 });

    sections.forEach(sec => observer.observe(sec));
  }

  // -------------------------------
  // Back-to-Top Button
  // -------------------------------
  const backBtn = document.getElementById('backToTop');
  if (backBtn) {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const toggleBtn = () => {
      if (window.scrollY > 600) {
        backBtn.classList.remove('opacity-0', 'pointer-events-none');
      } else {
        backBtn.classList.add('opacity-0', 'pointer-events-none');
      }
    };
    window.addEventListener('scroll', toggleBtn, { passive: true });
    toggleBtn();

    backBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  }

  // -------------------------------
  // AOS (Animate On Scroll) Init
  // -------------------------------
  try {
    if (window.AOS) {
      const disableReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        offset: 60,
        once: false,
        mirror: true,
        disable: disableReducedMotion
      });
    }
  } catch (e) {
    console.warn('AOS init skipped:', e);
  }
});