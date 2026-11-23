import ProjectMedia from './ProjectMedia'
export const defaultCertificatePreview={fit:'contain',zoom:1,x:50,y:50}
export function certificatePreview(value={}){
 const bound=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Number(v))):fallback
 return {fit:value.fit==='cover'?'cover':'contain',zoom:bound(value.zoom,.5,3,1),x:bound(value.x,0,100,50),y:bound(value.y,0,100,50)}
}
export default function CertificatePreview({media,preview,alt=''}){
 const p=certificatePreview(preview)
 return <div className="certificate-preview"><div className="certificate-image-window"><ProjectMedia media={media} alt={alt} style={{objectFit:p.fit,objectPosition:`${p.x}% ${p.y}%`,transform:`scale(${p.zoom})`,transformOrigin:`${p.x}% ${p.y}%`}}/></div></div>
}
