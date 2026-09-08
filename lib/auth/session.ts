import {redirect} from 'next/navigation';
import {getAuthUser} from '@/lib/auth/server';
export async function getSessionUser(){const user=await getAuthUser();return user?{displayName:String(user.user_metadata?.display_name||user.email?.split('@')[0]||'สมาชิก MC'),email:user.email||'',fullName:String(user.user_metadata?.display_name||'')||null}:null;}
export async function requireSessionUser(returnTo:string){const user=await getSessionUser();if(!user)redirect(signInPath(returnTo));return user;}
export function signInPath(returnTo='/'){return `/login?next=${encodeURIComponent(returnTo.startsWith('/')&&!returnTo.startsWith('//')?returnTo:'/')}`;}
export function signOutPath(returnTo='/'){return `/auth/signout?next=${encodeURIComponent(returnTo.startsWith('/')&&!returnTo.startsWith('//')?returnTo:'/')}`;}
