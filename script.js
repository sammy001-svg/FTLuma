/**
 * FTLuma Blog - Unified Main Script
 * Consolidates all logic (UI + Database) for maximum reliability using Vite-friendly modules.
 */

(function() {
    const SUPABASE_URL = 'https://vkoozoumepnvstljmley.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb296b3VtZXBudnN0bGptbGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTg1NDYsImV4cCI6MjA5MDk3NDU0Nn0.jexzMstXr6HU_Wa6p1HsQ2qNd5GT3f-QJqdO1SqXRsA';

    let supabase = null;

    // --- Initialization ---
    function init() {
        console.log('FTLuma: Initializing core...');
        
        // 1. UI Helpers (Theme, Menu)
        initUI();

        // 2. Supabase Initialization
        if (window.supabase && window.supabase.createClient) {
            supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            window.supabaseInstance = supabase;
            
            // 3. Database Features
            if (isPostPage()) {
                loadSingleArticle();
            } else {
                applySiteSettings();
                renderArticles();
                initAuthors();
            }
            initSubscription();
            initContactForm();
        } else {
            console.error('FTLuma: Supabase library missing!');
        }
    }

    // --- UI Logic ---
    function isPostPage() {
        return window.location.pathname.endsWith('post.html') || 
               window.location.pathname.endsWith('/post') ||
               window.location.pathname.includes('/post/');
    }

    function initUI() {
        const html = document.documentElement;
        
        // Theme Toggle
        const applyTheme = (theme) => {
            html.setAttribute('data-theme', theme);
            localStorage.setItem('ftluma-theme', theme);
            document.querySelectorAll('.theme-toggle i').forEach(icon => {
                icon.className = theme === 'light' ? 'ph ph-moon' : 'ph ph-sun';
            });
        };
        const savedTheme = localStorage.getItem('ftluma-theme');
        if (savedTheme) applyTheme(savedTheme);
        document.querySelectorAll('.theme-toggle').forEach(btn => {
            btn.addEventListener('click', () => {
                const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
                applyTheme(next);
            });
        });

        // Mobile Menu
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        const navLinks  = document.querySelector('.nav-links');
        if (mobileBtn && navLinks) {
            const toggleMenu = (forceClose = false) => {
                const isShow = forceClose ? false : !navLinks.classList.contains('show');
                navLinks.classList.toggle('show', isShow);
                document.body.classList.toggle('no-scroll', isShow);
                const icon = mobileBtn.querySelector('i');
                if (icon) icon.className = isShow ? 'ph ph-x' : 'ph ph-list';
            };

            mobileBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                toggleMenu();
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (navLinks.classList.contains('show') && !navLinks.contains(e.target) && !mobileBtn.contains(e.target)) {
                    toggleMenu(true);
                }
            });

            // Close menu when clicking a link
            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    toggleMenu(true);
                });
            });
        }

        // Navbar Scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            window.addEventListener('scroll', () => {
                navbar.classList.toggle('scrolled', window.scrollY > 50);
            });
        }
        
        // Footer Year
        const yearSpan = document.getElementById('current-year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    // --- Database Rendering: Articles ---
    async function renderArticles() {
        const postGrid = document.querySelector('.layout-grid'); 
        const articlesHubGrid = document.querySelector('.articles-hub-grid');
        const target = postGrid || articlesHubGrid;
        
        if (!target && !document.getElementById('hero-carousel-track')) return;

        let posts = null;

        // Try to load from session cache first for speed
        try {
            const cached = sessionStorage.getItem('ftluma_posts_cache');
            if (cached) {
                const { timestamp, data } = JSON.parse(cached);
                // Cache valid for 5 minutes
                if (Date.now() - timestamp < 5 * 60 * 1000) {
                    console.log('FTLuma: Loading articles from cache');
                    posts = data;
                }
            }
        } catch (e) { console.warn('Cache load failed', e); }

        if (!posts) {
            console.log('FTLuma: Fetching articles from database...');
            const { data, error } = await supabase
                .from('articles')
                .select('id, title, slug, excerpt, featured_image, status, read_time, published_at, created_at, categories(name), authors(name, avatar_url)')
                .order('created_at', { ascending: false });

            if (error || !data) {
                if (target) target.innerHTML = `<div class="error-msg">Unable to load insights right now.</div>`;
                return;
            }
            posts = data;

            // Save to cache
            try {
                sessionStorage.setItem('ftluma_posts_cache', JSON.stringify({
                    timestamp: Date.now(),
                    data: posts
                }));
            } catch (e) { console.warn('Cache save failed', e); }
        }

        // Handle Hero Carousel
        const heroTrack = document.getElementById('hero-carousel-track');
        const heroDots = document.getElementById('hero-carousel-dots');
        
        if (heroTrack && posts.length > 0) {
            const heroPosts = posts.slice(0, 3);
            heroTrack.innerHTML = '';
            if (heroDots) heroDots.innerHTML = '';

            heroPosts.forEach((post, index) => {
                const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                const slide = document.createElement('div');
                slide.className = 'carousel-item';
                slide.innerHTML = `
                    <a href="post.html?slug=${post.slug}" class="featured-card glass-panel block-link">
                        <div class="featured-image">
                            <img src="${post.featured_image || 'images/hero-1.png'}" alt="${post.title}">
                            <div class="category-tag">Latest</div>
                        </div>
                        <div class="featured-info">
                            <h2>${post.title}</h2>
                            <div class="meta">
                                <div class="author">
                                    <img src="${post.authors?.avatar_url || 'images/author-1.png'}" class="avatar">
                                    <span>${post.authors?.name || 'FTLuma Team'}</span>
                                </div>
                                <span class="date">${dateStr}</span>
                                <span class="read-time"><i class="ph ph-clock"></i> ${post.read_time || '5'} min read</span>
                            </div>
                            <div class="hero-post-content">${post.content || ''}</div>
                        </div>
                    </a>
                `;
                heroTrack.appendChild(slide);

                if (heroDots) {
                    const dot = document.createElement('div');
                    dot.className = `dot ${index === 0 ? 'active' : ''}`;
                    dot.addEventListener('click', () => goToSlide(index));
                    heroDots.appendChild(dot);
                }
            });

            let currentSlide = 0;
            const totalSlides = heroPosts.length;
            
            function goToSlide(n) {
                currentSlide = n;
                heroTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
                if (heroDots) {
                    document.querySelectorAll('.carousel-dots .dot').forEach((d, i) => {
                        d.classList.toggle('active', i === currentSlide);
                    });
                }
            }

            function nextSlide() {
                goToSlide((currentSlide + 1) % totalSlides);
            }

            let slideInterval;
            function startAutoSlide() {
                if (totalSlides > 1) {
                    slideInterval = setInterval(nextSlide, 7000);
                }
            }
            function stopAutoSlide() {
                clearInterval(slideInterval);
            }

            if (totalSlides > 1) {
                startAutoSlide();
                heroTrack.addEventListener('mouseenter', stopAutoSlide);
                heroTrack.addEventListener('mouseleave', startAutoSlide);
            }

            const newBadge = document.querySelector('.hero-content .badge');
            if (newBadge) {
                const latest = posts[0];
                newBadge.innerHTML = `<a href="post.html?slug=${latest.slug}" style="color: inherit; text-decoration: none;"><span class="pulse-dot"></span> New: ${latest.title}</a>`;
            }
        }

        if (target) {
            target.innerHTML = '';
            const publicPosts = posts.filter(p => p.status === 'published');
            
            if (publicPosts.length === 0) {
                target.innerHTML = '<div class="empty-state">No published articles found.</div>';
                return;
            }

            publicPosts.forEach(post => {
                const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                const article = document.createElement('article');
                article.className = 'post-card glass-panel fade-in';
                article.innerHTML = `
                    <div class="post-img-container">
                        <img src="${post.featured_image || 'images/post-1.png'}" class="post-img">
                        <div class="post-badges"><span class="post-badge">${post.categories?.name || 'Finance'}</span></div>
                    </div>
                    <div class="post-body">
                        <div class="post-meta-top">
                            <span class="meta-item"><i class="ph ph-calendar-blank"></i> ${dateStr}</span>
                            <span class="meta-item"><i class="ph ph-timer"></i> ${post.read_time || '5 min read'}</span>
                        </div>
                        <h3 class="post-title"><a href="post.html?slug=${post.slug}">${post.title}</a></h3>
                        <p class="post-excerpt">${post.excerpt || 'Read full insight...'}</p>
                        <div class="post-footer">
                            <div class="author-meta">
                                <img src="${post.authors?.avatar_url || 'images/author-1.png'}" class="avatar">
                                <span class="author-name">${post.authors?.name || 'FTLuma Team'}</span>
                            </div>
                        </div>
                    </div>
                `;
                target.appendChild(article);
            });
        }
    }

    // --- Database Rendering: Authors ---
    async function initAuthors() {
        const grid = document.getElementById('authors-grid');
        if (!grid) return;

        const { data: authors, error } = await supabase.from('authors').select('*').order('name');
        if (error || !authors) return;

        grid.innerHTML = '';
        authors.forEach(author => {
            const card = document.createElement('div');
            card.className = 'author-card glass-panel fade-in';
            card.innerHTML = `
                <img src="${author.avatar_url || 'images/author-1.png'}" class="avatar-lg">
                <span class="author-role">${author.role || 'Contributor'}</span>
                <h2>${author.name}</h2>
                <p class="author-bio">${author.bio || 'Financial expert.'}</p>
                <div class="author-socials">
                    <a href="articles.html?author=${author.id}" class="btn btn-outline">View Posts</a>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    // --- Site Settings ---
    async function applySiteSettings() {
        const { data: settings } = await supabase.from('site_settings').select('*');
        if (!settings) return;

        settings.forEach(item => {
            const val = item.value;
            if (item.key === 'general' && val.title) {
                document.querySelectorAll('.logo').forEach(el => {
                    const dot = el.querySelector('.dot');
                    el.innerHTML = val.title + (dot ? dot.outerHTML : '<span class="dot">.</span>');
                });
            }
        });
    }

    // --- Forms ---
    function initSubscription() {
        const forms = document.querySelectorAll('.subscribe-form, .newsletter-form');
        forms.forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = form.querySelector('input[type="email"]')?.value;
                if (!email) return;

                const { error } = await supabase.from('newsletter_subscriptions').insert([{ email }]);
                form.innerHTML = error ? '<p>Error subscribing.</p>' : '<div class="subscribe-success"><h3>Success!</h3></div>';
            });
        });
    }

    function initContactForm() {
        const form = document.getElementById('contact-form');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };
            const { error } = await supabase.from('contact_messages').insert([formData]);
            if (!error) form.innerHTML = '<h2>Message Sent!</h2>';
        });
    }

    // --- Single Article ---
    async function loadSingleArticle() {
        const params = new URLSearchParams(window.location.search);
        const slug = params.get('slug');
        if (!slug) return;

        console.log('FTLuma: Loading article ' + slug);
        const { data: post, error } = await supabase
            .from('articles')
            .select('*, authors(name, avatar_url, bio), categories(name)')
            .eq('slug', slug)
            .single();

        if (error || !post) {
            document.getElementById('article-title').textContent = 'Article Not Found';
            return;
        }

        document.getElementById('article-title').textContent = post.title;
        document.getElementById('article-category').textContent = post.categories?.name || 'Finance';
        document.getElementById('article-body').innerHTML = post.content;
        document.getElementById('author-name').textContent = post.authors?.name || 'FTLuma Team';
        document.getElementById('author-avatar').src = post.authors?.avatar_url || 'images/author-1.png';
        const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        document.getElementById('article-date').textContent = dateStr;
        document.getElementById('featured-image').src = post.featured_image || 'images/post-1.png';
        
        const readTimeEl = document.getElementById('read-time');
        if (readTimeEl) readTimeEl.textContent = post.read_time || '5';

        document.title = `${post.title} | FTLuma`;
        const metaDesc = document.getElementById('page-description');
        if (metaDesc) metaDesc.setAttribute('content', post.excerpt || '');
    }

    // --- Bootstrap ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
