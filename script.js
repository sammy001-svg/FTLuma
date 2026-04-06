/**
 * FTLuma Blog - Main JavaScript File
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    
    // --- Dark/Light Mode Toggle ---
    const themeBtn = document.querySelector('.theme-toggle');
    const html = document.documentElement;
    const themeIcon = themeBtn.querySelector('i');
    
    // Check local storage for theme preference
    const savedTheme = localStorage.getItem('ftluma-theme');
    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
        updateThemeIcon(savedTheme);
    }

    themeBtn.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('ftluma-theme', newTheme);
        updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
        if (theme === 'light') {
            themeIcon.classList.remove('ph-sun');
            themeIcon.classList.add('ph-moon');
        } else {
            themeIcon.classList.remove('ph-moon');
            themeIcon.classList.add('ph-sun');
        }
    }

    // --- Mobile Menu Toggle ---
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;

    if (mobileBtn && navLinks) {
        const toggleMenu = () => {
            const isOpen = navLinks.classList.toggle('show');
            body.classList.toggle('no-scroll', isOpen);
            
            const icon = mobileBtn.querySelector('i');
            if (isOpen) {
                icon.classList.remove('ph-list');
                icon.classList.add('ph-x');
            } else {
                icon.classList.remove('ph-x');
                icon.classList.add('ph-list');
            }
        };

        mobileBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu();
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (navLinks.classList.contains('show')) {
                    toggleMenu();
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('show') && 
                !navLinks.contains(e.target) && 
                !mobileBtn.contains(e.target)) {
                toggleMenu();
            }
        });
    }

    // Add no-scroll CSS dynamically if not present
    if (!document.getElementById('no-scroll-style')) {
        const style = document.createElement('style');
        style.id = 'no-scroll-style';
        style.textContent = '.no-scroll { overflow: hidden; }';
        document.head.appendChild(style);
    }

    // --- Navbar Scroll Effect ---
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // --- Filter Buttons (Simulated Logic) ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterBtns.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            
            // In a real app, this would filter the DOM elements or fetch new data
            // For now, we simulate a loading/filtering animation
            const postCards = document.querySelectorAll('.post-card');
            postCards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
                
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 100 * (index + 1));
            });
        });
    });

    // --- Comment Section Logic ---
    const commentForms = document.querySelectorAll('.comment-form');
    
    commentForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get inputs
            const nameInput = form.querySelector('.comment-name');
            const textInput = form.querySelector('.comment-text');
            
            const commentsSection = form.closest('.comments-section');
            const commentsList = commentsSection.querySelector('.comments-list');
            const commentCountSpan = commentsSection.querySelector('.comment-count');
            
            // Basic validation
            if (!nameInput.value.trim() || !textInput.value.trim()) return;
            
            // Format current date e.g., "Oct 26, 2026"
            const date = new Date();
            const dateOptions = { month: 'short', day: 'numeric', year: 'numeric' };
            const formattedDate = date.toLocaleDateString('en-US', dateOptions);
            
            // Get first letter of name for avatar
            const initial = nameInput.value.charAt(0).toUpperCase();

            // Create comment HTML element
            const commentCard = document.createElement('div');
            commentCard.className = 'comment-card';
            commentCard.innerHTML = `
                <div class="comment-avatar">${initial}</div>
                <div class="comment-content">
                    <div class="comment-author-name">${nameInput.value}</div>
                    <div class="comment-date">${formattedDate}</div>
                    <div class="comment-text-content">${textInput.value}</div>
                </div>
            `;
            
            // Prepend new comment to top of the list
            commentsList.prepend(commentCard);
            
            // Update the count
            let currentCount = parseInt(commentCountSpan.textContent, 10) || 0;
            commentCountSpan.textContent = currentCount + 1;
            
            // Clear inputs
            nameInput.value = '';
            textInput.value = '';
        });
    });

    // Initialize Footer Year
    const yearSpan = document.getElementById('current-year');
    if (yearSpan) yearSpan.textContent = new Date().getFullYear();

    // Initialize Features
    renderSupabaseArticles();
    initSubscription();
    initContactForm();
});

/* ==========================================================================
   Contact Form Handler (Supabase)
   ========================================================================== */
async function initContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        const formData = {
            name: nameInput.value,
            email: emailInput.value,
            subject: subjectInput.value,
            message: messageInput.value
        };

        // Insert to Supabase
        const { error } = await supabase
            .from('contact_messages')
            .insert([formData]);

        if (error) {
            console.error('Contact form error:', error);
            alert('There was an error sending your message. Please try again.');
            return;
        }

        // Show Success State
        contactForm.innerHTML = `
            <div class="subscribe-success" style="padding: 3rem 0; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <i class="ph ph-check-circle" style="color: var(--accent); font-size: 4rem; margin-bottom: 1.5rem;"></i>
                <h2 style="margin-bottom: 0.5rem">Message received!</h2>
                <p style="color: var(--text-secondary); text-align: center;">Thank you for reaching out, ${formData.name.split(' ')[0]}.<br>Our team will get back to you shortly.</p>
                <button class="btn btn-primary" style="margin-top: 2.5rem" onclick="window.location.reload()">Send another message</button>
            </div>
        `;
    });
}


/* ==========================================================================
   Blog Posts - Supabase Rendering
   ========================================================================== */
async function renderSupabaseArticles() {
    const postGrid = document.querySelector('.layout-grid');
    const heroInfo = document.querySelector('.featured-info');
    const heroImg = document.querySelector('#hero-img-placeholder');
    const heroAuthorImg = document.querySelector('#author-img-1');
    
    // Only run on index.html or root
    const isHomePage = window.location.pathname.endsWith('index.html') || 
                       window.location.pathname.endsWith('index') || 
                       window.location.pathname.endsWith('/') || 
                       window.location.pathname === '';

    if (!postGrid && !heroInfo) return;

    // Fetch articles with joins
    const { data: posts, error } = await supabase
        .from('articles')
        .select(`
            *,
            authors (name, avatar_url),
            categories (name)
        `)
        .eq('status', 'published')
        .order('published_at', { ascending: false });

    if (error) {
        console.error('Error fetching articles:', error);
        return;
    }

    // Handle Hero Section
    if (isHomePage && heroInfo) {
        const featured = posts.find(p => p.is_featured);
        if (featured) {
            heroInfo.querySelector('h2').textContent = featured.title;
            heroInfo.querySelector('.author span').textContent = featured.authors?.name;
            
            const dateStr = new Date(featured.published_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            heroInfo.querySelector('.date').textContent = dateStr;
            
            const readTimeEl = heroInfo.querySelector('.read-time');
            if (readTimeEl) readTimeEl.innerHTML = `<i class="ph ph-clock"></i> ${featured.read_time}`;
            
            if (heroImg) heroImg.src = featured.featured_image;
            if (heroAuthorImg) heroAuthorImg.src = featured.authors?.avatar_url;
            
            // Link hero to actual article
            const heroLink = heroInfo.closest('a');
            if (heroLink) heroLink.href = `${featured.slug}`;
        }
    }

    // Handle Grid
    if (postGrid) {
        // Find which posts are already hardcoded to avoid duplicates if needed
        // For a clean "live" experience, we'll clear and re-render only if there's new data
        // For now, let's just clear the grid and show dynamic posts
        postGrid.innerHTML = '';
        
        posts.filter(p => !p.is_featured).forEach(post => {
            const article = document.createElement('article');
            article.className = 'post-card glass-panel fade-in';
            article.innerHTML = `
                <div class="post-img-wrapper">
                  <img src="${post.featured_image || 'images/post-1.png'}" alt="Post thumbnail" class="post-img">
                  <div class="tags">
                    <span class="tag">${post.categories?.name || 'Finance'}</span>
                  </div>
                </div>
                <div class="post-content">
                  <h3 class="post-title">
                    <a href="${post.slug}">${post.title}</a>
                  </h3>
                  <p class="post-excerpt">${post.excerpt}</p>
                  <div class="meta">
                    <div class="author">
                      <img src="${post.authors?.avatar_url || 'images/author-1.png'}" alt="Author" class="avatar">
                      <span>${post.authors?.name || 'FTLuma Team'}</span>
                    </div>
                    <span class="date">${new Date(post.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
            `;
            postGrid.appendChild(article);
        });
    }
}

/* ==========================================================================
   Subscription System (Supabase)
   ========================================================================== */
function initSubscription() {
    const modal = document.getElementById('subscribe-modal');
    if (!modal) return;

    const triggers = document.querySelectorAll('.subscribe-trigger');
    const closeBtn = modal.querySelector('.modal-close');
    const forms = document.querySelectorAll('.subscribe-form, .newsletter-form');

    const closeModal = () => {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    };

    triggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
            document.body.style.overflow = 'hidden';
        });
    });

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const emailInput = form.querySelector('input[type="email"]');
            if (!emailInput) return;
            
            const email = emailInput.value;

            if (email) {
                const { error } = await supabase
                    .from('newsletter_subscriptions')
                    .insert([{ email }]);

                if (error) {
                    console.error('Subscription error:', error);
                    if (error.code === '23505') {
                        form.innerHTML = `<div class="subscribe-success"><h3>Already Subscribed!</h3><p>You're already on the list.</p></div>`;
                    }
                    return;
                }

                form.innerHTML = `
                  <div class="subscribe-success">
                    <i class="ph ph-check-circle"></i>
                    <h3>You're in!</h3>
                    <p>Welcome to FTLuma.</p>
                  </div>
                `;

                if (form.classList.contains('modal-form')) {
                    setTimeout(() => { closeModal(); }, 2500);
                }
            }
        });
    });
}

