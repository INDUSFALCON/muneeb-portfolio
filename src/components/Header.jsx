import {readTheme,saveTheme} from '../lib/theme'
import {previewHref} from '../lib/adminPreview'
import {useEffect,useRef,useState} from 'react'
import {profile} from '../data/portfolio'
import {mediaUrl} from '../lib/projectStore'
import ProjectMedia from './ProjectMedia'
const links=[['about','About Me'],['projects','Projects'],['experience','Experiences'],['testimonials','Testimonials'],['faq','FAQ']]
function Portrait({media,onClose}){
 const dialog=useRef(null)
 useEffect(()=>{const focus=document.activeElement,overflow=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current.showModal();return()=>{document.body.style.overflow=overflow;focus?.focus()}},[])
 return <dialog ref={dialog} className="portrait-modal" aria-label="Profile photograph" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}><button autoFocus className="modal-close" aria-label="Close profile photograph" onClick={onClose}>×</button><ProjectMedia media={media} alt={profile.name}/></dialog>
}
export default function Header({isProjectPage=false,portrait}){
 const [open,setOpen]=useState(false),[photoOpen,setPhotoOpen]=useState(false)
 const [dark,setDark]=useState(()=>{try{return readTheme(localStorage)==='dark'}catch{return false}})
 useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';try{saveTheme(localStorage,dark?'dark':'light')}catch{}},[dark])
 useEffect(()=>{
  if(!portrait)return
  let active=true
  mediaUrl(portrait).then(url=>{
   if(!active)return
   let icon=document.querySelector('link[rel~="icon"]')
   if(!icon){icon=document.createElement('link');icon.rel='icon';document.head.appendChild(icon)}
   icon.href=url
  }).catch(()=>{})
  return()=>{active=false}
 },[portrait])
 const target=id=>previewHref(`${isProjectPage?'/':''}#${id}`)
 return <header className="site-header"><div className="brand-group">{portrait&&<button className="profile-trigger" aria-label="View profile photograph" onClick={()=>setPhotoOpen(true)}><ProjectMedia media={portrait} alt=""/></button>}<a className="brand" href={target('home')}>{profile.name}</a></div>
 <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="main-navigation" onClick={()=>setOpen(!open)}>{open?'Close':'Menu'} <span aria-hidden="true">{open?'−':'+'}</span></button>
 <nav id="main-navigation" aria-label="Main navigation" className={`nav-pill ${open?'is-open':''}`} onKeyDown={e=>{if(e.key==='Escape')setOpen(false)}}>{links.map(([id,label])=><a key={id} href={target(id)} onClick={()=>setOpen(false)}>{label}</a>)}<a href={previewHref('/photography')} onClick={()=>setOpen(false)}>Photography</a></nav>
 <button type="button" className="theme-toggle" role="switch" aria-checked={dark} aria-label="Dark mode" onClick={()=>setDark(!dark)}><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2"/></svg><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z"/></svg><span className="theme-indicator"/></button>
 {photoOpen&&portrait&&<Portrait media={portrait} onClose={()=>setPhotoOpen(false)}/>}</header>
}


