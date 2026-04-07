/**
 * FTLuma Blog - Main JavaScript File
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {

    // ── Helpers ────────────────────────────────────────────────────────────
    const html = document.documentElement;
    const isPostPage = window.location.pathname.endsWith('post.html') || window.location.pathname.endsWith('/post');

    // ── Dark / Light Mode Toggle ────────────────────────────────────────────
    // Support one or more .theme-toggle buttons on the page
    const applyTheme = (theme) => {
        html.setAttribute('data-theme', theme);
        localStorage.setItem('ftluma-theme', theme);
        // Update every icon (desktop + mobile menu)
        document.querySelectorAll('.theme-toggle i').forEach(icon => {
            icon.className = theme === 'light' ? 'ph ph-moon' : 'ph ph-sun';
        });
    };

    // Restore saved preference
    const savedTheme = localStorage.getItem('ftluma-theme');
    if (savedTheme) applyTheme(savedTheme);

    // Wire up all toggle buttons
    document.querySelectorAll('.theme-toggle').forEach(btn => {
        btn.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            applyTheme(next);
        });
    });

    // ── Mobile Menu Toggle ─────────────────────────────────────────────────
    const mobileBtn = document.querySelector('.mobile-menu-btn');
    const navLinks  = document.querySelector('.nav-links');

    if (mobileBtn && navLinks) {
        const openMenu = () => {
            navLinks.classList.add('show');
            document.body.classList.add('no-scroll');
            const icon = mobileBtn.querySelector('i');
            if (icon) { icon.classList.remove('ph-list'); icon.classList.add('ph-x'); }
        };

        const closeMenu = () => {
            navLinks.classList.remove('show');
            document.body.classList.remove('no-scroll');
            const icon = mobileBtn.querySelector('i');
            if (icon) { icon.classList.remove('ph-x'); icon.classList.add('ph-list'); }
        };

        const toggleMenu = () =>
            navLinks.classList.contains('show') ? closeMenu() : openMenu();

        // Hamburger click
        mobileBtn.addEventListener('click', e => { e.stopPropagation(); toggleMenu(); });

        // Close when any nav link is tapped
        navLinks.querySelectorAll('a').forEach(a =>
            a.addEventListener('click', () => { if (navLinks.classList.contains('show')) closeMenu(); })
        );

        // Close on Escape key
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape' && navLinks.classList.contains('show')) closeMenu();
        });

        // Close when tapping outside the panel
        document.addEventListener('click', e => {
            if (navLinks.classList.contains('show') &&
                !navLinks.contains(e.target) &&
                !mobileBtn.contains(e.target)) {
                closeMenu();
            }
        });
    }

    // Inject no-scroll style if missing
    if (!document.getElementById('no-scroll-style')) {
        const s = document.createElement('style');
        s.id = 'no-scroll-style';
        s.textContent = '.no-scroll { overflow: hidden !important; }';
        document.head.appendChild(s);
    }

    // ── Navbar Scroll Effect ───────────────────────────────────────────────
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

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
    if (typeof supabase !== 'undefined') {
        applySiteSettings();
        renderSupabaseArticles();
        initSubscription();
        initContactForm();
    } else {
        console.warn('Supabase client not detected. Database features disabled.');
    }

    // Handle Authors Page
    const authorsGrid = document.getElementById('authors-grid');
    if (authorsGrid) {
        renderSupabaseAuthors(authorsGrid);
    }
});

async function renderSupabaseAuthors(container) {
    const { data: authors, error } = await supabase
        .from('authors')
        .select('*')
        .order('name');

    if (error) {
        container.innerHTML = `<div class="error-msg">Error: ${error.message}</div>`;
        return;
    }

    if (!authors || authors.length === 0) {
        container.innerHTML = '<div class="empty-state">No authors found.</div>';
        return;
    }

    container.innerHTML = '';
    authors.forEach(author => {
        const card = document.createElement('div');
        card.className = 'author-card glass-panel fade-in';
        card.innerHTML = `
            <img src="${author.avatar_url || 'images/author-1.png'}" alt="${author.name}" class="avatar-lg">
            <span class="author-role">${author.role || 'Contributor'}</span>
            <h2>${author.name}</h2>
            <p class="author-bio">${author.bio || 'Financial expert and contributor at FTLuma.'}</p>
            <div class="author-socials">
                <a href="#" class="icon-btn"><i class="ph ph-twitter-logo"></i></a>
                <a href="#" class="icon-btn"><i class="ph ph-linkedin-logo"></i></a>
                <a href="articles.html?author=${author.id}" class="btn btn-outline">View Posts</a>
            </div>
        `;
        container.appendChild(card);
    });
}

/* ==========================================================================
   Dynamic Site Settings
   ========================================================================== */
async function applySiteSettings() {
    const { data: settings, error } = await supabase.from('site_settings').select('*');
    if (error || !settings) return;

    settings.forEach(item => {
        const val = item.value;
        if (item.key === 'general') {
            if (val.title) {
                document.querySelectorAll('.logo').forEach(el => {
                    const dot = el.querySelector('.dot');
                    el.innerHTML = val.title + (dot ? dot.outerHTML : '<span class="dot">.</span>');
                });
                document.title = (isPostPage ? '' : val.title + ' | ') + document.title.split('|').pop().trim();
            }
            if (val.tagline) {
                const heroSubtitle = document.querySelector('.hero-subtitle');
                if (heroSubtitle) heroSubtitle.textContent = val.tagline;
            }
        } else if (item.key === 'social') {
            const footerSocials = document.querySelector('.footer-brand .social-links');
            if (footerSocials) {
                const twitter = footerSocials.querySelector('[title="Twitter"]');
                const github = footerSocials.querySelector('[title="GitHub"]');
                const linkedin = footerSocials.querySelector('[title="LinkedIn"], [title="Dribbble"]'); // Dribbble was placeholder
                
                if (twitter && val.twitter) twitter.href = val.twitter;
                if (github && val.github) github.href = val.github;
                if (linkedin && val.linkedin) {
                    linkedin.href = val.linkedin;
                    linkedin.title = 'LinkedIn';
                    const icon = linkedin.querySelector('i');
                    if (icon) icon.className = 'ph ph-linkedin-logo';
                }
            }
        } else if (item.key === 'branding') {
            if (val.primary_color) {
                document.documentElement.style.setProperty('--color-primary', val.primary_color);
                // Also update glass effect hue if possible, or just the primary color
                const r = parseInt(val.primary_color.slice(1, 3), 16);
                const g = parseInt(val.primary_color.slice(3, 5), 16);
                const b = parseInt(val.primary_color.slice(5, 7), 16);
                document.documentElement.style.setProperty('--glass-bg', `rgba(${r}, ${g}, ${b}, 0.2)`);
            }
        }
    });
}

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
    console.log('DEBUG: Starting renderSupabaseArticles()');
    // alert('DEBUG: script.js is running and fetching articles...');
    const postGrid = document.querySelector('.layout-grid'); // index.html
    const articlesHubGrid = document.querySelector('.articles-hub-grid'); // articles.html
    const heroInfo = document.querySelector('.featured-info');
    const heroImg = document.querySelector('#hero-img-placeholder');
    const heroAuthorImg = document.querySelector('#author-img-1');
    const newArticleBadge = document.querySelector('.hero-content .badge');
    
    // Check if on article page
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    if (isPostPage && slug) {
        loadSingleArticle(slug);
        return;
    }

    if (!postGrid && !heroInfo && !articlesHubGrid) return;

    // Fetch articles with joins
    const authorId = urlParams.get('author');
    let query = supabase
        .from('articles')
        .select(`
            *,
            categories(name),
            authors(*)
        `)
        .order('created_at', { ascending: false }); // Order by created_at for debug

    if (authorId) {
        query = query.eq('author_id', authorId);
    }

    const { data: allPosts, error } = await query;

    if (error) {
        console.error('Error fetching articles:', error);
        const target = postGrid || articlesHubGrid;
        if (target) target.innerHTML = `<div class="error-msg" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #f87171;">
            <i class="ph ph-warning-circle" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
            <h3>Unable to load insights</h3>
            <p>${error.message}</p>
        </div>`;
        return;
    }

    // Filter for display
    const posts = (allPosts || []).filter(p => p.status === 'published');

    if (!posts || posts.length === 0) {
        const target = postGrid || articlesHubGrid;
        if (target) {
            const statusCounts = (allPosts || []).reduce((acc, p) => {
                acc[p.status] = (acc[p.status] || 0) + 1;
                return acc;
            }, {});
            const stats = Object.entries(statusCounts).map(([s, c]) => `${s}: ${c}`).join(', ');
            
            target.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="ph ph-newspaper-clipping" style="font-size: 3rem; margin-bottom: 1rem; display: block;"></i>
                <h3>No published articles found</h3>
                <p>Database check: ${allPosts.length} total posts (${stats || 'None'})</p>
                <p style="font-size: 0.8rem; margin-top: 1rem;">Note: Only articles with status 'published' appear here.</p>
            </div>`;
        }
        return;
    }

    console.log('Rendering articles:', posts.map(p => ({ title: p.title, status: p.status, featured: p.is_featured })));

    // Handle "New Article Published" Badge on Home Page
    if (newArticleBadge && posts.length > 0) {
        const latest = posts[0];
        newArticleBadge.innerHTML = `<a href="post.html?slug=${latest.slug}" style="color: inherit; text-decoration: none;"><span class="pulse-dot"></span> New: ${latest.title}</a>`;
    }

    // Handle Hero Section
    if (heroInfo) {
        const featured = posts.find(p => p.is_featured) || posts[0];
        if (featured) {
            heroInfo.querySelector('h2').textContent = featured.title;
            heroInfo.querySelector('.author span').textContent = featured.authors?.name;
            
            const dateStr = new Date(featured.published_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            heroInfo.querySelector('.date').textContent = dateStr;
            
            const readTimeEl = heroInfo.querySelector('.read-time');
            if (readTimeEl) readTimeEl.innerHTML = `<i class="ph ph-clock"></i> ${featured.read_time || '5 min read'}`;
            
            if (heroImg) heroImg.src = featured.featured_image;
            if (heroAuthorImg) heroAuthorImg.src = featured.authors?.avatar_url;
            
            // Link hero to actual article
            const heroLink = heroInfo.closest('a');
            if (heroLink) heroLink.href = `post.html?slug=${featured.slug}`;
        }
    }

    // DEBUG: Render ALL articles to see what's in the DB
    const targetGrid = postGrid || articlesHubGrid;
    const displayPosts = allPosts; // Temporarily ignore filters

    if (targetGrid && displayPosts) {
        targetGrid.innerHTML = '';
        
        displayPosts.forEach(post => {
            const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            
            const article = document.createElement('article');
            article.className = 'post-card glass-panel fade-in';
            // Add a badge if it's not published or if it's featured
            const debugBadge = post.status !== 'published' ? `<span class="post-badge" style="background: #f87171;">${post.status}</span>` : '';
            const featuredBadge = post.is_featured ? `<span class="post-badge" style="background: var(--color-primary); color: #000;">FEATURED</span>` : '';

            article.innerHTML = `
                <div class="post-img-container">
                    <img src="${post.featured_image || 'images/post-1.png'}" alt="${post.title}" class="post-img">
                    <div class="post-badges">
                        <span class="post-badge">${post.categories?.name || 'Finance'}</span>
                        ${debugBadge}
                        ${featuredBadge}
                    </div>
                    <div class="post-glimmer"></div>
                </div>
                <div class="post-body">
                    <div class="post-meta-top">
                        <span class="meta-item"><i class="ph ph-calendar-blank"></i> ${dateStr}</span>
                        <span class="meta-item"><i class="ph ph-timer"></i> ${post.read_time || '5 min read'}</span>
                    </div>
                    <h3 class="post-title">
                        <a href="post.html?slug=${post.slug}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${post.excerpt || 'No excerpt.'}</p>
                    <div class="post-footer">
                        <div class="author-meta">
                            <img src="${post.authors?.avatar_url || 'images/author-1.png'}" alt="${post.authors?.name}" class="avatar">
                            <div class="author-info">
                                <span class="author-name">${post.authors?.name || 'FTLuma Team'}</span>
                                <span class="author-role">Contributor</span>
                            </div>
                        </div>
                        <a href="post.html?slug=${post.slug}" class="post-link-btn" title="Read full insight">
                            <i class="ph ph-arrow-right"></i>
                        </a>
                    </div>
                </div>
            `;
            targetGrid.appendChild(article);
        });
    }
}

async function loadSingleArticle(slug) {
    const { data: post, error } = await supabase
        .from('articles')
        .select(`
            *,
            authors (name, avatar_url, bio),
            categories (name)
        `)
        .eq('slug', slug)
        .single();

    if (error || !post) {
        console.error('Error loading article:', error);
        document.getElementById('article-title').textContent = 'Article Not Found';
        document.getElementById('article-body').innerHTML = '<p>Sorry, the article you are looking for does not exist.</p>';
        return;
    }

    // Populate metadata
    document.title = `${post.title} | FTLuma`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    // Populate Header
    document.getElementById('article-category').textContent = post.categories?.name || 'Finance';
    document.getElementById('article-title').textContent = post.title;
    document.getElementById('author-name').textContent = post.authors?.name || 'FTLuma Team';
    document.getElementById('author-avatar').src = post.authors?.avatar_url || 'images/author-1.png';
    document.getElementById('article-date').textContent = new Date(post.published_at).toLocaleDateString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric' 
    });
    document.getElementById('read-time').textContent = post.read_time || '5';
    document.getElementById('featured-image').src = post.featured_image;

    // Populate Body
    // Assuming content is stored as HTML or plain text with newlines
    const bodyContainer = document.getElementById('article-body');
    bodyContainer.innerHTML = post.content;
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

