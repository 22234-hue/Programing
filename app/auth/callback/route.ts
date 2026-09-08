import {createSupabaseServer} from '@/lib/auth/server';
import {NextResponse} from 'next/server';
export async function GET(req:Request){const url=new URL(req.url),code=url.searchParams.get('code'),next=url.searchParams.get('next')||'/';if(code){const supabase=await createSupabaseServer();const {error}=await supabase.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL(next.startsWith('/')&&!next.startsWith('//')?next:'/',url.origin));}return NextResponse.redirect(new URL('/login?error=callback',url.origin));}
