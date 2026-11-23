export const contentFields={
 achievement_intro:[['heading','Section title'],['description','Short section description']],
 achievements:[['title','Certificate title'],['description','Certificate description','textarea']],
 profile:[['name','Photo label']],
 experience:[['company','Company'],['role','Job title'],['dates','Dates'],['description','Description','textarea']],
 testimonials:[['name','Client name'],['role','Role / company'],['quote','Testimonial','textarea']],
 faqs:[['question','Question'],['answer','Answer','textarea']],
 companies:[['name','Company name']],
 skills:[['name','Skill name']],
 introduction:[['heading','Heading'],['description','Introduction','textarea']],
 process:[['title','Step name'],['text','Description','textarea']],
}
export const contentLimits={achievement_intro:1,achievements:100,profile:1,companies:20,process:4,introduction:1,skills:100,experience:100,testimonials:100,faqs:100}
export const contentTitles={achievement_intro:'Certification section heading',achievements:'Certificates & achievements',profile:'Profile picture',companies:'Companies',skills:'Skills',introduction:'Introduction',process:'How I work',experience:'Experience',testimonials:'Testimonials',faqs:'FAQs'}
export function validateContent(section,items){
 const limit=contentLimits[section]
 if(!contentFields[section]||!Array.isArray(items)||items.length>limit)throw new Error(`Use up to ${limit||0} entries in this section.`)
 if(section==='achievements'&&items.some(item=>!item.logo))throw new Error('Upload a certificate image.')
 for(const item of items)for(const [key,label,type] of contentFields[section]){
  const max=type==='textarea'?10000:250
  if(typeof item[key]!=='string'||!item[key].trim()||item[key].length>max)throw new Error(`${label} is required (maximum ${max.toLocaleString()} characters).`)
 }
}

const monthMap={jan:1,january:1,feb:2,february:2,mar:3,march:3,apr:4,april:4,may:5,jun:6,june:6,jul:7,july:7,aug:8,august:8,sep:9,sept:9,september:9,oct:10,october:10,nov:11,november:11,dec:12,december:12}
export function parseDateToken(token,isEnd=false){
 if(!token)return {year:isEnd?9999:0,month:isEnd?12:1,score:isEnd?999912:0}
 const clean=token.trim().toLowerCase()
 if(/present|current|now|ongoing|today/.test(clean))return {year:9999,month:12,score:999912}
 const yearMatch=clean.match(/\b(19\d\d|20\d\d)\b/)
 const year=yearMatch?parseInt(yearMatch[1],10):(isEnd?9999:0)
 let month=isEnd?12:1
 for(const [name,num] of Object.entries(monthMap)){
  if(new RegExp(`\\b${name}\\b`).test(clean)||clean.startsWith(name)){month=num;break}
 }
 return {year,month,score:year*100+month}
}

export function parseExperienceDates(datesStr){
 if(!datesStr||typeof datesStr!=='string')return {startScore:0,endScore:0}
 const parts=datesStr.split(/[-–—]|\bto\b/i)
 const start=parseDateToken(parts[0],false)
 const end=parts.length>1?parseDateToken(parts[1],true):start
 return {startScore:start.score,endScore:end.score}
}

export function sortExperiencesByDate(items,order='desc'){
 return [...items].sort((a,b)=>{
  const da=parseExperienceDates(a.dates),db=parseExperienceDates(b.dates)
  if(order==='desc')return db.endScore-da.endScore||db.startScore-da.startScore
  return da.startScore-db.startScore||da.endScore-db.endScore
 })
}
