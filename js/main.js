// ===============================================
// GITHUB-STYLE SCROLL ANIMATIONS
// Premium IntersectionObserver implementation
// ===============================================

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        rootMargin: '0px 0px -10% 0px', // Trigger slightly before entering viewport
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], // Multiple thresholds for smooth transitions
        exitThreshold: 0.2 // When to consider section exited
    };

    // Get all scroll sections
    const scrollSections = document.querySelectorAll('[data-scroll]');

    if (!scrollSections.length) return; // Exit if no sections to animate

    // Track active section
    let activeSections = new Set();

    /**
     * Handle section intersection
     */
    function handleIntersection(entries) {
        entries.forEach(entry => {
            const section = entry.target;
            const content = section.querySelector('.scroll-content');

            if (!content) return;

            // Calculate visibility ratio
            const ratio = entry.intersectionRatio;
            const isIntersecting = entry.isIntersecting;

            // Section is entering viewport
            if (isIntersecting && ratio > 0.1) {
                content.classList.add('is-visible');
                section.classList.remove('is-exiting');

                // Mark as active if significantly visible
                if (ratio > 0.25) {
                    section.classList.add('is-active');
                    activeSections.add(section);

                    // Remove active class from other sections
                    scrollSections.forEach(otherSection => {
                        if (otherSection !== section && !isInViewportCenter(otherSection)) {
                            otherSection.classList.remove('is-active');
                            activeSections.delete(otherSection);
                        }
                    });
                }
            }

            // Section is exiting viewport
            if (!isIntersecting || ratio < CONFIG.exitThreshold) {
                section.classList.remove('is-active');
                activeSections.delete(section);

                // Add exiting class if scrolled past
                if (entry.boundingClientRect.top < 0) {
                    section.classList.add('is-exiting');
                }
            }

            // Section fully exited upwards
            if (!isIntersecting && entry.boundingClientRect.top < 0) {
                section.classList.add('is-exiting');
            }

            // Section re-entering from above
            if (isIntersecting && entry.boundingClientRect.top < window.innerHeight) {
                section.classList.remove('is-exiting');
            }
        });

        // Ensure at least one section is active
        updateActiveSection();
    }

    /**
     * Check if element is in center of viewport
     */
    function isInViewportCenter(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;

        return Math.abs(elementCenter - viewportCenter) < viewportHeight / 3;
    }

    /**
     * Update active section based on scroll position
     */
    function updateActiveSection() {
        if (activeSections.size === 0) {
            // Find section closest to viewport center
            let closestSection = null;
            let minDistance = Infinity;

            scrollSections.forEach(section => {
                const rect = section.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const viewportCenter = window.innerHeight / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);

                if (distance < minDistance && rect.top < window.innerHeight) {
                    minDistance = distance;
                    closestSection = section;
                }
            });

            if (closestSection) {
                closestSection.classList.add('is-active');
                activeSections.add(closestSection);
            }
        }

        // Update Nav Links
        document.querySelectorAll('.nav__link').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (!href || !href.startsWith('#')) return;

            const sectionId = href.substring(1);
            const activeSection = Array.from(activeSections).find(s => s.id === sectionId);

            if (activeSection) {
                link.classList.add('active');
            }
        });
    }


    /**
     * Initialize Intersection Observer
     */
    const observer = new IntersectionObserver(handleIntersection, {
        root: null,
        rootMargin: CONFIG.rootMargin,
        threshold: CONFIG.threshold
    });

    // Observe all scroll sections
    scrollSections.forEach(section => {
        observer.observe(section);
    });

    /**
     * Initial check for sections already in view
     */
    function initializeVisibleSections() {
        scrollSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const content = section.querySelector('.scroll-content');

            if (!content) return;

            // If section is already in viewport on page load
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                content.classList.add('is-visible');

                if (isInViewportCenter(section)) {
                    section.classList.add('is-active');
                    activeSections.add(section);
                }
            }
        });
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeVisibleSections);
    } else {
        initializeVisibleSections();
    }

    /**
     * Debounced scroll handler for fine-tuning
     */
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(updateActiveSection, 100);
    }, { passive: true });

    /**
     * Handle reduced motion preference
     */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (prefersReducedMotion.matches) {
        scrollSections.forEach(section => {
            const content = section.querySelector('.scroll-content');
            if (content) {
                content.classList.add('is-visible');
                section.classList.add('is-active');
            }
        });
    }

    // Scroll animations initialized
    console.log(`Scroll animations initialized for ${scrollSections.length} sections`);

})();
// ===== THEME TOGGLE =====
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;

// Check for saved theme preference or default to light
const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});

// ===== MOBILE MENU =====
const navToggle = document.getElementById('nav-toggle');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav__link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('show');
        document.body.style.overflow = navMenu.classList.contains('show') ? 'hidden' : '';
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        document.body.style.overflow = '';
    });
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== CONTACT FORM - MAILTO =====
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const subject = document.getElementById('subject').value.trim();
        const message = document.getElementById('message').value.trim();

        const emailTo = 'yash.singh@email.com';
        const emailSubject = encodeURIComponent(subject);
        const emailBody = encodeURIComponent(`From: ${name}\n\n${message}\n\n---\nSent via Portfolio Contact Form`);

        const mailtoLink = `mailto:${emailTo}?subject=${emailSubject}&body=${emailBody}`;
        window.location.href = mailtoLink;
    });
}

// ===== SCROLL HEADER EFFECT =====
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = 'none';
    }

    lastScroll = currentScroll;
});

// ===== HERO SECTION FADE OUT ON SCROLL =====
const heroContent = document.querySelector('.home__content');
const techIcons = document.querySelector('.tech-icons');

window.addEventListener('scroll', () => {
    const scrollPosition = window.pageYOffset;
    const windowHeight = window.innerHeight;

    // Calculate opacity based on scroll (fades out in first 500px of scroll)
    const fadeStart = 0;
    const fadeEnd = 500;

    if (scrollPosition <= fadeStart) {
        if (heroContent) {
            heroContent.style.opacity = '1';
            heroContent.style.transform = 'translateY(0)';
        }
        if (techIcons) {
            techIcons.style.opacity = '1';
        }
    } else if (scrollPosition >= fadeEnd) {
        if (heroContent) {
            heroContent.style.opacity = '0';
            heroContent.style.transform = 'translateY(-30px)';
        }
        if (techIcons) {
            techIcons.style.opacity = '0';
        }
    } else {
        const fadeProgress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
        const opacity = 1 - fadeProgress;
        const translateY = fadeProgress * -30;

        if (heroContent) {
            heroContent.style.opacity = opacity.toString();
            heroContent.style.transform = `translateY(${translateY}px)`;
        }
        if (techIcons) {
            techIcons.style.opacity = opacity.toString();
        }
    }
});

// ===== TYPING EFFECT =====
const typingElement = document.getElementById('typing-text');
const phrases = ['IoT Engineer', '\u2699\uFE0F Designing Intelligent Connected Systems', '\uD83C\uDF10 Innovating Through Cloud, Automation & Next-Gen Technologies', '\uD83D\uDCBB Solving Real-World Challenges with Smart Technology', '\uD83D\uDE80 Transforming Ideas into Scalable Solutions!'];
let phraseIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    if (!typingElement) return;

    const currentPhrase = phrases[phraseIndex];

    if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
    }

    if (!isDeleting && charIndex === currentPhrase.length) {
        isDeleting = true;
        setTimeout(type, 2000);
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        setTimeout(type, 500);
    } else {
        const speed = isDeleting ? 50 : 100;
        setTimeout(type, speed);
    }
}

document.addEventListener('DOMContentLoaded', type);


