import {useEffect,useMemo,useState} from 'react'
import {getLandingPageMetrics} from '../lib/metrics'

const formatNumber=value=>new Intl.NumberFormat().format(value || 0)
const formatDate=value=>new Intl.DateTimeFormat('en',{month:'short',day:'numeric',year:'numeric',timeZone:'UTC'}).format(new Date(`${value}T00:00:00Z`))

export default function MetricsDashboard(){
 const [metrics,setMetrics]=useState([]),[loading,setLoading]=useState(true),[error,setError]=useState('')
 const refresh=()=>{setLoading(true);setError('');getLandingPageMetrics().then(setMetrics).catch(e=>setError(e.message)).finally(()=>setLoading(false))}
 useEffect(()=>{refresh()},[])
 const summary=useMemo(()=>{
  const total=metrics[0]?.total_page_views || 0
  const today=metrics.find(item=>item.view_date===new Date().toISOString().slice(0,10))?.page_views || 0
  const highest=Math.max(0,...metrics.map(item=>item.page_views))
  return {total,today,highest}
 },[metrics])
 return <section className="metrics-dashboard"><div className="admin-page-heading"><div><span className="admin-eyebrow">AUDIENCE INSIGHTS</span><h1>Traffic metrics</h1><p>Landing-page views, recorded daily. Local development visits are excluded.</p></div><button className="admin-button secondary" onClick={refresh} disabled={loading}>{loading?'Refreshing…':'Refresh'}</button></div>{error&&<p className="admin-error" role="alert">{error}</p>}<div className="admin-stats metrics-summary"><div><span>All-time page views</span><strong>{formatNumber(summary.total)}</strong></div><div><span>Views today</span><strong>{formatNumber(summary.today)}</strong></div><div><span>Best day</span><strong>{formatNumber(summary.highest)}</strong></div></div>{loading?<p>Loading traffic metrics…</p>:metrics.length?<section className="metrics-panel"><div className="metrics-panel-heading"><h2>Daily traffic</h2><span>{metrics.length} active {metrics.length===1?'day':'days'}</span></div><div className="metrics-list">{metrics.map(item=><div className="metrics-row" key={item.view_date}><time dateTime={item.view_date}>{formatDate(item.view_date)}</time><div className="metrics-bar" aria-label={`${item.page_views} page views`}><i style={{width:`${Math.max(4,item.page_views/summary.highest*100)}%`}}/></div><strong>{formatNumber(item.page_views)}</strong></div>)}</div></section>:<div className="admin-empty"><span>◌</span><h2>No tracked visits yet.</h2><p>Views will appear here after the landing page receives its first production visit.</p></div>}</section>
}
