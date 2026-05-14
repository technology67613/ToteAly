import { NextResponse } from "next/server";

export async function GET() {
  const targetUrl = "https://www.instagram.com/tote_ally_iconic/";

  // Curated list of professional tote bag images that match the brand aesthetic
  // This avoids unreliable scraping or complex API setups
  const curatedPosts = [
    { media_url: "https://images.unsplash.com/photo-1591337676887-a217a6970c8a?auto=format&fit=crop&w=600&h=600", permalink: targetUrl },
    { media_url: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&h=600", permalink: targetUrl },
    { media_url: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=600&h=600", permalink: targetUrl },
    { media_url: "https://images.unsplash.com/photo-1605733513597-a8f8d410fe3e?auto=format&fit=crop&w=600&h=600", permalink: targetUrl },
    { media_url: "https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=600&h=600", permalink: targetUrl },
    { media_url: "https://images.unsplash.com/photo-1598532163257-ae3c6b2524b6?auto=format&fit=crop&w=600&h=600", permalink: targetUrl }
  ];

  return NextResponse.json(curatedPosts);
}
