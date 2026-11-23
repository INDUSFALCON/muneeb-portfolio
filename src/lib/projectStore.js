import { createClient } from '@supabase/supabase-js'
import { validateProject } from './projectRules'
const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
export const supabase = url && key ? createClient(url, key) : null
export const localPreview = !supabase && import.meta.env.DEV
const bucket = 'project-media'
const openDB = () => new Promise((resolve,reject) => {
  const request = indexedDB.open('portfolio-editor-preview',1)
  request.onupgradeneeded = () => request.result.createObjectStore('projects',{keyPath:'id'})
  request.onsuccess = () => resolve(request.result)
  request.onerror = () => reject(request.error)
})
async function localRequest(action, value) {
  const db = await openDB()
  return new Promise((resolve,reject) => {
    const transaction = db.transaction('projects', action === 'getAll' ? 'readonly' : 'readwrite')
    const request = transaction.objectStore('projects')[action](value)
    transaction.oncomplete = () => {db.close();resolve(request.result)}
    transaction.onerror = () => {db.close();reject(transaction.error)}
  })
}
export function changed() {
  window.dispatchEvent(new Event('portfolio-changed'))
  localStorage.setItem('portfolio-updated', String(Date.now()))
}
export async function isAdmin() {
  if (!supabase) return false
  const {data,error} = await supabase.rpc('is_portfolio_admin')
  if (error) throw error
  return data === true
}
export async function listProjects(admin = false) {
  if (supabase) {
    let query = supabase.from('projects').select('*').order('updated_at',{ascending:false})
    if (!admin) query = query.eq('status','published')
    const {data,error} = await query
    if (error) throw error
    return data.map(p => ({...p,thumbnail:p.thumbnail_path ? {path:p.thumbnail_path,width:1500,height:1000} : null})).sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647)||b.updated_at.localeCompare(a.updated_at)||a.id.localeCompare(b.id))
  }
  if (!localPreview) return []
  const all = await localRequest('getAll')
  return all.filter(p=>admin || p.status==='published').sort((a,b)=>(a.sort_order??2147483647)-(b.sort_order??2147483647)||b.updated_at.localeCompare(a.updated_at)||a.id.localeCompare(b.id))
}
export async function mediaUrl(media) {
  if (!media) return ''
  if (media.blob) return URL.createObjectURL(media.blob)
  if (media.url) return media.url
  const {data,error} = await supabase.storage.from(media.bucket==='site-media'?'site-media':bucket).createSignedUrl(media.path,3600)
  if (error) throw error
  return data.signedUrl
}
const paths = p => [p?.thumbnail?.path || p?.thumbnail_path,...(p?.slides || []).map(s=>s.path)].filter(Boolean)
export async function saveProject(project, status, progress = () => {}) {
  validateProject(project,status==='published')
  const all = await listProjects(true)
  if (status==='published') for (const slot of ['hero_slot','stack_slot']) {
    if (project[slot] && all.some(p=>p.id!==project.id && p.status==='published' && p[slot]===project[slot])) throw new Error(`${slot==='hero_slot'?'Hero':'Stack'} position ${project[slot]} is already used. Choose another position or clear it on the other project.`)
  }
  const saved = {...project,status,updated_at:new Date().toISOString()}
  if (!supabase) {
    if (!localPreview) throw new Error('Connect Supabase to save projects.')
    await localRequest('put',saved);changed();return saved
  }
  const uploaded=[]
  let completed=0
  const total=[project.thumbnail,...project.slides].filter(m=>m?.blob).length
  async function upload(media) {
    if (!media) return null
    if (!media.blob) return media
    const extension = media.blob.type==='video/mp4'?'mp4':media.blob.type==='video/webm'?'webm':media.blob.type==='image/png'?'png':media.blob.type==='image/jpeg'?'jpg':'webp'
    const path=`${project.id}/${crypto.randomUUID()}.${extension}`
    const {error}=await supabase.storage.from(bucket).upload(path,media.blob,{contentType:media.blob.type,upsert:false})
    if(error)throw error
    uploaded.push(path);progress(`Uploading media ${++completed} / ${total}`)
    const {blob,...rest}=media
    return {...rest,path}
  }
  try {
    saved.thumbnail=await upload(project.thumbnail)
    saved.slides=[]
    for(const slide of project.slides)saved.slides.push(await upload(slide))
    const {thumbnail,sort_order,...row}=saved
    row.thumbnail_path=thumbnail?.path || null
    const {error}=await supabase.from('projects').upsert(row)
    if(error)throw error
  } catch(error) {
    if(uploaded.length)await supabase.storage.from(bucket).remove(uploaded)
    throw error
  }
  const old=all.find(p=>p.id===saved.id)
  const unused=paths(old).filter(path=>!paths(saved).includes(path))
  if(unused.length)await supabase.storage.from(bucket).remove(unused)
  changed();return saved
}
export async function deleteProject(project) {
  if (supabase) {
    const {error}=await supabase.from('projects').delete().eq('id',project.id)
    if(error)throw error
    const files=paths(project)
    if(files.length) {
      const {error:cleanupError}=await supabase.storage.from(bucket).remove(files)
      if(cleanupError) {changed();throw new Error('Project deleted, but image cleanup failed. Remove its folder in Supabase Storage.')}
    }
  } else if(localPreview)await localRequest('delete',project.id)
  else throw new Error('Connect Supabase first.')
  changed()
}

export async function reorderProjects(ids,kind='project'){
 if(supabase){const {error}=await supabase.rpc('reorder_portfolio',{project_ids:ids,project_kind:kind});if(error)throw new Error(error.code==='PGRST202'?'Run the content/order migration in Supabase before saving project order.':error.message)}
 else if(localPreview){const all=await listProjects(true);for(let i=0;i<ids.length;i++){const project=all.find(p=>p.id===ids[i]);if(project)await localRequest('put',{...project,sort_order:i+1})}}
 else throw new Error('Admin access required.')
 changed()
}
