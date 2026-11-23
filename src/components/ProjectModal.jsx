import { useEffect,useRef } from 'react'
import ProjectMedia from './ProjectMedia'
export default function ProjectModal({project,onClose}) {
  const dialog=useRef(null)
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow
    document.body.style.overflow='hidden';dialog.current.showModal()
    return()=>{document.body.style.overflow=overflow;previous?.focus()}
  },[])
  return <dialog ref={dialog} className="project-modal" aria-labelledby="modal-project-title" onCancel={onClose} onClick={e=>{if(e.target===e.currentTarget)onClose()}}>
    <div className="project-modal-content"><header><div><h2 id="modal-project-title">{project.title}</h2></div><button autoFocus className="modal-close" onClick={onClose} aria-label="Close project">×</button></header>
      <div className="project-modal-slides">{project.slides.map((slide,i)=><ProjectMedia key={slide.id || i} media={slide} alt={`${project.title} — slide ${i+1}`} width={slide.width} height={slide.height} loading={i<2?'eager':'lazy'}/>)}</div>
      {project.description&&<section className="project-description"><h3>About this project</h3><p>{project.description}</p></section>}
    </div>
  </dialog>
}
