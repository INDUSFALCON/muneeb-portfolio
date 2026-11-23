export async function readImage(file) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) throw new Error(`${file.name}: use JPG, PNG or WebP.`)
  if (file.size > 20 * 1024 * 1024) throw new Error(`${file.name}: maximum size is 20 MB.`)
  const url = URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    return { id: crypto.randomUUID(), name: file.name, blob: file, width: image.naturalWidth, height: image.naturalHeight }
  } catch { throw new Error(`${file.name}: this image could not be read.`) }
  finally { URL.revokeObjectURL(url) }
}
export async function cropThumbnail(file, x = 50, y = 50, zoom = 1, square = false) {
  const isString = typeof file === 'string'
  const url = isString ? file : URL.createObjectURL(file)
  try {
    const image = new Image()
    image.src = url
    await image.decode()
    const TARGET_W = square ? 1200 : 1500, TARGET_H = square ? 1200 : 1000
    const canvas = document.createElement('canvas')
    canvas.width = TARGET_W
    canvas.height = TARGET_H
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'
    const scale = Math.max(TARGET_W / image.width, TARGET_H / image.height) * zoom
    const w = TARGET_W / scale, h = TARGET_H / scale
    ctx.drawImage(image, (image.width - w) * x / 100, (image.height - h) * y / 100, w, h, 0, 0, TARGET_W, TARGET_H)
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', .92))
    if (!blob) throw new Error('Could not create thumbnail.')
    return { id: crypto.randomUUID(), name: 'thumbnail.webp', blob, width: TARGET_W, height: TARGET_H }
  } finally {
    if (!isString) URL.revokeObjectURL(url)
  }
}

export async function prepareLogo(file, maxDimension = 800) {
  if(file.size>5*1024*1024)throw new Error('Photos and logos must be 5 MB or smaller.')
  const media=await readImage(file),url=URL.createObjectURL(file)
  try{
    const image=new Image();image.src=url;await image.decode()
    const scale=Math.min(1,maxDimension/Math.max(image.width,image.height))
    const canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale))
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height)
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/webp',.94))
    if(!blob)throw new Error('Could not prepare the logo.')
    return {...media,blob,width:canvas.width,height:canvas.height}
  }finally{URL.revokeObjectURL(url)}
}

export async function readSlide(file) {
 if (!file.type.startsWith('video/')) return readImage(file)
 if (!['video/mp4','video/webm'].includes(file.type)) throw new Error('Use MP4 or WebM video.')
 if (file.size>40*1024*1024) throw new Error('Videos must be 40 MB or smaller.')
 const url=URL.createObjectURL(file),video=document.createElement('video')
 try {
  await new Promise((resolve,reject)=>{
   const timeout=setTimeout(()=>reject(new Error('Video could not be read.')),15000)
   video.onloadedmetadata=()=>{clearTimeout(timeout);resolve()}
   video.onerror=()=>{clearTimeout(timeout);reject(new Error('Unsupported or damaged video.'))}
   video.preload='metadata';video.src=url
  })
  return {id:crypto.randomUUID(),name:file.name,blob:file,kind:'video',width:video.videoWidth,height:video.videoHeight}
 }finally{video.removeAttribute('src');video.load();URL.revokeObjectURL(url)}
}
