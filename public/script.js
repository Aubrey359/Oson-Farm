// Oson Farm - Modern JavaScript Implementation
// Inspired by One Acre Fund's clean, professional design

class OsonFarmWebsite {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupAnimations();
        this.setupInteractiveElements();
        this.setupScrollEffects();
        this.setupFormHandling();
        this.setupImageLazyLoading();
        this.setupMobileMenu();
        this.setupParallaxEffects();
        this.setupCounters();
        this.setupTestimonials();
        this.setupProductGallery();
        this.setupNewsletterSignup();
        this.setupContactForm();
        this.setupSearchFunctionality();
        this.setupBackToTop();
        this.setupLoadingScreen();
    }

    setupNavigation() {
        const nav = document.querySelector('nav');
        if (!nav) return;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 100) nav.classList.add('sticky');
            else nav.classList.remove('sticky');
        });

        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        nav.querySelectorAll('a').forEach(link => {
            if (link.getAttribute('href') === currentPage) link.classList.add('active');
        });
    }

    setupAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add('animate-in');
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        document.querySelectorAll('section, .product-item, .landing-link, .card, .feature-card').forEach(el => observer.observe(el));

        document.querySelectorAll('.product-item').forEach((item, i) => {
            item.style.animationDelay = `${i * 0.1}s`;
        });
    }

    setupInteractiveElements() {
        document.querySelectorAll('.landing-link, .product-item, .card, .feature-card').forEach(item => {
            item.addEventListener('mouseenter', (e) => this.addHoverEffect(e.currentTarget));
            item.addEventListener('mouseleave', (e) => this.removeHoverEffect(e.currentTarget));
        });

        document.querySelectorAll('button, .btn, .cta-btn, .nav-btn').forEach(button => {
            button.addEventListener('click', (e) => this.createRippleEffect(e));
        });
    }

    addHoverEffect(element) {
        element.style.transform = 'translateY(-5px) scale(1.01)';
        element.style.boxShadow = '0 10px 30px rgba(127, 255, 0, 0.2)';
    }
    removeHoverEffect(element) {
        element.style.transform = 'translateY(0) scale(1)';
        element.style.boxShadow = '';
    }
    createRippleEffect(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }

    setupScrollEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            document.querySelectorAll('.parallax').forEach(element => {
                const speed = parseFloat(element.dataset.speed || '0.5');
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                const targetSel = anchor.getAttribute('href');
                if (!targetSel || targetSel === '#') return;
                const target = document.querySelector(targetSel);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    setupFormHandling() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleFormSubmission(form);
            });
            form.querySelectorAll('input, textarea, select').forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
            });
        });
    }
    handleFormSubmission(form) {
        const submitButton = form.querySelector('button[type="submit"], .btn[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : null;
        if (submitButton) {
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
        }
        setTimeout(() => {
            this.showNotification('Form submitted successfully!', 'success');
            form.reset();
            if (submitButton) {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }
        }, 1200);
    }
    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';
        field.classList.remove('error');
        if (field.hasAttribute('required') && !value) {
            isValid = false; message = 'This field is required';
        } else if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false; message = 'Please enter a valid email address';
        } else if (field.type === 'tel' && value && !/^[\+]?[1-9][\d]{0,15}$/.test(value.replace(/\s/g, ''))) {
            isValid = false; message = 'Please enter a valid phone number';
        }
        if (!isValid) {
            field.classList.add('error');
            this.showFieldError(field, message);
        } else {
            this.removeFieldError(field);
        }
    }
    showFieldError(field, message) {
        let errorEl = field.parentNode.querySelector('.field-error');
        if (!errorEl) {
            errorEl = document.createElement('div');
            errorEl.className = 'field-error';
            field.parentNode.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
    removeFieldError(field) {
        const errorEl = field.parentNode.querySelector('.field-error');
        if (errorEl) errorEl.remove();
    }

    setupImageLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        if (images.length === 0) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    obs.unobserve(img);
                }
            });
        });
        images.forEach(img => obs.observe(img));
    }

    setupMobileMenu() {
        const nav = document.querySelector('nav');
        if (!nav || nav.querySelector('.mobile-menu-btn')) return;
        const btn = document.createElement('button');
        btn.className = 'mobile-menu-btn';
        btn.innerHTML = '<span></span><span></span><span></span>';
        nav.appendChild(btn);
        btn.addEventListener('click', () => nav.classList.toggle('mobile-open'));
        document.addEventListener('click', (e) => { if (!nav.contains(e.target)) nav.classList.remove('mobile-open'); });
    }

    setupParallaxEffects() {
        document.querySelectorAll('section').forEach((section, i) => {
            if (i % 2 === 0) {
                section.classList.add('parallax');
                section.dataset.speed = '0.3';
            }
        });
    }

    setupCounters() {
        const counters = document.querySelectorAll('.counter');
        if (counters.length === 0) return;
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        });
        counters.forEach(c => obs.observe(c));
    }
    animateCounter(counter) {
        const target = parseInt(counter.dataset.target, 10) || 0;
        const duration = 1500, steps = Math.max(1, Math.floor(duration / 16));
        let current = 0;
        const timer = setInterval(() => {
            current += Math.ceil(target / steps);
            if (current >= target) { current = target; clearInterval(timer); }
            counter.textContent = current.toLocaleString();
        }, 16);
    }

    setupTestimonials() {
        const items = document.querySelectorAll('.testimonial');
        if (items.length === 0) return;
        let i = 0;
        const show = idx => items.forEach((t, j) => t.style.display = j === idx ? 'block' : 'none');
        show(0);
        setInterval(() => { i = (i + 1) % items.length; show(i); }, 5000);
        const dots = document.createElement('div'); dots.className = 'testimonial-dots';
        items[0].parentNode.appendChild(dots);
        items.forEach((_, idx) => {
            const dot = document.createElement('span');
            dot.addEventListener('click', () => { i = idx; show(i); });
            dots.appendChild(dot);
        });
    }

    setupProductGallery() {
        document.querySelectorAll('.product-item img').forEach(img => {
            img.addEventListener('click', () => this.openLightbox(img.src, img.alt));
        });
    }
    openLightbox(src, alt) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <img src="${src}" alt="${alt}">
                <button class="lightbox-close" aria-label="Close">&times;</button>
            </div>
        `;
        document.body.appendChild(lightbox);
        document.body.style.overflow = 'hidden';
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
                lightbox.remove(); document.body.style.overflow = '';
            }
        });
    }

    setupNewsletterSignup() {
        const form = document.querySelector('.newsletter-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = form.querySelector('input[type="email"]')?.value || '';
            if (!email) return;
            this.subscribeToNewsletter(email);
        });
    }
    subscribeToNewsletter() {
        this.showNotification('Thank you for subscribing to our newsletter!', 'success');
    }

    setupContactForm() {
        const form = document.querySelector('#contact-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
            form.reset();
        });
    }

    setupSearchFunctionality() {
        const input = document.querySelector('.search-input');
        if (!input) return;
        input.addEventListener('input', (e) => {
            const q = e.target.value.toLowerCase();
            document.querySelectorAll('.searchable').forEach(el => {
                el.style.display = el.textContent.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    setupBackToTop() {
        const btn = document.createElement('button');
        btn.className = 'back-to-top';
        btn.innerHTML = '↑';
        btn.setAttribute('aria-label', 'Back to top');
        document.body.appendChild(btn);
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) btn.classList.add('visible');
            else btn.classList.remove('visible');
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    setupLoadingScreen() {
        const screen = document.createElement('div');
        screen.className = 'loading-screen';
        screen.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h2>Welcome to Oson Farm</h2>
                <p>Loading your sustainable farming experience...</p>
            </div>
        `;
        document.body.appendChild(screen);
        window.addEventListener('load', () => {
            setTimeout(() => {
                screen.classList.add('fade-out');
                setTimeout(() => screen.remove(), 500);
            }, 700);
        });
    }

    showNotification(message, type = 'info') {
        const n = document.createElement('div');
        n.className = `notification notification-${type}`;
        n.textContent = message;
        document.body.appendChild(n);
        setTimeout(() => n.classList.add('show'), 50);
        setTimeout(() => {
            n.classList.remove('show');
            setTimeout(() => n.remove(), 300);
        }, 3500);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OsonFarmWebsite();
});