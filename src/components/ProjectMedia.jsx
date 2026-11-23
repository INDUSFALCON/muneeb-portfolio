import { useEffect, useState } from 'react'
import { mediaUrl } from '../lib/projectStore'
export default function ProjectMedia({media,alt='',...props}) {
  const [src,setSrc]=useState(''),[failed,setFailed]=useState(false)
  useEffect(()=>{
    let active=true,objectUrl
    setSrc('');setFailed(false)
    const load=()=>mediaUrl(media).then(url=>{if(active){if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=url.startsWith('blob:')?url:null;setSrc(url)}else if(url.startsWith('blob:'))URL.revokeObjectURL(url)}).catch(()=>{if(active)setFailed(true)})
    load();const timer=setInterval(load,50*60*1000)
    return()=>{active=false;clearInterval(timer);if(objectUrl)URL.revokeObjectURL(objectUrl)}
  },[media])
  if(failed)return <div className="media-error" role="status">Image unavailable</div>
  if(src&&media?.kind==='video')return <video src={src} controls playsInline preload="metadata" aria-label={alt} onError={()=>setFailed(true)} style={{width:'100%',height:'auto',display:'block'}}/>
  return src?<img {...props} src={src} alt={alt} onError={()=>setFailed(true)}/>:<div className="media-loading" aria-label="Loading image"/>
}
