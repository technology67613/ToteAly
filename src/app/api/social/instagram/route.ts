import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
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
    console.warn("Instagram fetch failed.", error.message);
    return NextResponse.json({ error: "Instagram feed unavailable." }, { status: 502 });
  }
}
