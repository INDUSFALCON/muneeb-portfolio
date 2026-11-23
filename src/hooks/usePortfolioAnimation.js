import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(useGSAP, ScrollTrigger)

export function usePortfolioAnimation(scope, projectKey) {
  useGSAP(() => {
    const media = gsap.matchMedia()
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const intro = scope.current.querySelectorAll('[data-intro]')
      if (intro.length) gsap.from(intro, {y:24,opacity:0,duration:0.9,stagger:0.12,ease:'power3.out'})
    })
    media.add('(prefers-reduced-motion: no-preference) and (min-height: 650px)', () => {
      const stack = scope.current.querySelector('.project-stack')
      if (!stack) return
      const cards = gsap.utils.toArray('.project-card', stack)
      if (cards.length < 2) return
      const isMobile = window.innerWidth <= 800
      stack.classList.add('is-stacked')
      gsap.set(cards, {zIndex:i=>i+1, transformOrigin:'50% 0%',filter:'brightness(1)'})
      gsap.set(cards.slice(1), {yPercent:115,autoAlpha:0})
      cards.forEach((card,i)=>{card.inert=i!==0})
      const cardScrollDistance = isMobile ? Math.min(window.innerHeight, 500) : window.innerHeight
      const timeline = gsap.timeline({
        defaults:{ease:'none'},
        scrollTrigger:{
          id:'portfolio-stack',trigger:stack,start:'top 110px',
          end:()=>`+=${cardScrollDistance*(cards.length-0.5)}`,
          pin:true,pinSpacing:true,scrub:isMobile?0.25:0.65,anticipatePin:1,invalidateOnRefresh:true,
          onUpdate:self=>{
            stack.dataset.progress=self.progress.toFixed(3)
            const active=Math.min(cards.length-1,Math.floor(self.progress*(cards.length-.5)+.3))
            cards.forEach((card,i)=>{card.inert=i!==active})
          },
        },
      })
      cards.slice(1).forEach((card,i)=>{
        const position = i+0.2
        timeline.set(card,{autoAlpha:1},position)
        timeline.to(card,{yPercent:0,duration:1},position)
        cards.slice(0,i+1).forEach((previous,j)=>{
          timeline.to(previous,{scale:1-0.05*(i-j+1),y:-18*(i-j+1),filter:`brightness(${1-0.09*(i-j+1)})`,duration:1},position)
        })
      })
      timeline.to({}, {duration:0.3})
      return ()=>{stack.classList.remove('is-stacked');cards.forEach(card=>{card.inert=false})}
    })
    // Font loading can change card geometry and anchor positions.
    let mounted=true
    document.fonts.ready.then(()=>{if(mounted)ScrollTrigger.refresh()})
    return ()=>{mounted=false;media.revert()}
  }, { scope, dependencies:[projectKey], revertOnUpdate:true })
}



