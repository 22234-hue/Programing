import postgres, {type Sql} from 'postgres';
import {getAuthUser} from '@/lib/auth/server';
let client:Sql|undefined;
function sql(){if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL is missing');return client??=postgres(process.env.DATABASE_URL,{prepare:false,max:1,idle_timeout:20,connect_timeout:15});}
function numbered(query:string){let i=0;return query.replace(/\?/g,()=>`$${++i}`);}
type Prepared={query:string;args:unknown[];bind:(...args:unknown[])=>Prepared;first:<T=Record<string,unknown>>()=>Promise<T|null>;all:<T=Record<string,unknown>>()=>Promise<{results:T[]}>;run:()=>Promise<{success:boolean}>};
type Executor={unsafe:Sql['unsafe']};
function prepared(query:string,executor:Executor=sql()):Prepared{const state={query,args:[]} as unknown as Prepared;state.bind=(...args)=>{state.args=args;return state;};state.first=async<T>()=>(await executor.unsafe(numbered(query),state.args as never[]))[0] as T??null;state.all=async<T>()=>({results:[...(await executor.unsafe(numbered(query),state.args as never[]))] as T[]});state.run=async()=>{await executor.unsafe(numbered(query),state.args as never[]);return {success:true};};return state;}
export const db=()=>({prepare:(query:string)=>prepared(query),batch:async(items:Prepared[])=>sql().begin(async tx=>{for(const item of items)await prepared(item.query,tx as unknown as Executor).bind(...item.args).run();return items.map(()=>({success:true}));})});
export class ApiError extends Error{constructor(public status:number,message:string){super(message);}}
export function fail(status:number,message:string):never{throw new ApiError(status,message);}
export function clean(value:unknown,max=2000){if(typeof value!=='string'||value.length>max)fail(400,'ข้อมูลไม่ถูกต้องหรือยาวเกินกำหนด');return value.trim();}
export function originCheck(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)fail(403,'คำขอไม่ถูกต้อง');}
export async function identity(){const user=await getAuthUser();if(!user)fail(401,'กรุณาเข้าสู่ระบบ');return user.id;}
export async function membership(room:string,user:string){if(!await db().prepare('SELECT 1 FROM members WHERE room=? AND member_id=?').bind(room,user).first())fail(403,'คุณไม่มีสิทธิ์เข้าถึงห้องนี้');}
export function errorResponse(e:unknown){if(e instanceof ApiError)return Response.json({error:e.message},{status:e.status});console.error('MC Chat operation failed',e);return Response.json({error:'เชื่อมต่อไม่สำเร็จ ข้อมูลที่พิมพ์ยังอยู่ กรุณาลองอีกครั้ง'},{status:503});}
export function json(data:unknown){return Response.json(data,{headers:{'Cache-Control':'no-store'}});}
