import {db,identity,membership,clean,fail,errorResponse,originCheck,json} from '@/lib/database/chat';
import {createSupabaseAdmin,storageBucket} from '@/lib/auth/server';
import {normalizeType,allowedTypes,inlineTypes,matchesSignature,MAX_FILE_SIZE} from '@/lib/media/validation';
export const dynamic='force-dynamic';
function validId(value:string){return /^[a-zA-Z0-9-]{10,100}$/.test(value);}
export async function POST(req:Request){try{
 originCheck(req);const uid=await identity(),payload=await req.json() as Record<string,unknown>,action=clean(payload.action,20),room=clean(payload.room,250),id=clean(payload.id,100);await membership(room,uid);if(!validId(id))fail(400,'รหัสไฟล์ไม่ถูกต้อง');
 const admin=createSupabaseAdmin(),bucket=storageBucket(),path=`${uid}/${id}`;
 if(action==='authorize'){
  const old=await db().prepare('SELECT room,uploader FROM files WHERE id=?').bind(id).first<{room:string,uploader:string}>();if(old){if(old.room!==room||old.uploader!==uid)fail(409,'รหัสไฟล์ซ้ำ');return json({ok:true,complete:true,id});}
  const now=Date.now(),recent=await db().prepare('SELECT count(*) AS n FROM files WHERE uploader=? AND created>?').bind(uid,now-60000).first<{n:number}>();if(Number(recent?.n||0)>=15)fail(429,'ส่งไฟล์เร็วเกินไป กรุณารอสักครู่');
  const {data,error}=await admin.storage.from(bucket).createSignedUploadUrl(path,{upsert:true});if(error||!data)throw error||new Error('สร้างพื้นที่อัปโหลดไม่สำเร็จ');return json({ok:true,path:data.path,token:data.token,id});
 }
 if(action==='complete'){
  const name=clean(payload.name,180),declaredType=normalizeType(clean(payload.type,100),name),declaredSize=Number(payload.size);if(!allowedTypes.includes(declaredType)||!Number.isSafeInteger(declaredSize)||declaredSize<=0||declaredSize>MAX_FILE_SIZE)fail(400,'ชนิดหรือขนาดไฟล์ไม่ถูกต้อง');
  const old=await db().prepare('SELECT room,uploader FROM files WHERE id=?').bind(id).first<{room:string,uploader:string}>();if(old){if(old.room!==room||old.uploader!==uid)fail(409,'รหัสไฟล์ซ้ำ');return json({ok:true,id});}
  const {data,error}=await admin.storage.from(bucket).download(path);if(error||!data)fail(400,'ยังอัปโหลดไฟล์ไม่สมบูรณ์');if(data.size!==declaredSize||data.size>MAX_FILE_SIZE){await admin.storage.from(bucket).remove([path]);fail(400,'ขนาดไฟล์ไม่ตรงกับที่ระบุ');}
  if(!matchesSignature(declaredType,new Uint8Array(await data.slice(0,16).arrayBuffer()))){await admin.storage.from(bucket).remove([path]);fail(400,'รูปแบบไฟล์ไม่ตรงกับชนิดที่ระบุ');}
  const now=Date.now();try{await db().batch([
   db().prepare('INSERT INTO files(id,room,uploader,name,type,size,created) VALUES(?,?,?,?,?,?,?)').bind(id,room,uid,name,declaredType,declaredSize,now),
   db().prepare('INSERT INTO messages(id,room,sender,body,created) VALUES(?,?,?,?,?)').bind(crypto.randomUUID(),room,uid,(declaredType.startsWith('image/')?'🖼️ ':declaredType.startsWith('audio/')?'🎙️ ':'📎 ')+name+'\n[ไฟล์:'+id+']',now),
   db().prepare('UPDATE rooms SET updated=? WHERE id=?').bind(now,room),db().prepare('UPDATE members SET archived=0 WHERE room=?').bind(room)]);}catch(e){await admin.storage.from(bucket).remove([path]);throw e;}
  return json({ok:true,id});
 }
 fail(400,'ไม่รู้จักคำสั่ง');
 }catch(e){return errorResponse(e);}}
export async function GET(req:Request){try{
 const uid=await identity(),url=new URL(req.url),id=url.searchParams.get('id');if(!id||!validId(id))fail(400,'ไม่พบไฟล์');
 const f=await db().prepare('SELECT * FROM files WHERE id=?').bind(id).first<{id:string,room:string,uploader:string,name:string,type:string}>();if(!f)fail(404,'ไม่พบไฟล์');await membership(f.room,uid);
 const inline=url.searchParams.get('inline')==='1'&&inlineTypes.includes(f.type),admin=createSupabaseAdmin();const {data,error}=await admin.storage.from(storageBucket()).createSignedUrl(`${f.uploader}/${id}`,60,inline?{}:{download:f.name});if(error||!data)throw error||new Error('สร้างลิงก์ไฟล์ไม่สำเร็จ');
 return Response.redirect(data.signedUrl,302);
 }catch(e){return errorResponse(e);}}
