import AdminDialog from './AdminDialog'
import {useEffect,useRef,useState} from 'react'
import ProjectMedia from '../components/ProjectMedia'
import ProjectModal from '../components/ProjectModal'
import {readImage,readSlide,cropThumbnail} from '../lib/images'
import {moveSlide,wordCount} from '../lib/projectRules'
import {saveProject,mediaUrl} from '../lib/projectStore'
export default function ProjectEditor({initial,onDone}) {
  const [project,setProject]=useState({...initial,pills:initial.kind==='photography'?[]:initial.pills??['UI Design','UX Design']}),[busy,setBusy]=useState(false),[error,setError]=useState(''),[progress,setProgress]=useState(''),[dirty,setDirty]=useState(false),[preview,setPreview]=useState(false)
  const [crop,setCrop]=useState(null),[x,setX]=useState(50),[y,setY]=useState(50),[zoom,setZoom]=useState(1),[cropResult,setCropResult]=useState(null)
  const drag=useRef(null),slidesInput=useRef(null),thumbnailInput=useRef(null)
  const update=patch=>{setProject(p=>({...p,...patch}));setDirty(true)}
  useEffect(()=>{const guard=e=>{if(dirty){e.preventDefault();e.returnValue=''}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard)},[dirty])
  useEffect(()=>{let active=true;setCropResult(null);if(crop)cropThumbnail(crop.blob,x,y,zoom,project.kind==='photography').then(result=>{if(active)setCropResult(result)}).catch(e=>setError(e.message));return()=>{active=false}},[crop,x,y,zoom])
  async function addSlides(files) {
    if(busy)return
    setBusy(true);setError('')
    const accepted=[],errors=[]
    for(const file of Array.from(files)) {
      if(project.slides.length+accepted.length>=50){errors.push('Maximum 50 slides per project.');break}
      try{accepted.push(await readSlide(file))}catch(e){errors.push(e.message)}
    }
    update({slides:[...project.slides,...accepted]});setError(errors.join(' '));setBusy(false)
  }
  async function chooseThumbnail(source) {
    if(!source)return
    try{
      setError('')
      if(source instanceof Blob || source instanceof File) {
        setCrop(await readImage(source))
      } else if(source.blob) {
        setCrop(source)
      } else if(source.path || source.url) {
        setProgress('Loading image for thumbnail…')
        const url = await mediaUrl(source)
        const res = await fetch(url)
        const blob = await res.blob()
        setCrop(await readImage(blob))
        setProgress('')
      }
      setX(50);setY(50);setZoom(1)
    }catch(e){setError(e.message);setProgress('')}
  }
  async function save(status) {
    setBusy(true);setError('');setProgress('Saving project…')
    try{await saveProject({...project,pills:project.pills.filter(p=>typeof p==='string').map(p=>p.trim()).filter(Boolean)},status,setProgress);setDirty(false);onDone(`Project ${status==='published'?'published':status==='archived'?'archived':'saved as draft'}.`)}catch(e){setError(e.message)}finally{setBusy(false);setProgress('')}
  }
  const reorder=(from,to)=>update({slides:moveSlide(project.slides,from,to)})
  return <><div className="admin-page-heading"><div><button className="admin-back" disabled={busy} onClick={()=>{if(!dirty||window.confirm('Discard unsaved changes?'))onDone()}}>← All projects</button><h1>{initial.title?'Edit project':'New project'}</h1><p>Build your case study, one slide at a time.</p></div><button className="admin-button secondary" disabled={busy} onClick={()=>setPreview(true)}>Preview project</button></div>
    <form onSubmit={e=>{e.preventDefault();save('published')}} className="editor-layout">
      <fieldset disabled={busy} className="editor-fields"><section className="admin-panel"><label className="field-label" htmlFor="project-title">Project title</label><input id="project-title" value={project.title} maxLength={160} onChange={e=>update({title:e.target.value})} placeholder="Give your project a name"/><p className="field-help">Shown over the thumbnail on your website.</p></section>
      <section className="admin-panel"><div className="panel-heading"><div><h2>Project slides</h2><p>Images and videos appear from top to bottom in this exact order.</p></div><span className="admin-badge">{project.slides.length} / 50</span></div>
        <button type="button" className="upload-dropzone" onClick={()=>slidesInput.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();addSlides(e.dataTransfer.files)}}><span className="upload-symbol">↑</span><strong>Drop images or videos here</strong><span>or click to browse · Images: JPG, PNG, WebP · 20 MB. Videos: MP4, WebM · 40 MB.</span></button><input ref={slidesInput} type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm" multiple hidden onChange={e=>{addSlides(e.target.files);e.target.value=''}}/>
        <div className="slide-editor" aria-label="Slides in display order">{project.slides.length===0?<div className="editor-empty">Your visual story starts here.<br/>Upload the first slide to get started.</div>:project.slides.map((slide,i)=><article className="editor-slide" key={slide.id} onDragOver={e=>{if(drag.current!==null)e.preventDefault()}} onDrop={e=>{e.preventDefault();if(drag.current!==null)reorder(drag.current,i);drag.current=null}}>
          <div className="slide-toolbar"><button type="button" className="drag-handle" draggable onDragStart={e=>{drag.current=i;e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',slide.id)}} onDragEnd={()=>{drag.current=null}} aria-label={`Drag slide ${i+1} to reorder`}>⠿</button><span>Slide {i+1}<small>{slide.name}</small></span><div><button type="button" disabled={i===0} onClick={()=>reorder(i,i-1)} aria-label={`Move slide ${i+1} up`}>↑</button><button type="button" disabled={i===project.slides.length-1} onClick={()=>reorder(i,i+1)} aria-label={`Move slide ${i+1} down`}>↓</button><button type="button" onClick={()=>update({slides:project.slides.filter(s=>s.id!==slide.id)})} aria-label={`Remove slide ${i+1}`}>×</button></div></div><ProjectMedia media={slide} alt={`Slide ${i+1}: ${slide.name}`}/>
        </article>)}</div>
      </section><section className="admin-panel"><label className="field-label" htmlFor="project-description">Project description</label><p className="field-help">Appears after the final slide in the project viewer.</p><textarea id="project-description" rows={8} value={project.description} onChange={e=>update({description:e.target.value})} placeholder="Tell the story behind the project…"/><p className={wordCount(project.description)>2000?'admin-error':'word-count'}>{wordCount(project.description).toLocaleString()} / 2,000 words</p></section></fieldset>
      <aside className="editor-sidebar"><fieldset disabled={busy}><section className="admin-panel"><h2>Project thumbnail</h2><p className="field-help">{project.kind==='photography'?'Square preview (1200 × 1200 px) · 1:1':'High-resolution (1500 × 1000 px) · 3:2 aspect ratio'}</p><button type="button" className="thumbnail-picker" onClick={()=>thumbnailInput.current.click()} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();chooseThumbnail(e.dataTransfer.files[0])}}>{project.thumbnail?<ProjectMedia media={project.thumbnail} alt="Project thumbnail"/>:<span>＋ Add thumbnail<br/><small>Click or drop an image</small></span>}</button><input ref={thumbnailInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={e=>{chooseThumbnail(e.target.files[0]);e.target.value=''}}/><div style={{display:'flex',flexDirection:'column',gap:'4px',marginTop:'8px'}}>{project.thumbnail&&<button type="button" className="text-button" onClick={()=>thumbnailInput.current.click()}>Replace thumbnail</button>}{project.slides.length>0&&project.slides[0].kind!=='video'&&<button type="button" className="text-button" onClick={()=>chooseThumbnail(project.slides[0])}>Use slide 1 as base</button>}</div></section>
      {project.kind!=='photography'&&<section className="admin-panel"><h2>Project pills</h2><p className="field-help">Up to 3 custom labels. Leave a field empty to remove it.</p>{[0,1,2].map(i=><label className="field-label" key={i}>Pill {i+1}<input maxLength={32} value={project.pills[i]||''} placeholder={['UI Design','UX Design','Branding'][i]} onChange={e=>{const pills=[...project.pills];pills[i]=e.target.value;update({pills})}}/></label>)}</section>}{project.kind!=='photography'&&<section className="admin-panel"><h2>Landing page placement</h2><p className="field-help">Select a position to feature this project. Published projects also appear on the portfolio page.</p><label className="field-label" htmlFor="hero-slot">Hero showcase</label><select id="hero-slot" value={project.hero_slot||''} onChange={e=>update({hero_slot:Number(e.target.value)||null})}><option value="">Not featured</option>{[1,2,3,4,5].map(n=><option key={n} value={n}>Position {n}</option>)}</select><label className="field-label" htmlFor="stack-slot">Stacked portfolio cards</label><select id="stack-slot" value={project.stack_slot||''} onChange={e=>update({stack_slot:Number(e.target.value)||null})}><option value="">Not featured</option>{[1,2,3,4,5,6].map(n=><option key={n} value={n}>Position {n}</option>)}</select></section>}</fieldset>
      <section className="admin-panel publish-panel"><span className="admin-badge">{initial.status}</span><h2>Ready to share?</h2><p className="field-help">Publishing makes the project available on your website.</p>{error&&<p className="admin-error" role="alert">{error}</p>}{progress&&<p role="status">{progress}</p>}<button type="submit" className="admin-button" disabled={busy}>Publish project</button><button type="button" className="admin-button secondary" disabled={busy} onClick={()=>save('draft')}>Save as draft</button>{initial.status==='published'&&<p className="field-help">Saving as draft removes this project from the public site.</p>}</section></aside>
    </form>
    {crop&&<AdminDialog labelledBy="crop-title" onCancel={()=>setCrop(null)}><section className="admin-panel crop-dialog"><h2 id="crop-title">Crop your thumbnail</h2><p>{project.kind==='photography'?'Exported as a square, 1200 × 1200 pixels.':'Exported in crisp high-resolution (1500 × 1000 pixels).'}</p><div className={`crop-preview ${project.kind==='photography'?'square-crop':''}`}>{cropResult&&<ProjectMedia media={cropResult} alt="Thumbnail crop preview"/>}</div>{[['Horizontal position',x,setX,0,100,.1],['Vertical position',y,setY,0,100,.1],['Zoom',zoom,setZoom,1,3,.01]].map(([label,value,set,min,max,step])=><label key={label} className="crop-control">{label}<input type="range" min={min} max={max} step={step} value={value} onChange={e=>set(Number(e.target.value))}/></label>)}<div className="admin-actions"><button type="button" className="admin-button secondary" onClick={()=>setCrop(null)}>Cancel</button><button type="button" className="admin-button" disabled={!cropResult} onClick={()=>{update({thumbnail:cropResult});setCrop(null)}}>Use thumbnail</button></div></section></AdminDialog>}
    {preview&&<ProjectModal project={project} onClose={()=>setPreview(false)}/>}
  </>
}

