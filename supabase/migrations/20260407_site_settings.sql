-- Site Settings Migration
CREATE TABLE site_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read for settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin write for settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');

-- Seed Data
INSERT INTO site_settings (key, value) VALUES
('general', '{"title": "FTLuma", "tagline": "Financial Intelligence & Market Insights", "contact_email": "hello@ftluma.com"}'),
('social', '{"twitter": "https://twitter.com/ftluma", "linkedin": "https://linkedin.com/company/ftluma", "github": "https://github.com/ftluma"}'),
('branding', '{"primary_color": "#00ffa3", "logo_url": "images/logo.png"}');
