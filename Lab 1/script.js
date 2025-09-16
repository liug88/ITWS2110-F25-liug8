document.addEventListener('DOMContentLoaded', function() {
    
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerOffset = 80; // Account for fixed navigation
                const elementPosition = targetSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
                
                // Add active state to clicked link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Intersection Observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate skill categories with stagger effect
                if (entry.target.classList.contains('skills-grid')) {
                    const skillCategories = entry.target.querySelectorAll('.skill-category');
                    skillCategories.forEach((category, index) => {
                        setTimeout(() => {
                            category.style.opacity = '1';
                            category.style.transform = 'translateY(0)';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);

    // Observe all cards and sections for animations
    const animatedElements = document.querySelectorAll('.card, .education-item, .work-item');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Handle skills grid separately to ensure it shows properly
    const skillsGrid = document.querySelector('.skills-grid');
    if (skillsGrid) {
        skillsGrid.style.opacity = '0';
        skillsGrid.style.transform = 'translateY(30px)';
        skillsGrid.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(skillsGrid);
    }

    // Ensure skill categories are visible by default
    const skillCategories = document.querySelectorAll('.skill-category');
    skillCategories.forEach((category) => {
        // Remove any hidden styles
        category.style.opacity = '1';
        category.style.transform = 'translateY(0)';
        category.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    // Navbar scroll effect
    const navbar = document.querySelector('nav');

    window.addEventListener('scroll', function() {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.style.backgroundColor = 'rgba(201, 160, 220, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.backgroundColor = '#C9A0DC';
            navbar.style.backdropFilter = 'none';
        }
    });

    // Add typing animation to the main heading
    const heading = document.querySelector('header h1');
    if (heading) {
        const text = heading.textContent;
        heading.textContent = '';
        heading.style.borderRight = '2px solid #C9A0DC';
        
        let i = 0;
        const typeWriter = function() {
            if (i < text.length) {
                heading.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 100);
            } else {
                // Remove cursor after typing is complete
                setTimeout(() => {
                    heading.style.borderRight = 'none';
                }, 1000);
            }
        };
        
        // Start typing animation after a short delay
        setTimeout(typeWriter, 500);
    }

    // Add hover effects for external links
    const externalLinks = document.querySelectorAll('a[target="_blank"]');
    externalLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });

    // Add click ripple effect to buttons and cards
    function createRipple(event) {
        const element = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - element.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - element.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = element.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        element.appendChild(circle);
    }

    // Add ripple effect styles
    const style = document.createElement('style');
    style.textContent = `
        .ripple {
            position: absolute;
            border-radius: 50%;
            background-color: rgba(201, 160, 220, 0.4);
            transform: scale(0);
            animation: ripple-animation 0.6s linear;
            pointer-events: none;
        }
        
        @keyframes ripple-animation {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
        
        .card, .button {
            position: relative;
            overflow: hidden;
        }
        
        nav a.active {
            background-color: #111003;
            color: #FFFFFF;
        }
    `;
    document.head.appendChild(style);

    // Apply ripple effect to clickable elements
    const clickableElements = document.querySelectorAll('.card, .button');
    clickableElements.forEach(element => {
        element.addEventListener('click', createRipple);
    });

    // Profile photo zoom effect
    const profilePhoto = document.querySelector('.profile-photo');
    if (profilePhoto) {
        profilePhoto.addEventListener('click', function() {
            this.style.transform = this.style.transform === 'scale(1.2)' ? 'scale(1)' : 'scale(1.2)';
        });
    }

    // Add scroll progress indicator
    const progressBar = document.createElement('div');
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(90deg, #C9A0DC, #111003);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', function() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });

    // Console welcome message
    console.log(`
    🎉 Welcome to Gavin Liu's Portfolio!
    
    This website features:
    ✨ Smooth scrolling navigation
    🎨 Professional color scheme
    📱 Responsive design
    ⚡ Interactive animations
    🖱️ Hover effects and transitions
    
    Built with HTML, CSS, and JavaScript
    `);
});