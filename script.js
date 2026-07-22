/* ==========================================================================
   PARTICLE BACKGROUND ENGINE
   ========================================================================== */
class ParticleBackground {
  constructor() {
    this.canvas = document.getElementById('particles-canvas');
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.particleCount = 50;
    this.mouse = { x: null, y: null, radius: 150 };
    
    this.init();
    this.animate();
    this.registerEvents();
  }
  
  init() {
    this.resizeCanvas();
    this.createParticles();
  }
  
  resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }
  
  createParticles() {
    this.particles = [];
    const colors = ['#f29edb', '#a66cff', '#5ae3f1'];
    
    for (let i = 0; i < this.particleCount; i++) {
      const size = Math.random() * 2.5 + 1; // 1px to 3.5px
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      const speedX = (Math.random() - 0.5) * 0.4;
      const speedY = (Math.random() - 0.5) * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const opacity = Math.random() * 0.4 + 0.1;
      
      this.particles.push({
        x, y, size, speedX, speedY, color, opacity,
        originalOpacity: opacity,
        baseX: x, baseY: y
      });
    }
  }
  
  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(p => {
      // Move particle
      p.x += p.speedX;
      p.y += p.speedY;
      
      // Boundary check
      if (p.x < 0 || p.x > this.canvas.width) p.speedX *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.speedY *= -1;
      
      // Mouse interaction (gentle repulsion)
      if (this.mouse.x !== null && this.mouse.y !== null) {
        const dx = p.x - this.mouse.x;
        const dy = p.y - this.mouse.y;
        const distance = Math.hypot(dx, dy);
        
        if (distance < this.mouse.radius) {
          const force = (this.mouse.radius - distance) / this.mouse.radius;
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          p.x += directionX * force * 1.5;
          p.y += directionY * force * 1.5;
          p.opacity = Math.min(1, p.originalOpacity + force * 0.6);
        } else {
          if (p.opacity > p.originalOpacity) {
            p.opacity -= 0.01;
          }
        }
      }
      
      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      
      // Add glowing shadow for larger particles
      if (p.size > 2) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fill();
    });
    
    this.ctx.shadowBlur = 0; // reset
    this.ctx.globalAlpha = 1.0;
    requestAnimationFrame(this.animate.bind(this));
  }
  
  registerEvents() {
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.createParticles();
    });
    
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
  }
}

/* ==========================================================================
   INTERACTIVE 3D TILT EFFECT FOR CARDS
   ========================================================================== */
function initTiltEffect() {
  const cards = document.querySelectorAll('.project-card, .education-card, .skill-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position inside element
      const y = e.clientY - rect.top;  // y position inside element
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation angles (-4deg to 4deg)
      const rotateX = -(y - centerY) / (centerY / 4);
      const rotateY = (x - centerX) / (centerX / 4);
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      
      // Set background overlay gradient matching cursor coordinates
      if (card.classList.contains('project-card')) {
        const glowColor = card.querySelector('.link-demo') ? 'rgba(166, 108, 255, 0.06)' : 'rgba(242, 158, 219, 0.06)';
        card.style.background = `
          radial-gradient(circle 200px at ${x}px ${y}px, ${glowColor}, transparent),
          var(--glass-bg)
        `;
      }
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      card.style.background = 'var(--glass-bg)';
    });
  });
}

/* ==========================================================================
   NAVIGATION SCROLL & MOBILE MENU TOGGLE
   ========================================================================== */
function initNavigation() {
  const header = document.getElementById('main-header');
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('navigation-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  
  // Sticky header class trigger
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
  
  // Mobile Hamburger Toggle
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
    
    // Close mobile menu on links clicks
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileToggle.classList.remove('active');
        navMenu.classList.remove('active');
      });
    });
  }
}

/* ==========================================================================
   SCROLL REVEAL & NAV ACTIVE LINK OBSERVERS
   ========================================================================== */
function initScrollObservers() {
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');
  const revealElements = document.querySelectorAll('.reveal-element');
  
  // Section active link highlights
  const sectionOptions = {
    root: null,
    rootMargin: '-30% 0px -40% 0px', // Trigger activation near viewport center
    threshold: 0
  };
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }, sectionOptions);
  
  sections.forEach(section => {
    sectionObserver.observe(section);
  });
  
  // Reveal animations on scroll
  const revealOptions = {
    root: null,
    rootMargin: '0px 0px -100px 0px', // Animate slightly before element appears
    threshold: 0.1
  };
  
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target); // Trigger only once
      }
    });
  }, revealOptions);
  
  revealElements.forEach(el => {
    revealObserver.observe(el);
  });
}

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Spawn Canvas Particles
  new ParticleBackground();
  
  // Initialize Header Navigation & Mobile Hamburgers
  initNavigation();
  
  // Initialize Intersection Observers (Active state, Scroll reveals)
  initScrollObservers();
  
  // Set up 3D Card Hover Tilts
  initTiltEffect();
});
