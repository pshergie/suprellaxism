const pictureList=[{id:"id0",author:"Kazimir Malevich",date:"1915",name:"Red square and black square",figures:[{speed:10},{speed:20}]},{id:"id1",author:"Nadezhda Udaltsova",date:"1916",name:"Unnamed",figures:[{speed:10},{speed:25},{speed:25},{speed:15},{speed:10}]},{id:"id2",author:"Nikolai Suetin",date:"1915",name:"Suprematism",figures:[{speed:10},{speed:15},{speed:20},{speed:25},{speed:30},{speed:20},{speed:25},{speed:30},{speed:10},{speed:15},{speed:20},{speed:20},{speed:10},{speed:30},{speed:25}]},{id:"id3",author:"El Lissitzky",date:"1924",name:"Kestnermappe Proun, Rob. Levnis and Chapman GmbH Hannover #5",figures:[{speed:10},{speed:35},{speed:30},{speed:25},{speed:20},{speed:25},{speed:30},{speed:30},{speed:35},{speed:45},{speed:30},{speed:35}]}],gallery=document.getElementsByClassName("gallery")[0],canvas=document.getElementsByClassName("pictures")[0],resetBtn=document.getElementsByClassName("reset")[0],checkbox=document.getElementById("mode"),superModeToggle=document.getElementById("super");gallery.addEventListener("click",e=>{if("previewContainer"===e.target.parentElement.className){const t=parseInt(e.target.parentElement.id,10),i=document.getElementsByClassName("pictureContainer")[0],{offsetTop:s}=i;new Picture(pictureList[t]),window.scrollTo(0,s-22)}});class Picture{constructor(e){this.figures=new Array(e.figures.length),this.perspective=1e3,this.maxTilt={beta:3e3,alpha:3e3},this.x=0,this.y=0,this.drawPicture(e),this.picture=document.getElementById(e.id),this.deviceParallax=this.deviceParallax.bind(this),this.deviceTilt=this.deviceTilt.bind(this),this.deviceParallaxAndTilt=this.deviceParallaxAndTilt.bind(this),this.parallax=this.parallax.bind(this),this.tiltPicture=this.tiltPicture.bind(this),this.parallaxAndTilt=this.parallaxAndTilt.bind(this),this.setMode=this.setMode.bind(this),this.onSuperModeToggle=this.onSuperModeToggle.bind(this),this.reset=this.reset.bind(this),superModeToggle.checked?this.setMode({super:"on"}):this.setMode({target:{checked:checkbox.checked}}),checkbox.addEventListener("change",this.setMode),superModeToggle.addEventListener("change",this.onSuperModeToggle),resetBtn.addEventListener("click",this.reset)}onSuperModeToggle(e){e.target.checked?(checkbox.disabled=!0,this.setMode({super:"on"})):(checkbox.disabled=!1,this.setMode({super:"off"}))}setMode(e){"on"===e.super?(checkbox.checked?this.picture.removeEventListener("mousemove",this.tiltPicture):(this.picture.classList.add("tilt"),window.removeEventListener("mousemove",this.parallax)),this.picture.addEventListener("mousemove",this.parallaxAndTilt,{passive:!0}),window.DeviceMotionEvent&&window.addEventListener("devicemotion",this.deviceParallaxAndTilt,{passive:!0})):"off"===e.super?(checkbox.checked?(this.picture.classList.add("tilt"),window.removeEventListener("mousemove",this.parallax),this.picture.addEventListener("mousemove",this.tiltPicture,{passive:!0}),this.picture.addEventListener("mouseleave",this.reset)):(this.picture.classList.remove("tilt"),this.picture.removeEventListener("mousemove",this.tiltPicture),window.addEventListener("mousemove",this.parallax)),this.picture.removeEventListener("mousemove",this.parallaxAndTilt),window.DeviceMotionEvent&&window.removeEventListener("mousemove",this.deviceParallaxAndTilt)):e.target.checked?(this.picture.classList.add("tilt"),window.removeEventListener("mousemove",this.parallax),this.picture.addEventListener("mousemove",this.tiltPicture,{passive:!0}),this.picture.addEventListener("mouseleave",this.reset),window.DeviceMotionEvent&&(window.removeEventListener("devicemotion",this.deviceParallax),window.addEventListener("devicemotion",this.deviceTilt,{passive:!0}))):(this.picture.classList.remove("tilt"),this.picture.removeEventListener("mousemove",this.tiltPicture),window.addEventListener("mousemove",this.parallax,{passive:!0}),window.DeviceMotionEvent&&(window.removeEventListener("devicemotion",this.deviceTilt),window.addEventListener("devicemotion",this.deviceParallax,{passive:!0})))}deviceParallax(e){const[t,i]=this.processGyro(e);requestAnimationFrame(()=>this.moveObjects({clientX:t,clientY:i,isGyro:!0}))}deviceTilt(e){const[t,i]=this.processGyro(e);requestAnimationFrame(()=>this.tiltPicture({clientX:t,clientY:i,isGyro:!0}))}deviceParallaxAndTilt(e){const[t,i]=this.processGyro(e);requestAnimationFrame(()=>this.parallaxAndTilt({clientX:t,clientY:i,isGyro:!0}))}processGyro(e){const t=e.rotationRate.beta.toPrecision(2),i=e.rotationRate.alpha.toPrecision(2),{maxTilt:s}=this;return this.y+=parseFloat(i),this.x+=parseFloat(t),[Math.abs(this.x)<s.beta?this.x:this.x<0?-s.beta:s.beta,Math.abs(this.y)<s.alpha?this.y:this.y<0?-s.alpha:s.alpha]}drawPicture(e){canvas.innerHTML=`\n      <li class="pictureContainer">\n        <div class="description">\n          <p class="name">«${e.name}»</p>\n          <p class="author">${e.author}, ${e.date}</p>\n        </div>\n        <div id="${e.id}" class="picture">\n          ${e.figures.map((e,t)=>`<div class="fig${t} figure"></div>`).join("")}\n        </div>\n      </li>\n    `,e.figures.forEach((e,t)=>{const i=document.getElementsByClassName(`fig${t}`)[0];this.figures[t]={el:i,speed:e.speed}})}findCoordinates(e,t,i){return{xPos:t.isGyro?-t.clientX*e.speed/i:(this.x-t.clientX)*e.speed/i,yPos:t.isGyro?-t.clientY*e.speed/i:(this.y-t.clientY)*e.speed/i}}findCenterCoordinates(){return[this.picture.offsetLeft+this.picture.offsetWidth/2,this.picture.offsetTop+this.picture.offsetHeight/2]}parallax(e){requestAnimationFrame(()=>this.moveObjects(e))}moveObjects(e){const t=e.isGyro?800:300;if(!e.isGyro&&!this.x&&!this.y)return this.x=e.clientX,void(this.y=e.clientY);this.figures.forEach(i=>{const{xPos:s,yPos:r}=this.findCoordinates(i,e,t);i.el.style.transform=`translate3d(${s}px, ${r}px, 0)`})}tiltPicture(e){this.setTransform(e),this.figures.forEach(e=>{e.el.style.transform=`translateZ(${3*e.speed}px)`})}parallaxAndTilt(e){const{clientX:t,clientY:i}=e;if(!this.x&&!this.y)return this.x=t,void(this.y=i);const[s,r]=this.findCenterCoordinates();this.setTransform(e);const n=e.isGyro?50:8;this.figures.forEach(o=>{let a=-(s-t)/n,d=-(r-i)/n;e.isGyro&&(d=-d),o.el.style.transform=`\n        translate3d(${a}px, ${d}px, ${3*o.speed}px)\n      `})}setTransform(e){const{clientX:t,clientY:i}=e,s=e.isGyro?100:15,[r,n]=this.findCenterCoordinates();let o=-(n-i)/s;const a=(r-t)/s;e.isGyro&&(o=-o);const d=document.getElementById(this.picture.id),c="rtl"===window.getComputedStyle(d,null).getPropertyValue("direction");this.picture.style.transform=c?`perspective(${this.perspective}px) rotateX(${o}deg) rotateY(${a}deg) scale(0.7)`:`perspective(${this.perspective}px) rotateX(${o}deg) rotateY(${a}deg)`}reset(){this.picture.style.transform=this.picture.style.transform.indexOf("scale(0.7)")>=0?`perspective(${this.perspective}px) scale(0.7)`:`perspective(${this.perspective}px)`,this.figures.forEach(e=>e.el.style.transform="null"),this.x=this.y=0}}document.getElementById("motion-permission-btn").addEventListener("click",()=>{"function"==typeof DeviceMotionEvent.requestPermission?DeviceMotionEvent.requestPermission().then(e=>{"granted"===e?new Picture(pictureList[0]):console.log("Device motion permission denied.")}).catch(console.error):new Picture(pictureList[0])});