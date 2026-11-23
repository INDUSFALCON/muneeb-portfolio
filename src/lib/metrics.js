import {supabase} from './projectStore'

const landingPageViewKey='muneeb-portfolio:last-landing-page-view'

function todayInPortfolioTimezone(){
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Karachi'}).format(new Date())
}

function hasRecordedLandingPageViewToday(){
  try{return localStorage.getItem(landingPageViewKey)===todayInPortfolioTimezone()}catch{return false}
}

function saveLandingPageViewForToday(){
  try{localStorage.setItem(landingPageViewKey,todayInPortfolioTimezone())}catch{}
}

function clearLandingPageViewForToday(){
  try{localStorage.removeItem(landingPageViewKey)}catch{}
}

export function canTrackLandingPageView() {
  if (!supabase || import.meta.env.DEV) return false
  return window.location.pathname === '/' && !new URLSearchParams(window.location.search).has('preview')
}

export async function recordLandingPageView() {
  if (!canTrackLandingPageView() || hasRecordedLandingPageViewToday()) return
  // Save before the request so reloads and other tabs on this device do not duplicate a daily view.
  saveLandingPageViewForToday()
  const {error} = await supabase.rpc('record_landing_page_view')
  if (error) {
    clearLandingPageViewForToday()
    throw error
  }
}

export async function getLandingPageMetrics() {
  if (!supabase) return []
  const {data,error} = await supabase.rpc('get_landing_page_metrics')
  if (error) throw error
  return data ?? []
}
