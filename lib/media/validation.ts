export const MAX_FILE_SIZE=10*1024*1024;
export function normalizeType(type:string,name=''){
 const mime=type.toLowerCase().split(';')[0].trim();
 const aliases:Record<string,string>={'audio/x-m4a':'audio/mp4','audio/m4a':'audio/mp4','audio/x-wav':'audio/wav','audio/wave':'audio/wav','audio/mp3':'audio/mpeg'};
 if(aliases[mime])return aliases[mime];
 if(mime)return mime;
 const extensions:Record<string,string>={m4a:'audio/mp4',mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',webm:'audio/webm',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp',gif:'image/gif',pdf:'application/pdf',txt:'text/plain',zip:'application/zip'};
 return extensions[name.split('.').pop()?.toLowerCase()||'']||'';
}
export const allowedTypes=['image/jpeg','image/png','image/webp','image/gif','audio/webm','audio/ogg','audio/mp4','audio/mpeg','audio/wav','application/pdf','text/plain','application/zip'];
export const inlineTypes=allowedTypes.filter(t=>t.startsWith('image/')||t.startsWith('audio/'));
export function matchesSignature(type:string,bytes:Uint8Array){
 const ascii=(offset:number,length:number)=>String.fromCharCode(...bytes.slice(offset,offset+length));
 const prefix=(xs:number[])=>xs.every((n,i)=>bytes[i]===n);
 switch(type){
 case 'image/png':return prefix([137,80,78,71,13,10,26,10]);
 case 'image/jpeg':return prefix([255,216,255]);
 case 'image/gif':return ['GIF87a','GIF89a'].includes(ascii(0,6));
 case 'image/webp':return ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP';
 case 'audio/wav':return ascii(0,4)==='RIFF'&&ascii(8,4)==='WAVE';
 case 'audio/ogg':return ascii(0,4)==='OggS';
 case 'audio/webm':return prefix([26,69,223,163]);
 case 'audio/mp4':return ascii(4,4)==='ftyp';
 case 'audio/mpeg':return ascii(0,3)==='ID3'||(bytes[0]===255&&(bytes[1]&224)===224);
 default:return true;
 }
}
// One byte range, including suffix ranges, with explicit bounds for native audio seeking.
export function parseRange(value:string,size:number):{offset:number,length:number}|null{
 const match=/^bytes=(\d*)-(\d*)$/.exec(value);if(!match||(!match[1]&&!match[2])||size<=0)return null;
 const start=match[1]?Number(match[1]):Math.max(0,size-Number(match[2]));
 const end=match[1]&&match[2]?Math.min(Number(match[2]),size-1):size-1;
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=size||end<start||(!match[1]&&Number(match[2])===0))return null;
 return {offset:start,length:end-start+1};
}
