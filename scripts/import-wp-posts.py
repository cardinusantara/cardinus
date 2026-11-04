import os
import json
import ssl
import html
import re
import urllib.request

out_dir = r"C:\Users\User\Documents\Dim area\cardi revamp\cardinus main\src\content\blog"
os.makedirs(out_dir, exist_ok=True)

url = "https://cardinusantara.com/wp-json/wp/v2/posts?per_page=100&_embed=true"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print("Fetching posts from cardinusantara.com WordPress REST API...")
with urllib.request.urlopen(req, context=ctx, timeout=20) as resp:
    posts = json.loads(resp.read().decode("utf-8"))

print(f"Retrieved {len(posts)} posts from WordPress. Writing markdown files...")

def clean_excerpt(text):
    if not text:
        return ""
    # Remove HTML tags
    clean = re.sub(r"<[^>]+>", "", text)
    clean = html.unescape(clean)
    clean = clean.replace("\n", " ").strip()
    return clean[:200]

def sanitize_title(title):
    t = html.unescape(title)
    # Escape double quotes for YAML frontmatter
    return t.replace('"', '\\"')

for p in posts:
    slug = p.get("slug")
    raw_title = p.get("title", {}).get("rendered", "Artikel")
    title = sanitize_title(raw_title)
    date = p.get("date", "2026-01-01T00:00:00")
    raw_excerpt = p.get("excerpt", {}).get("rendered", "")
    description = clean_excerpt(raw_excerpt)
    if not description:
        description = clean_excerpt(p.get("content", {}).get("rendered", ""))
    description = description.replace('"', '\\"')
    
    # Featured media
    featured_media = p.get("_embedded", {}).get("wp:featuredmedia", [])
    cover_url = ""
    if featured_media and len(featured_media) > 0:
        cover_url = featured_media[0].get("source_url", "")
        
    content_html = p.get("content", {}).get("rendered", "")
    
    # Frontmatter
    md_content = f"""---
title: "{title}"
description: "{description}"
pubDate: {date}
author: "Cardi Nusantara"
cover: "{cover_url}"
---

{content_html}
"""
    file_path = os.path.join(out_dir, f"{slug}.md")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(md_content)
    print(f"Saved: {slug}.md")

print(f"Successfully imported all {len(posts)} articles into src/content/blog!")

