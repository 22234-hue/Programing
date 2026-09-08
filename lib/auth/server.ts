import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {cookies} from 'next/headers';
function config(){const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;if(!url||!key)throw new Error('Supabase public environment variables are missing');return {url,key};}
export async function createSupabaseServer(){const {url,key}=config(),store=await cookies();return createServerClient(url,key,{cookies:{getAll:()=>store.getAll(),setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options));}catch{}}}});}
export async function getAuthUser(){const supabase=await createSupabaseServer();const {data:{user}}=await supabase.auth.getUser();return user;}
export function createSupabaseAdmin(){const {url}=config(),key=process.env.SUPABASE_SERVICE_ROLE_KEY;if(!key)throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing');return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});}
export function storageBucket(){return process.env.STORAGE_BUCKET||'mc-chat';}
