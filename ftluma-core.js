/**
 * FTLuma Blog - Core Stabilization Script
 * This script is non-module for maximum compatibility and reliability.
 */

(function() {
    const SUPABASE_URL = 'https://vkoozoumepnvstljmley.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZrb296b3VtZXBudnN0bGptbGV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzOTg1NDYsImV4cCI6MjA5MDk3NDU0Nn0.jexzMstXr6HU_Wa6p1HsQ2qNd5GT3f-QJqdO1SqXRsA';

    let supabase = null;

    async function init() {
        console.log('FTLuma Core: Initializing...');
        
        if (!window.supabase || !window.supabase.createClient) {
            console.error('FTLuma Core: Supabase library missing!');
            return;
        }

        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseInstance = supabase; // Shared instance
        
        // Start rendering
        renderArticles();
    }

    async function renderArticles() {
        const postGrid = document.querySelector('.layout-grid'); 
        const articlesHubGrid = document.querySelector('.articles-hub-grid');
        const target = postGrid || articlesHubGrid;
        
        if (!target) return;

        console.log('FTLuma Core: Fetching articles...');
        const { data: posts, error } = await supabase
            .from('articles')
            .select('*, categories(name), authors(name)')
            .order('created_at', { ascending: false });

        if (error) {
            target.innerHTML = `<div class="error-msg">Error: ${error.message}</div>`;
            return;
        }

        if (!posts || posts.length === 0) {
            target.innerHTML = '<div class="empty-state">No articles found. Check database status.</div>';
            return;
        }

        target.innerHTML = '';
        posts.forEach(post => {
            const dateStr = new Date(post.published_at || post.created_at).toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', year: 'numeric' 
            });
            
            const article = document.createElement('article');
            article.className = 'post-card glass-panel fade-in';
            
            article.innerHTML = `
                <div class="post-img-container">
                    <img src="${post.featured_image || 'images/post-1.png'}" alt="${post.title}" class="post-img">
                    <div class="post-badges">
                        <span class="post-badge">${post.categories?.name || 'Finance'}</span>
                    </div>
                </div>
                <div class="post-body">
                    <div class="post-meta-top">
                        <span class="meta-item"><i class="ph ph-calendar-blank"></i> ${dateStr}</span>
                        <span class="meta-item"><i class="ph ph-timer"></i> ${post.read_time || '5 min read'}</span>
                    </div>
                    <h3 class="post-title">
                        <a href="post.html?slug=${post.slug}">${post.title}</a>
                    </h3>
                    <p class="post-excerpt">${post.excerpt || 'Read full article...'}</p>
                    <div class="post-footer">
                        <div class="author-meta">
                            <img src="${post.authors?.avatar_url || 'images/author-1.png'}" alt="${post.authors?.name}" class="avatar">
                            <div class="author-info">
                                <span class="author-name">${post.authors?.name || 'FTLuma Team'}</span>
                                <span class="author-role">Contributor</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            target.appendChild(article);
        });
    }

    // Run when ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
