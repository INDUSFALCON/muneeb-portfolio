const asset = (file) => `/assets/${file}`

// Replace placeholder copy and null contact URLs here when your content is ready.
export const profile = {
  name: 'Muhammad Muneeb',
  headline: 'Hi! I’m Muneeb, an experienced product designer.',
  subtitle: 'Independent product designer · Thoughtful digital experiences',
  linkedin: 'https://www.linkedin.com/in/indusfalcon',
  email: 'muneebdesigns4k@gmail.com',
  phone: '03181523304',
}
export const lorem = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
export const services = ["Product Design","Game Design","UI UX Design","UX Research","User Centric Design","Prototyping","3D Modeling","Illustrations","2D Animations","3D Animations","HTML","CSS","JavaScript","React Js","Tailwind Css","Vibe Coding","AI-Driven Workflows","Case Studies","Social Media Designs","Photography","Videography"]
export const skills = [...services]
export const companies = Array.from({length:5}, (_, i) => ({name:`Company ${String(i+1).padStart(2,'0')}`, logo:null}))
export const projects = [
  {id:'lucitics', title:'Lucitics - Sales Analytics Dashboard App', image:asset('47-477-imgImageUnsplashTOaE3Td9F8M.png'), description:'A comprehensive overview of various transactions and financial reports for either business or personal finances. Its design exudes elegance and sophistication, giving it a luxurious appearance.'},
  {id:'fraone', title:'Fraone - Credit Card Mobile App', image:asset('47-477-imgImageUnsplashTOaE3Td9F8M1.png'), description:'A cutting-edge mobile application designed exclusively for the efficient administration of credit cards, setting itself apart with its superior features and user-friendly interface.'},
  {id:'crypts', title:'Crypts - Crypto Landing Page Responsive', image:asset('47-477-imgImageUnsplashTOaE3Td9F8M2.png'), description:'A gateway to a world of financial opportunities and technological innovation. Immerse yourself in a seamless and intuitive interface that simplifies the complexities of the cryptocurrency market.'},
  {id:'foreca', title:'Foreca - Weather Forecast App', image:asset('47-477-imgImageUnsplashTOaE3Td9F8M3.png'), description:'Accurate and detailed weather information tailored to your location. With user-friendly interfaces and real-time updates, Foreca keeps you informed about current conditions and future forecasts.'},
]
export const showcase = [
  {title:'deCash - Budget Planner Finance App', image:asset('47-192-imgImage.png')},
  {title:'Ideate - Financial News Mobile App', image:asset('47-192-imgImage1.png')},
  {title:'Fluid - NFT Collecting Mobile App', image:asset('47-192-imgImage2.png')},
  {title:projects[3].title, image:projects[3].image},
]
export const process = ['Project Brief', 'Research & Discovery', 'Design & Prototype', 'Refine & Deliver'].map((title,i) => ({title, text:[lorem,'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.','Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa.','At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi.'][i]}))
export const experience = ['Sr. Product Designer','Product Designer','Head of Design','Sr. UI Designer'].map((role,i)=>({role,company:`Company ${String(i+1).padStart(2,'0')} · Placeholder`, dates:'Dates to be added',description:lorem.slice(0,170)}))
export const testimonials = [
  {name:'Client name', role:'Role at Company · Sample', quote:lorem, image:asset('47-708-img8QvEtW3He8SiSbu3SggUdNkMSh4Jpg.png')},
  {name:'Client name', role:'Role at Company · Sample', quote:'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit.', image:asset('47-708-img5P0EN6QtSxQg8Lrk6Rw2Gr9E7EIJpg.png')},
]
export const faqs = [
  {question:'How long does an end-to-end UI/UX design project take?',answer:'Timelines depend on the scope, number of screens, and research involved. A typical project can take several weeks. We’ll agree on milestones before getting started.'},
  {question:'What would the cost be to hire you for a project?',answer:'Every project is different. Once we discuss your goals and deliverables, I can provide a tailored proposal. This is sample content for now.'},
  {question:'How do you balance usability and visual design?',answer:'I start with user needs, explore ideas through wireframes, and refine the experience through prototypes and feedback. Visual design supports a clear, easy-to-use experience.'},
  {question:'Do you offer hourly or project-based engagements?',answer:'Both arrangements can work depending on the project. We can discuss the right approach for your timeline and goals before starting.'},
]
export const socialLinks = [
 {name:'Behance — primary portfolio',icon:'/assets/behance.svg',url:'https://www.behance.net/indusfalcon'},
 {name:'Behance — backup portfolio',icon:'/assets/behance.svg',url:'https://www.behance.net/muhammadmuneeb09'},
  {name:'Dribbble', icon:asset('47-903-imgSvg9722365972419.svg'), url:null},
  {name:'WhatsApp', icon:asset('47-903-imgSvg13892738922128.svg'), url:null},
  {name:'Facebook', icon:asset('47-903-imgSvg1036793748901.svg'), url:null},
  {name:'Instagram', icon:asset('47-903-imgSvg644661204859.svg'), url:'https://www.instagram.com/mmuneeb.jpg/'},
]
