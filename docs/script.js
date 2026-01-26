document.addEventListener('DOMContentLoaded', () => {
  /* ===========================
     THEME SWITCHER LOGIC
     =========================== */
  const themeBtns = document.querySelectorAll('.theme-btn');
  const body = document.body;

  // Retrieve saved theme or default
  const savedTheme = localStorage.getItem('obsisphere-theme') || '';
  if (savedTheme) {
    body.className = savedTheme;
  }
  
  updateActiveThemeBtn(savedTheme);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeClass = btn.getAttribute('data-theme');
      body.className = '';
      if (themeClass) {
        body.classList.add(themeClass);
      }
      localStorage.setItem('obsisphere-theme', themeClass);
      updateActiveThemeBtn(themeClass);
    });
  });

  function updateActiveThemeBtn(activeTheme) {
    themeBtns.forEach(btn => {
      const btnTheme = btn.getAttribute('data-theme');
      if (btnTheme === activeTheme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  /* ===========================
     SPA NAVIGATION & MOBILE MENU
     =========================== */
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view-section');
  const brand = document.querySelector('.brand');
  const triggers = document.querySelectorAll('.nav-trigger');
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');

  // Toggle Mobile Menu
  if(mobileMenuBtn) {
      mobileMenuBtn.addEventListener('click', () => {
          navMenu.classList.toggle('open');
      });
  }

  function switchView(targetId) {
    const isMobile = window.innerWidth <= 768;
    const targetView = document.getElementById(`view-${targetId}`);

    // Update Desktop State
    views.forEach(view => {
      view.classList.remove('active');
    });

    if (targetView) {
      targetView.classList.add('active');
    }

    navItems.forEach(item => {
      if (item.getAttribute('data-target') === targetId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Close mobile menu if open
    if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
    }

    if (isMobile) {
      if (targetView) {
        const headerOffset = 80;
        const elementPosition = targetView.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const target = item.getAttribute('data-target');
      switchView(target);
    });
  });

  if (brand) {
    brand.addEventListener('click', () => switchView('home'));
  }

  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const target = trigger.getAttribute('data-target');
      switchView(target);
    });
  });

  /* ===========================
     FAQ ACCORDION
     =========================== */
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
      q.addEventListener('click', () => {
          q.classList.toggle('active');
          const answer = q.nextElementSibling;
          if (q.classList.contains('active')) {
              answer.style.maxHeight = answer.scrollHeight + "px";
          } else {
              answer.style.maxHeight = null;
          }
      });
  });

  /* ===========================
     LIGHTBOX
     =========================== */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTriggers = document.querySelectorAll('.lightbox-trigger');
  const lightboxClose = document.querySelector('.lightbox-close');

  lightboxTriggers.forEach(img => {
      img.addEventListener('click', () => {
          lightboxImg.src = img.src;
          lightbox.classList.add('open');
      });
  });

  if (lightboxClose) {
      lightboxClose.addEventListener('click', () => {
          lightbox.classList.remove('open');
      });
  }

  if (lightbox) {
      lightbox.addEventListener('click', (e) => {
          if (e.target === lightbox) {
              lightbox.classList.remove('open');
          }
      });
  }

  /* ===========================
     SCROLL REVEAL & TOP BTN
     =========================== */
  const scrollTopBtn = document.getElementById('scroll-top-btn');

  // Reveal Elements on Scroll
  const revealElements = document.querySelectorAll('.scroll-reveal');
  const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.classList.add('visible');
          }
      });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));

  // Scroll To Top Logic
  window.addEventListener('scroll', () => {
      if (window.innerWidth <= 768) {
          if (window.scrollY > 300) {
              scrollTopBtn.classList.add('visible');
          } else {
              scrollTopBtn.classList.remove('visible');
          }
      }
  });

  scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* =========================================
     3D CONSTELLATION & NEBULA ENGINE
     ========================================= */
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  
  let width, height;
  let stars = [];
  let nebulas = [];
  
  // 3D Perspective Configuration
  const FOCAL_LENGTH = 400; 
  const STAR_COUNT = 250;
  const Z_MAX = 2000;     
  const Z_SPEED = 1.5;    
  
  const targetOrigin = { x: 0, y: 0 };
  const currentOrigin = { x: 0, y: 0 };

  function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      targetOrigin.x = width / 2;
      targetOrigin.y = height / 2;
      currentOrigin.x = width / 2;
      currentOrigin.y = height / 2;
      initSpace();
  }

  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
      targetOrigin.x = e.clientX;
      targetOrigin.y = e.clientY;
  });
  
  window.addEventListener('touchmove', (e) => {
      targetOrigin.x = e.touches[0].clientX;
      targetOrigin.y = e.touches[0].clientY;
  });

  /* --- CLASSES --- */

  // 3D Star
  class Star {
      constructor() { this.init(true); }
      
      init(randomZ) {
          this.x = (Math.random() - 0.5) * width * 2; 
          this.y = (Math.random() - 0.5) * height * 2;
          this.z = randomZ ? Math.random() * Z_MAX : Z_MAX;
          this.size = Math.random() * 1.5 + 0.5;
          this.sx = 0;
          this.sy = 0;
      }

      update() {
          this.z -= Z_SPEED;
          if (this.z <= 1) this.init(false);
      }

      project() {
          const scale = FOCAL_LENGTH / this.z;
          this.sx = this.x * scale + currentOrigin.x;
          this.sy = this.y * scale + currentOrigin.y;
          return (this.sx > -50 && this.sx < width + 50 && this.sy > -50 && this.sy < height + 50);
      }

      draw() {
          const scale = FOCAL_LENGTH / this.z;
          const brightness = (1 - this.z / Z_MAX);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
          ctx.beginPath();
          ctx.arc(this.sx, this.sy, this.size * scale, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  // Drifting Background Nebula 
  class Nebula {
      constructor(colorStr) {
          this.x = Math.random() * width;
          this.y = Math.random() * height;
          this.radius = Math.random() * 300 + 400; 
          this.vx = (Math.random() - 0.5) * 0.3;
          this.vy = (Math.random() - 0.5) * 0.3;
          this.color = colorStr;
          this.phase = Math.random() * Math.PI * 2;
      }

      update() {
          this.x += this.vx;
          this.y += this.vy;
          this.phase += 0.005;

          if (this.x < -this.radius) this.x = width + this.radius;
          if (this.x > width + this.radius) this.x = -this.radius;
          if (this.y < -this.radius) this.y = height + this.radius;
          if (this.y > height + this.radius) this.y = -this.radius;
      }

      draw() {
          // Reverted to normal blending
          const alpha = 0.15 + Math.sin(this.phase) * 0.05; 
          
          const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
          
          if (this.color === 'purple') {
              gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha})`); 
              gradient.addColorStop(0.5, `rgba(139, 92, 246, ${alpha * 0.5})`); 
          } else if (this.color === 'blue') {
              gradient.addColorStop(0, `rgba(56, 189, 248, ${alpha})`); 
              gradient.addColorStop(0.5, `rgba(56, 189, 248, ${alpha * 0.5})`); 
          } else {
              gradient.addColorStop(0, `rgba(16, 185, 129, ${alpha})`); 
              gradient.addColorStop(0.5, `rgba(16, 185, 129, ${alpha * 0.5})`); 
          }
          gradient.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
      }
  }

  /* --- INITIALIZATION --- */
  function initSpace() {
      stars = [];
      nebulas = [];

      for (let i = 0; i < STAR_COUNT; i++) {
          stars.push(new Star());
      }
      nebulas.push(new Nebula('purple'));
      nebulas.push(new Nebula('blue'));
      nebulas.push(new Nebula('teal'));
  }

  /* --- RENDER LOOP --- */
  function animate() {
      ctx.clearRect(0, 0, width, height);

      currentOrigin.x += (targetOrigin.x - currentOrigin.x) * 0.05;
      currentOrigin.y += (targetOrigin.y - currentOrigin.y) * 0.05;

      // 1. Draw Nebulas
      nebulas.forEach(n => { n.update(); n.draw(); });

      // 2. Project Stars
      const visibleStars = [];
      stars.forEach(star => {
          star.update();
          if (star.project()) visibleStars.push(star);
      });

      // 3. Draw Constellations
      ctx.lineWidth = 0.5;
      // Reverted to normal blending
      
      const connectionDist = 180; 
      const connectionDistSq = connectionDist * connectionDist;

      for (let i = 0; i < visibleStars.length; i++) {
          const a = visibleStars[i];
          for (let j = i + 1; j < visibleStars.length; j++) {
              const b = visibleStars[j];
              
              const dx = a.sx - b.sx;
              const dy = a.sy - b.sy;
              const distSq = dx*dx + dy*dy;

              if (distSq < connectionDistSq) {
                  const distFactor = 1 - (distSq / connectionDistSq);
                  const depthFactor = (1 - a.z / Z_MAX) * (1 - b.z / Z_MAX); 
                  
                  if (distFactor > 0 && depthFactor > 0) {
                    ctx.strokeStyle = `rgba(167, 139, 250, ${distFactor * depthFactor * 0.6})`;
                    ctx.beginPath();
                    ctx.moveTo(a.sx, a.sy);
                    ctx.lineTo(b.sx, b.sy);
                    ctx.stroke();
                  }
              }
          }
      }

      // 4. Draw Stars
      visibleStars.forEach(star => star.draw());

      requestAnimationFrame(animate);
  }

  resize();
  animate();
});