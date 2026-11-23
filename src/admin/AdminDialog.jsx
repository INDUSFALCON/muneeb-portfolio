import {useEffect,useRef} from 'react'
export default function AdminDialog({children,labelledBy,onCancel}) {
  const ref=useRef(null)
  useEffect(()=>{
    const previous=document.activeElement,overflow=document.body.style.overflow
    document.body.style.overflow='hidden';ref.current.showModal()
    return()=>{document.body.style.overflow=overflow;previous?.focus()}
  },[])
  return <dialog ref={ref} className="admin-native-dialog" aria-labelledby={labelledBy} onCancel={e=>{e.preventDefault();onCancel()}}>{children}</dialog>
}
