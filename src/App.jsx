import Certifications from './components/Certifications'
import Companies from './components/Companies'
import {previewHref} from './lib/adminPreview'
import PortfolioGallery from './components/PortfolioGallery'
import {defaultContent,loadContent} from './lib/contentStore'
import ProjectMedia from './components/ProjectMedia'
import ProjectModal from './components/ProjectModal'
import {listProjects,supabase} from './lib/projectStore'
import {recordLandingPageView} from './lib/metrics'
import './admin/admin.css'
import { useEffect, useRef, useState } from 'react'
import Header from './components/Header'
import { usePortfolioAnimation } from './hooks/usePortfolioAnimation'
import { profile, services, socialLinks } from './data/portfolio'
import LandingV2 from './components/LandingV2'
import {loadLandingVariant} from './lib/landingVariant'

function Hero({ notify, items, onOpen, companies, loading, error }) {
  const [paused,setPaused] = useState(false)
  const repeated = items.length ? Array.from({length:items.length*Math.ceil(5/items.length)},(_,i)=>({project:items[i%items.length],repeat:i>=items.length})) : []
  return <div className="hero-region">
    <div className="hero-glow glow" aria-hidden="true"><i/><b/></div>
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p data-intro className="hero-eyebrow">{profile.subtitle}</p>
        <h1 data-intro id="hero-title">{profile.headline.split('Muneeb').map((part,i)=><span key={i}>{i>0&&<span className="hero-name">Muneeb</span>}{part}</span>)}</h1>
        <div data-intro>{profile.linkedin ? <a className="button button-primary" href={profile.linkedin} target="_blank" rel="noreferrer">Follow me on LinkedIn</a> : <button className="button button-primary" onClick={()=>notify('LinkedIn profile will be added soon.')}>Follow me on LinkedIn</button>}</div>
      </div>
      {loading&&!items.length&&<div className="showcase-loading" role="status" aria-label="Loading projects"><span className="sr-only">Loading projects…</span>{[0,1,2].map(i=><div className="showcase-card showcase-skeleton" key={i} aria-hidden="true"/>)}</div>}
      {!loading&&error&&!items.length&&<p className="showcase-load-error" role="status">Projects couldn’t be loaded. Please refresh to try again.</p>}
      <div hidden={!items.length} className={`showcase-window ${paused?'is-paused':''}`} aria-label="Project showcase">
        <div className="showcase-track">
          {[0,1].map(copy=><div className="showcase-group" key={copy} aria-hidden={copy===1 ? true:undefined}>
            {repeated.map(({project,repeat},index)=><article className="showcase-card" key={`${project.id}-${index}`} aria-hidden={repeat?true:undefined} data-repeat={repeat}>
              <ProjectMedia media={project.thumbnail} alt={copy===0&&!repeat?project.title:''}/><button className="showcase-open" tabIndex={copy===1||repeat?-1:0} aria-label={`View ${project.title}`} onClick={()=>onOpen(project)}/>
              <div className="showcase-caption"><h2>{project.title}</h2><div className="flex flex-wrap gap-2">{(project.pills??['UI Design','UX Design']).map((pill,index)=><span key={index}>{pill}</span>)}</div></div>
            </article>)}
          </div>)}
        </div>
      </div>
      <div className="showcase-controls" style={items.length?undefined:{display:'none'}}><button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Play showcase':'Pause showcase'} <span aria-hidden="true">{paused?'▷':'Ⅱ'}</span></button></div>
    </section>
    <Companies items={companies}/>
  </div>
}
function Process({process}) {
  const [active,setActive]=useState(0)
  const touchStart=useRef(null)
  useEffect(()=>setActive(0),[process])
  if(!process.length)return null
  const current=Math.min(active,process.length-1)
  const selectTab=(event,i)=>{
    let next=i
    if(event.key==='ArrowRight')next=(i+1)%process.length
    else if(event.key==='ArrowLeft')next=(i+process.length-1)%process.length
    else if(event.key==='Home')next=0
    else if(event.key==='End')next=process.length-1
    else return
    event.preventDefault();setActive(next);document.getElementById(`process-tab-${next}`).focus()
  }
  return <section className="process section-pad shell" aria-labelledby="process-title">
    <h2 className="section-heading" id="process-title">How do I work</h2>
    <div id="process-panel" role="tabpanel" aria-labelledby={`process-tab-${current}`} className="process-panel" tabIndex="0" onTouchStart={e=>{touchStart.current=e.touches[0].clientX}} onTouchEnd={e=>{if(touchStart.current===null)return;const delta=touchStart.current-e.changedTouches[0].clientX;if(Math.abs(delta)>60)setActive((current+(delta>0?1:process.length-1))%process.length);touchStart.current=null}}>
      <p key={active} className="process-copy slide-enter">{process[current].text}</p>
    </div>
    <div className="process-controls"><p aria-live="polite">Step {current+1} : {process[current].title}</p><div role="tablist" aria-label="Design process steps" className="flex gap-2">{process.map((step,i)=><button type="button" role="tab" aria-selected={active===i} aria-controls="process-panel" id={`process-tab-${i}`} aria-label={`Step ${i+1}: ${step.title}`} tabIndex={active===i?0:-1} className={`step-button ${active===i?'active':''}`} onClick={()=>setActive(i)} onKeyDown={e=>selectTab(e,i)} key={step.title}>{i+1}</button>)}</div></div>
  </section>
}
function About({introduction,skills,process,achievements,achievementIntro}) {
  return <div className="about-region light-region" id="about">
    {introduction.length>0&&<section className="about section-pad shell grid gap-10 lg:grid-cols-2" aria-labelledby="about-title"><h2 className="about-heading" id="about-title">{introduction[0].heading}</h2><div className="body-copy introduction-copy"><p>{introduction[0].description}</p></div></section>}
    {skills.length>0&&<section className="skills section-pad shell" aria-labelledby="skills-title"><h2 className="section-heading" id="skills-title">Skills</h2><ul className="skill-list flex flex-wrap gap-4">{skills.map((skill,index)=><li key={skill.id||index}>{skill.name}</li>)}</ul></section>}
    <Certifications items={achievements} intro={achievementIntro}/>
    <Process process={process}/>
  </div>
}
function Projects({items,onOpen}) {
  return <section className="projects-region" id="projects" aria-labelledby="projects-title">
    <div className="project-heading wide-shell"><h2 className="section-heading" id="projects-title">Designing Ideas<br/>Into Experiences</h2><p>A selection of projects shaped through thoughtful design, problem-solving, and close collaboration.</p></div>
    <div className="project-stack shell" aria-label="Selected projects">
      {items.map((project,i)=><article className="project-card" key={project.id} data-card={i+1}><div className="project-image"><button className="public-project-cover" onClick={()=>onOpen(project)} aria-label={`View ${project.title}`}><ProjectMedia media={project.thumbnail} alt={project.title} width="600" height="400"/><span>{project.title}</span></button></div><div className="project-copy"><div className="project-pills">{(project.pills??['UI Design','UX Design']).map((pill,index)=><span className="category" key={index}>{pill}</span>)}</div><h3>{project.title}</h3><p>Explore the project, process and design details.</p><button className="project-open" onClick={()=>onOpen(project)}>View project ↗</button></div></article>)}
    </div>
    <div className="see-more"><a className="button button-primary" href={previewHref('/portfolio')}>See More</a></div>
  </section>
}
function Experience({experience}) {
  if(!experience.length)return null
  return <section className="experience section-pad shell" id="experience" aria-labelledby="experience-title"><h2 className="section-heading" id="experience-title">Experience</h2><div className="experience-list">{experience.map((item,index)=><article className="experience-card" key={item.id||index}><div><p>{item.company}</p><h3>{item.role}</h3></div><div><p>{item.description}</p><p className="experience-date">{item.dates}</p></div></article>)}</div></section>
}
function Testimonials({testimonials}) {
  const [active,setActive]=useState(0)
  useEffect(()=>{setActive(0)},[testimonials])
  if(!testimonials.length)return null
  return <section className="testimonials section-pad" id="testimonials" aria-labelledby="testimonials-title"><h2 className="section-heading text-center" id="testimonials-title">Testimonials</h2>
    <div className="testimonials-carousel" aria-roledescription="carousel" aria-label="Client testimonials"><div className="testimonial-window"><div className="testimonial-track" style={{'--testimonial-index':active}}>
      {testimonials.map((item,i)=><figure className="testimonial-card" key={i} aria-label={`${i+1} of ${testimonials.length}`}><blockquote>{item.quote}</blockquote><figcaption><div className="avatar client-avatar">{item.logo||item.image?<ProjectMedia media={item.logo||(typeof item.image==='string'?{url:item.image}:item.image)} alt={item.name} loading="lazy"/>:<span aria-hidden="true">{item.name.slice(0,1).toUpperCase()}</span>}</div><p>{item.name}</p><small>{item.role}</small></figcaption></figure>)}
    </div></div>
    {active>0&&<button className="carousel-arrow previous" aria-label="Previous testimonial" onClick={()=>setActive(i=>i-1)}><img src="/assets/47-708-imgVariant2.svg" alt=""/></button>}
    <button disabled={testimonials.length<2} className="carousel-arrow next" aria-label="Next testimonial" onClick={()=>setActive(i=>(i+1)%testimonials.length)}><img src="/assets/47-708-imgVariant3.svg" alt=""/></button></div>
    <div className="testimonial-dots flex justify-center gap-2" aria-label="Choose testimonial">{testimonials.map((_,i)=><button key={i} aria-label={`Show testimonial ${i+1}`} aria-pressed={active===i} className={active===i?'active':''} onClick={()=>setActive(i)}/>)}</div>
  </section>
}
function FAQ({faqs}) {
  if(!faqs.length)return null
  return <section className="faq section-pad shell" id="faq" aria-labelledby="faq-title"><h2 className="section-heading" id="faq-title">Frequently Asked Questions</h2><div className="faq-list">{faqs.map((item,i)=><details key={item.id||i}><summary><span>{item.question}</span><span className="faq-icon"><img src="/assets/47-783-imgSvg262476251314.svg" alt=""/></span></summary><p>{item.answer}</p>{i<faqs.length-1&&<div className="faq-divider" aria-hidden="true"/>}</details>)}</div></section>
}
function Footer({notify}) {
  const [formStatus,setFormStatus]=useState(''),[tickerPaused,setTickerPaused]=useState(false)
  return <footer className="footer-region" id="contact"><div className="footer-glow glow" aria-hidden="true"><i/><b/></div>
    <div className={`contact-marquee ${tickerPaused?'is-paused':''}`} tabIndex={0} aria-label="Design and development services"><div className="contact-track">{[0,1].map(copy=><div className="contact-group" key={copy} aria-hidden={copy===1?true:undefined}>{services.map(service=><span className="service-ticker-item" key={service}>{service}<i aria-hidden="true"/></span>)}</div>)}</div></div><div className="showcase-controls"><button type="button" aria-pressed={tickerPaused} onClick={()=>setTickerPaused(!tickerPaused)}>{tickerPaused?'Play services':'Pause services'}</button></div>
    <div className="shell footer-content"><h2 className="sr-only">Contact me</h2><div className="footer-top"><div className="contact-details"><div><p>Email</p>{profile.email?<a href={`mailto:${profile.email}`}>{profile.email}</a>:<span>Email coming soon</span>}</div><div><p>Phone Number</p>{profile.phone?<a href={`tel:${profile.phone}`}>{profile.phone}</a>:<span>To be added</span>}</div></div>
      <form onSubmit={e=>{e.preventDefault();setFormStatus('This form is a preview. Email delivery will be connected once contact details are ready.')}}><label htmlFor="contact-email">Send me your email to discuss new project</label><div className="email-field"><input id="contact-email" name="email" type="email" autoComplete="email" placeholder="Enter your mail" required/><button type="submit" className="button button-primary">Send</button></div><p role="status" className="form-status">{formStatus}</p></form>
    </div><div className="footer-divider" aria-hidden="true"/><div className="footer-bottom"><p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p><div className="social-links">{socialLinks.map(link=>link.url?<a href={link.url} key={link.name} aria-label={link.name} target="_blank" rel="noreferrer"><img src={link.icon} alt=""/></a>:<button key={link.name} aria-label={`${link.name} — coming soon`} onClick={()=>notify(`${link.name} profile will be added soon.`)}><img src={link.icon} alt=""/></button>)}</div></div></div>
  </footer>
}
function V2Header({portrait}) {
  const [open,setOpen]=useState(false)
  return <header className="v2-header"><a className="v2-identity" href="/">{portrait&&<ProjectMedia media={portrait} alt=""/>}<span>{profile.name}</span></a><button className="v2-menu-toggle" type="button" aria-expanded={open} aria-controls="v2-route-navigation" onClick={()=>setOpen(v=>!v)}>{open?'Close':'Menu'} <span aria-hidden="true">{open?'−':'+'}</span></button><nav id="v2-route-navigation" className={open?'is-open':''}>{[['about','About Me'],['projects','Projects'],['experience','Experiences'],['testimonials','Testimonials'],['faq','FAQ'],['photography','Photography']].map(([id,label])=><a key={id} href={id==='photography'?previewHref('/photography'):`/#${id}`} onClick={()=>setOpen(false)}>{label}</a>)}</nav></header>
}
export default function App() {
  const scope=useRef(null)
  useEffect(()=>{recordLandingPageView().catch(()=>{})},[])
  const [content,setContent]=useState(()=>supabase?Object.fromEntries(Object.keys(defaultContent).map(key=>[key,[]])):defaultContent)
  const [landingVariant,setLandingVariant]=useState(()=>{try{const cached=localStorage.getItem('portfolio-landing-variant');return cached==='legacy'||cached==='v2'?cached:'v2'}catch{return 'v2'}})
  useEffect(()=>{let active=true;const refresh=()=>loadContent().then(data=>{if(active)setContent(data)}).catch(()=>{});refresh();window.addEventListener('portfolio-changed',refresh);window.addEventListener('storage',refresh);window.addEventListener('focus',refresh);return()=>{active=false;window.removeEventListener('portfolio-changed',refresh);window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh)}},[])
  useEffect(()=>{let active=true;const refresh=()=>{const timeout=new Promise(resolve=>setTimeout(()=>resolve('legacy'),5000));Promise.race([loadLandingVariant(),timeout]).then(value=>{if(active)setLandingVariant(value==='v2'?'v2':'legacy')}).catch(()=>{if(active)setLandingVariant('legacy')})};refresh();window.addEventListener('portfolio-changed',refresh);window.addEventListener('storage',refresh);return()=>{active=false;window.removeEventListener('portfolio-changed',refresh);window.removeEventListener('storage',refresh)}},[])
  useEffect(()=>{if(landingVariant==='legacy'){document.documentElement.dataset.theme='light';try{localStorage.setItem('portfolio-theme-v2','light')}catch{}}else if(landingVariant==='v2'){document.documentElement.dataset.theme='dark'}},[landingVariant])
  const [notice,setNotice]=useState(''),[items,setItems]=useState([]),[selected,setSelected]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState('')
  const isPhotography=window.location.pathname.replace(/\/$/,'')==='/photography'
  const isProjectPage=['/projects','/portfolio','/photography'].includes(window.location.pathname.replace(/\/$/,''))
  useEffect(()=>{
    let active=true
    const refresh=()=>listProjects().then(data=>{if(active){setItems(data);setError('')}}).catch(e=>{if(active)setError(e.message)}).finally(()=>{if(active)setLoading(false)})
    refresh();window.addEventListener('portfolio-changed',refresh);window.addEventListener('storage',refresh);window.addEventListener('focus',refresh)
    return()=>{active=false;window.removeEventListener('portfolio-changed',refresh);window.removeEventListener('storage',refresh);window.removeEventListener('focus',refresh)}
  },[])
  const displayed=items.filter(p=>(p.kind||'project')===(isPhotography?'photography':'project'))
  const heroItems=displayed.filter(p=>p.hero_slot).sort((a,b)=>a.hero_slot-b.hero_slot)
  const stackItems=displayed.filter(p=>p.stack_slot).sort((a,b)=>a.stack_slot-b.stack_slot)
  usePortfolioAnimation(scope,stackItems.map(p=>p.id).join(','))
  return <div ref={scope} id="home" className={landingVariant==='v2'?'v2-site':''}><a className="skip-link" href="#main">Skip to content</a>{isProjectPage?(landingVariant==='v2'?<V2Header portrait={content.profile?.[0]?.logo}/>:<Header isProjectPage={isProjectPage} portrait={content.profile?.[0]?.logo}/>):landingVariant!=='v2'&&<Header isProjectPage={isProjectPage} portrait={content.profile?.[0]?.logo}/>} 
    {isProjectPage?<PortfolioGallery kind={isPhotography?'photography':'project'} items={displayed} onOpen={setSelected} loading={loading} error={error}/>:landingVariant==='v2'?<LandingV2 items={heroItems.length?heroItems:stackItems} companies={content.companies} onOpen={setSelected} portrait={content.profile?.[0]?.logo} introduction={content.introduction} skills={content.skills} achievements={content.achievements} achievementIntro={content.achievement_intro} process={content.process} experience={content.experience} testimonials={content.testimonials} faqs={content.faqs}/>:<><main id="main"><Hero loading={loading} error={error} notify={setNotice} items={heroItems} onOpen={setSelected} companies={content.companies}/><About achievements={content.achievements} achievementIntro={content.achievement_intro} introduction={content.introduction} skills={content.skills} process={content.process}/><Projects items={stackItems} onOpen={setSelected}/><div className="experience-region light-region"><Experience experience={content.experience}/><Testimonials testimonials={content.testimonials}/><FAQ faqs={content.faqs}/></div></main><Footer notify={setNotice}/></>}
    {selected&&<ProjectModal project={selected} onClose={()=>setSelected(null)}/>}
    {notice&&<div className="notice" role="status"><span>{notice}</span><button aria-label="Dismiss notification" onClick={()=>setNotice('')}>×</button></div>}
  </div>
}
