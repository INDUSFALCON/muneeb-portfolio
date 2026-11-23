export const wordCount = text => (text.trim().match(/\S+/gu) || []).length
export function validateProject(project, publishing = false) {
  if (project.stack_slot!=null&&(!Number.isInteger(project.stack_slot)||project.stack_slot<1||project.stack_slot>6)) throw new Error('Choose stacked position 1–6.')
  if (project.kind==='photography'&&(project.hero_slot||project.stack_slot)) throw new Error('Photography belongs on its dedicated page.')
  if ((project.pills||[]).length>3 || (project.pills||[]).some(p=>typeof p!=='string'||!p.trim()||p.length>32)) throw new Error('Use up to 3 pills, each containing 1–32 characters.')
  if (!project.title.trim()) throw new Error('Add a project title.')
  if (project.title.length > 160) throw new Error('Keep the title within 160 characters.')
  if (wordCount(project.description) > 2000) throw new Error('Keep the description within 2,000 words.')
  if (publishing && (!project.thumbnail || !project.slides.length)) throw new Error('Add a thumbnail and at least one slide before publishing.')
}
export function moveSlide(slides, from, to) {
  if (from < 0 || to < 0 || from >= slides.length || to >= slides.length) return slides
  const next = [...slides]
  next.splice(to, 0, next.splice(from, 1)[0])
  return next
}
