import {supabase,localPreview,changed} from './projectStore'

const key='portfolio-landing-variant'
export async function loadLandingVariant(){
  if(!supabase){try{return localStorage.getItem(key)||'legacy'}catch{return 'legacy'}}
  const {data,error}=await supabase.from('site_settings').select('landing_variant').eq('id',true).maybeSingle()
  if(error) throw error
  return data?.landing_variant||'legacy'
}
export async function saveLandingVariant(variant){
  if(!['legacy','v2'].includes(variant)) throw new Error('Invalid landing page variant.')
  if(supabase){const {error}=await supabase.from('site_settings').upsert({id:true,landing_variant:variant,updated_at:new Date().toISOString()});if(error)throw error}
  else if(localPreview)localStorage.setItem(key,variant)
  else throw new Error('Connect Supabase first.')
  try{localStorage.setItem(key,variant)}catch{}
  changed();return variant
}
