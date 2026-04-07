-- FTLuma Initial Schema Setup

-- 1. Create Tables
------------------

-- Authors Table
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'Contributor',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Articles Table
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_id UUID REFERENCES authors(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    status TEXT CHECK (status IN ('draft', 'published', 'private')) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Newsletter Subscriptions
CREATE TABLE newsletter_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Messages
CREATE TABLE contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Comments
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
------------------------------------
ALTER TABLE authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies
------------------------

-- Authors: Public read, Admin write
CREATE POLICY "Public read for authors" ON authors FOR SELECT USING (true);
CREATE POLICY "Admin full access for authors" ON authors FOR ALL USING (auth.role() = 'authenticated');

-- Categories: Public read, Admin write
CREATE POLICY "Public read for categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Admin full access for categories" ON categories FOR ALL USING (auth.role() = 'authenticated');

-- Articles: Public read (if published), Admin write
CREATE POLICY "Public read for published articles" ON articles FOR SELECT USING (status = 'published');
CREATE POLICY "Admin full access for articles" ON articles FOR ALL USING (auth.role() = 'authenticated');

-- Subscriptions: Public insert, Admin read
CREATE POLICY "Public insert for newsletter" ON newsletter_subscriptions FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access for newsletter" ON newsletter_subscriptions FOR ALL USING (auth.role() = 'authenticated');

-- Contact Messages: Public insert, Admin read
CREATE POLICY "Public insert for contact" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access for contact" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');

-- Comments: Public read and insert
CREATE POLICY "Public read/insert for comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Public insert for comments" ON comments FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full access for comments" ON comments FOR ALL USING (auth.role() = 'authenticated');

-- 4. Initial Seed Data
----------------------
INSERT INTO authors (name, avatar_url, bio, role) VALUES
('Sarah Jenkins', 'images/author-1.png', 'Senior Financial Analyst with 15 years experience in market trends.', 'Chief Editor'),
('David Chen', 'images/author-2.png', 'Blockchain architect and crypto economics expert.', 'Tech Lead'),
('Maya Patel', 'images/author-3.png', 'Specialist in sustainable investing and personal wealth management.', 'Analyst');

INSERT INTO categories (name, slug) VALUES
('Markets', 'markets'),
('Wealth', 'wealth'),
('Crypto', 'crypto'),
('Insights', 'insights');
