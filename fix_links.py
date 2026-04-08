import os
import re

def fix_links(directory):
    # Mapping of relative links to root-relative links
    replacements = {
        r'href=["\']index\.html["\']': 'href="/"',
        r'href=["\']index\.html#more["\']': 'href="/#more"',
        r'href=["\']index["\']': 'href="/"',
        r'href=["\']about\.html["\']': 'href="/about"',
        r'href=["\']about["\']': 'href="/about"',
        r'href=["\']contact\.html["\']': 'href="/contact"',
        r'href=["\']contact["\']': 'href="/contact"',
        r'href=["\']disclaimer\.html["\']': 'href="/disclaimer"',
        r'href=["\']disclaimer["\']': 'href="/disclaimer"',
        r'href=["\']articles\.html["\']': 'href="/articles"',
        r'href=["\']articles["\']': 'href="/articles"',
        r'href=["\']topics\.html["\']': 'href="/topics"',
        r'href=["\']topics["\']': 'href="/topics"',
        r'href=["\']events\.html["\']': 'href="/events"',
        r'href=["\']events["\']': 'href="/events"',
        r'href=["\']game\.html["\']': 'href="/game"',
        r'href=["\']game["\']': 'href="/game"',
        r'href=["\']authors\.html["\']': 'href="/authors"',
        r'href=["\']authors["\']': 'href="/authors"',
    }

    for root, dirs, files in os.walk(directory):
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
        if '.git' in dirs:
            dirs.remove('.git')
            
        for file in files:
            if file.endswith('.html'):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                original_content = content
                for pattern, replacement in replacements.items():
                    content = re.sub(pattern, replacement, content)
                
                if content != original_content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    print(f"Updated links in: {path}")

if __name__ == "__main__":
    fix_links('c:\\FTLuma\\FTLuma')
