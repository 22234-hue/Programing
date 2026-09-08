import {createSupabaseServer} from '@/lib/auth/server';
import {NextResponse} from 'next/server';
export async function GET(req:Request){const url=new URL(req.url),next=url.searchParams.get('next')||'/';const supabase=await createSupabaseServer();await supabase.auth.signOut();return NextResponse.redirect(new URL(next.startsWith('/')&&!next.startsWith('//')?next:'/',url.origin));}
