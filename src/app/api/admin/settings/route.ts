import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

const DEFAULT_SETTINGS = {
  id: "global_settings",
  site_name: "ToteAly Iconic",
  maintenance_mode: false,
  logo_url: null,
  contact_email: "hello@totallyiconic.in",
  updated_at: new Date(0).toISOString(),
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        key
          ? { key, value: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] }
          : DEFAULT_SETTINGS
      );
    }
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('id', 'global_settings')
      .single();
      
    if (error) throw error;
    
    if (key) {
      // If a specific key is requested, return just that value
      // This mimics the legacy behavior for the new schema
      return NextResponse.json({ 
        key, 
        value: data[key as keyof typeof data] 
      });
    }
    
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Settings GET error:", error);
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    return NextResponse.json(
      key
        ? { key, value: DEFAULT_SETTINGS[key as keyof typeof DEFAULT_SETTINGS] }
        : DEFAULT_SETTINGS
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: "Settings storage is not configured." },
        { status: 503 }
      );
    }
    
    // If it's the legacy key/value pair format
    if (key && value !== undefined) {
      const { data, error } = await supabase
        .from('settings')
        .update({ [key]: value, updated_at: new Date().toISOString() })
        .eq('id', 'global_settings')
        .select()
        .single();
        
      if (error) throw error;
      return NextResponse.json(data);
    }
    
    // Otherwise assume it's a full settings object update
    const { data, error } = await supabase
      .from('settings')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', 'global_settings')
      .select()
      .single();
      
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Settings POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
