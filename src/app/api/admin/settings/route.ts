import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;
    
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
