import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // This is a proxy to fetch Instagram data without a direct API key
    // In a real production app, you'd use Behold.so or a RapidAPI key
    // For this demo, we use a public bridge
    const targetUrl = "https://www.instagram.com/tote_ally_iconic/";
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
    
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    
    // Simple regex to find image URLs in the HTML
    const html = data.contents;
    const imgRegex = /"display_url":"(https:\/\/[^"]+)"/g;
    const matches = [...html.matchAll(imgRegex)];
    
    const posts = matches.slice(0, 6).map(m => {
      const originalUrl = m[1].replace(/\\u0026/g, '&');
      const proxiedUrl = `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=400&h=400&fit=crop`;
      return {
        media_url: proxiedUrl,
        permalink: targetUrl
      };
    });

    if (posts.length === 0) {
        throw new Error("No posts found");
    }

    return NextResponse.json(posts);
  } catch (error: any) {
    console.warn("Instagram Fetch failed, returning fallback gallery.", error.message);
    // Return high-quality representative items as fallback
    return NextResponse.json([
        { media_url: "https://images.unsplash.com/photo-1591348113527-71b7b7caccf9?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
        { media_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
        { media_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
        { media_url: "https://images.unsplash.com/photo-1590739225287-bd31519780ca?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
        { media_url: "https://images.unsplash.com/photo-1614179662397-885f9ad6663c?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
        { media_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800", permalink: "https://instagram.com" },
    ]);
  }
}
