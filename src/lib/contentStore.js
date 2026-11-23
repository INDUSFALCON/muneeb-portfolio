import {supabase,localPreview,changed} from './projectStore'
import {experience,testimonials,faqs,companies,skills,process,lorem} from '../data/portfolio'
import {validateContent} from './contentRules'
export {contentFields,contentLimits,contentTitles,validateContent,sortExperiencesByDate,parseExperienceDates} from './contentRules'
export const defaultContent={achievements:[],achievement_intro:[{heading:'Certifications & Achievements',description:'Learning, growing, and building new skills.'}],profile:[],experience,testimonials,faqs,companies,skills:skills.map(name=>({name})),process,introduction:[{heading:'Help people get their product professionally',description:`${lorem}\n\n${lorem}`} ]}
export async function loadContent(){
 if(!supabase)return localPreview?{...defaultContent,...JSON.parse(localStorage.getItem('portfolio-content')||'{}')}:defaultContent
 const {data,error}=await supabase.from('site_content').select('section,items')
 if(error)throw new Error('Website content could not be loaded. Check your connection and Supabase content migration.')
 return {...defaultContent,...Object.fromEntries(data.map(row=>[row.section,row.items]))}
}
const asDataUrl=blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob)})
export async function saveContent(section,items){
 validateContent(section,items)
 const uploaded=[],saved=[]
 const hasMedia=['companies','testimonials','profile','achievements'].includes(section)
 const previous=hasMedia?await loadContent():null
 try{
  for(const item of items){
   const next={...item}
   if(hasMedia&&item.logo?.blob){
    if(supabase){
     const path=`${section}/${crypto.randomUUID()}.webp`
     const {error}=await supabase.storage.from('site-media').upload(path,item.logo.blob,{contentType:'image/webp',upsert:false})
     if(error)throw error
     uploaded.push(path);next.logo={path,bucket:'site-media',width:item.logo.width,height:item.logo.height}
    }else next.logo={url:await asDataUrl(item.logo.blob),width:item.logo.width,height:item.logo.height}
   }
   saved.push(next)
  }
  if(supabase){const {error}=await supabase.from('site_content').upsert({section,items:saved,updated_at:new Date().toISOString()});if(error)throw error}
  else if(localPreview){const current=JSON.parse(localStorage.getItem('portfolio-content')||'{}');localStorage.setItem('portfolio-content',JSON.stringify({...current,[section]:saved}))}
  else throw new Error('Connect Supabase first.')
 }catch(error){if(supabase&&uploaded.length)await supabase.storage.from('site-media').remove(uploaded);throw error}
 if(supabase&&previous){const unused=previous[section].map(item=>item.logo?.path).filter(path=>path&&!saved.some(item=>item.logo?.path===path));if(unused.length)await supabase.storage.from('site-media').remove(unused)}
 changed();return saved
}
