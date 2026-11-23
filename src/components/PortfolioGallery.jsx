import {isAdminPreview} from '../lib/adminPreview'
import {useEffect,useRef,useState} from 'react'
import {isAdmin,supabase,reorderProjects} from '../lib/projectStore'
import {moveSlide} from '../lib/projectRules'
import ProjectMedia from './ProjectMedia'
export default function PortfolioGallery({items,onOpen,loading,error,kind='project'}){
 const [admin,setAdmin]=useState(false),[editing,setEditing]=useState(false),[ordered,setOrdered]=useState(items),[active,setActive]=useState(null),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 const hold=useRef(null),gesture=useRef(null),grid=useRef(null),suppress=useRef(0),current=useRef(ordered)
 current.current=ordered
 useEffect(()=>{if(!editing)setOrdered(items)},[items,editing])
 useEffect(()=>{if(!isAdminPreview())return;let alive=true;const check=()=>isAdmin().then(value=>{if(alive)setAdmin(value)}).catch(()=>{if(alive)setAdmin(false)});check();const subscription=supabase?.auth.onAuthStateChange(()=>setTimeout(check,0));return()=>{alive=false;subscription?.data.subscription.unsubscribe()}},[])
 useEffect(()=>{if(!admin){clearTimeout(hold.current);gesture.current=null;setEditing(false);setActive(null);setMessage('')}},[admin])
 useEffect(()=>{const guard=e=>{if(editing){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',guard);return()=>{window.removeEventListener('beforeunload',guard);clearTimeout(hold.current)}},[editing])
 function begin(event,id){
  if(!admin||busy||event.button!==0)return
  gesture.current={id,x:event.clientX,y:event.clientY,dragging:editing,pointerId:event.pointerId}
  if(editing){setActive(id);grid.current.setPointerCapture(event.pointerId);return}
  hold.current=setTimeout(()=>{setEditing(true);setActive(id);gesture.current={...gesture.current,dragging:true};suppress.current=Date.now()+600;setMessage('Rearrange mode. Drag a card, or use Move earlier/later. Save when finished.');grid.current?.setPointerCapture(event.pointerId)},1200)
 }
 function move(event){
  const g=gesture.current;if(!admin||!g)return
  if(!g.dragging){if(Math.hypot(event.clientX-g.x,event.clientY-g.y)>10){clearTimeout(hold.current);gesture.current=null}return}
  event.preventDefault()
  const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-project-id]')
  if(!target||!grid.current.contains(target)||target.dataset.projectId===g.id)return
  const from=current.current.findIndex(p=>p.id===g.id),to=current.current.findIndex(p=>p.id===target.dataset.projectId)
  setOrdered(moveSlide(current.current,from,to))
  if(event.clientY<100)window.scrollBy(0,-15)
  else if(event.clientY>window.innerHeight-100)window.scrollBy(0,15)
 }
 function end(){clearTimeout(hold.current);if(gesture.current?.dragging)suppress.current=Date.now()+400;gesture.current=null;setActive(null)}
 async function save(){if(!admin||!isAdminPreview())return;setBusy(true);setMessage('Saving order…');try{if(!await isAdmin())throw new Error('Please sign in to the admin panel again.');await reorderProjects(ordered.map(p=>p.id),kind);setEditing(false);setMessage('Project order saved.')}catch(e){setMessage(e.message)}finally{setBusy(false)}}
 return <main id="main" className={`portfolio-gallery shell ${kind==='photography'?'photography-gallery':''}`}><span className="category">Selected work</span><h1>{kind==='photography'?'Photography.':'Projects & case studies.'}</h1><p>{kind==='photography'?'A visual journey through the moments that caught my eye.':'A closer look at the work, from first idea to final design.'}</p>{admin&&<div className="portfolio-order-toolbar">{editing?<><span>Rearrange projects</span><button disabled={busy} onClick={save}>{busy?'Saving…':'Save order'}</button><button disabled={busy} onClick={()=>{setOrdered(items);setEditing(false);setMessage('Changes cancelled.')}}>Cancel</button></>:<><span>Admin preview</span><a href={kind==='photography'?'/photography':'/portfolio'}>Exit preview</a><button disabled={items.length<2} onClick={()=>{setEditing(true);setMessage('Use drag or Move earlier/later, then save.')}}>Rearrange projects</button></>}</div>}{message&&<p className="portfolio-order-message" role="status">{message}</p>}{loading&&<p role="status">Loading projects…</p>}{error&&<p role="alert">Projects could not be loaded. Please try again shortly.</p>}
 <div ref={grid} className={`public-project-grid ${editing?'is-reordering':''}`} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onLostPointerCapture={end}>{ordered.map((project,index)=><article key={project.id} data-project-id={project.id} className={`portfolio-grid-card ${active===project.id?'is-dragging':''}`}><button className="public-project-cover" aria-label={editing?`Move ${project.title}`:`View ${project.title}`} onPointerDown={e=>begin(e,project.id)} onContextMenu={e=>{if(admin)e.preventDefault()}} onDragStart={e=>e.preventDefault()} onClick={()=>{if(!editing&&Date.now()>suppress.current)onOpen(project)}}><ProjectMedia media={project.thumbnail} alt="" width="600" height="400" draggable={false}/><span>{project.title}</span></button>{editing&&<div className="portfolio-move-controls"><span>{index+1}</span><button disabled={busy||index===0} aria-label={`Move ${project.title} earlier`} onClick={()=>setOrdered(moveSlide(ordered,index,index-1))}>← Earlier</button><button disabled={busy||index===ordered.length-1} aria-label={`Move ${project.title} later`} onClick={()=>setOrdered(moveSlide(ordered,index,index+1))}>Later →</button></div>}</article>)}</div>{!loading&&!error&&!ordered.length&&<p>New projects are coming soon.</p>}</main>
}
