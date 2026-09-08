'use client';
import {useState} from 'react';
import {Download,FileText,Mic,RefreshCw} from 'lucide-react';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
export default function MessageMedia({id,name,type='',size}:{id:string,name:string,type?:string,size?:number}){
 const [open,setOpen]=useState(false),[failed,setFailed]=useState(false),[retry,setRetry]=useState(0);
 const download='/api/files?id='+encodeURIComponent(id),inline=download+'&inline=1'+(retry?'&retry='+retry:'');
 const isImage=type.startsWith('image/'),isAudio=type.startsWith('audio/');
 if(!isImage&&!isAudio)return <a className="message-file" href={download}><FileText/><span>{name}<small>{size?`${(size/1024).toFixed(0)} KB · `:''}ดาวน์โหลด</small></span><Download size={18}/></a>;
 return <div className={'message-media '+(isImage?'image-message':'audio-message')}>
 {failed?<div className="media-load-error"><span>โหลด{isImage?'รูป':'เสียง'}ไม่สำเร็จ</span><button type="button" onClick={()=>{setFailed(false);setRetry(n=>n+1);}}><RefreshCw size={14}/>ลองอีกครั้ง</button></div>:isImage?<button type="button" className="image-open" aria-label={'ดูรูป '+name} onClick={()=>setOpen(true)}><img src={inline} alt={name} loading="lazy" onError={()=>setFailed(true)}/></button>:<><div className="audio-message-title"><Mic size={16}/><span>ข้อความเสียง</span></div><audio key={inline} controls preload="none" src={inline} onError={()=>setFailed(true)}/></>}
 <a className="media-download" href={download}><span>{isImage?name:'ดาวน์โหลดเสียง'}</span><Download size={15}/></a>
 {isImage&&<Dialog open={open} onOpenChange={setOpen}><DialogContent className="image-lightbox"><DialogHeader><DialogTitle>{name}</DialogTitle><DialogDescription>รูปภาพที่แชร์ในบทสนทนานี้</DialogDescription></DialogHeader><img src={inline} alt={name}/><a href={download} className="secondary"><Download size={16}/>ดาวน์โหลดรูปภาพ</a></DialogContent></Dialog>}
 </div>;
}
