import {useEffect,useRef,useState} from 'react'
import CertificatePreview from './CertificatePreview'
export default function Certifications({items=[],intro=[]}){
 const [active,setActive]=useState(0),touch=useRef(null)
 useEffect(()=>setActive(0),[items])
 if(!items.length)return null
 const index=Math.min(active,items.length-1),item=items[index]
 const move=delta=>setActive((index+delta+items.length)%items.length)
 return <section className="certifications section-pad shell" aria-labelledby="certifications-title">
 <header className="certifications-heading"><h2 className="section-heading" id="certifications-title">{intro[0]?.heading||'Certifications & Achievements'}</h2>{intro[0]?.description&&<p>{intro[0].description}</p>}</header>
 <div className="certificate-carousel" aria-roledescription="carousel" aria-label="Certificates and achievements" onTouchStart={e=>{touch.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touch.current!==null){const delta=touch.current-e.changedTouches[0].clientX;if(Math.abs(delta)>60)move(delta>0?1:-1)}touch.current=null}}>
 <div className="certificate-slide" key={item.id||index} role="group" aria-roledescription="slide" aria-label={`${index+1} of ${items.length}`}><div className="certificate-description"><h3>{item.title}</h3><p className="body-copy">{item.description}</p></div><CertificatePreview media={item.logo} preview={item.preview} alt={item.title}/></div>
 {items.length>1&&<div className="certificate-controls"><button type="button" aria-label="Previous certificate" onClick={()=>move(-1)}>←</button><span role="status" aria-live="polite">{index+1} / {items.length}</span><button type="button" aria-label="Next certificate" onClick={()=>move(1)}>→</button></div>}
 </div></section>
}
