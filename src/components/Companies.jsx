import {useState} from 'react'
import ProjectMedia from './ProjectMedia'
export default function Companies({items}){
 const [paused,setPaused]=useState(false)
 if(!items.length)return null
 const entries=Array.from({length:Math.max(6,items.length)},(_,i)=>({item:items[i%items.length],repeat:i>=items.length}))
 return <section className="companies" aria-labelledby="companies-title"><h2 id="companies-title">Companies I worked with</h2><div className={`company-window ${paused?'is-paused':''}`} tabIndex={0} aria-label="Companies I worked with"><div className="company-track" style={{animationDuration:`${Math.max(30,entries.length*4)}s`}}>{[0,1].map(copy=><div className="company-group" key={copy} aria-hidden={copy===1?true:undefined}>{entries.map(({item,repeat},index)=><div className="company-logo" key={index} aria-hidden={repeat?true:undefined} data-repeat={repeat}>{item.logo&&<ProjectMedia media={typeof item.logo==='string'?{url:item.logo}:item.logo} alt=""/>}<span>{item.name}</span></div>)}</div>)}</div></div><div className="showcase-controls"><button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Play company logos':'Pause company logos'}</button></div></section>
}
