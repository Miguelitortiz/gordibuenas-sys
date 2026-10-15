var e={orders:[],knownFolios:new Set,soundEnabled:!0,lastAudioTimestamp:Date.now()-6e4,lastPlayedAudioData:null,isRecordingWT:!1},t=()=>{let e=document.getElementById(`liveClock`);e&&(e.textContent=new Date().toLocaleTimeString(`es-MX`,{hour:`2-digit`,minute:`2-digit`,second:`2-digit`}))};setInterval(t,1e3),t();var n=()=>{if(e.soundEnabled)try{let e=window.AudioContext||window.webkitAudioContext;if(!e)return;let t=new e,n=t.createOscillator(),r=t.createGain();n.type=`sine`,n.frequency.setValueAtTime(880,t.currentTime),n.frequency.exponentialRampToValueAtTime(1760,t.currentTime+.1),n.frequency.exponentialRampToValueAtTime(1320,t.currentTime+.4),r.gain.setValueAtTime(.3,t.currentTime),r.gain.exponentialRampToValueAtTime(.001,t.currentTime+1.2),n.connect(r),r.connect(t.destination),n.start(),n.stop(t.currentTime+1.2)}catch(e){console.log(e)}},r=e=>{let t=new Date(e).getTime(),n=Math.floor((Date.now()-t)/6e4),r=`green`;return n>=10?r=`red`:n>=5&&(r=`yellow`),{minutes:n,colorClass:r,label:`${n}M`,isUrgent:n>=12}},i=e=>{let t=document.getElementById(`comalSummaryContainer`);if(!t)return;let n={},r=0;if(e.forEach(e=>{e.items.forEach(e=>{e.kind===`guisado`&&(n[e.name]=(n[e.name]||0)+e.quantity,r+=e.quantity)})}),r===0){t.innerHTML=`<span class="muted" style="color: #71717a; font-size: 0.85rem;">COMAL LIBRE - SIN GORDITAS ACTIVAS</span>`;return}let i=Object.entries(n).sort((e,t)=>t[1]-e[1]).map(([e,t])=>`
          <div class="kds-comal-chip">
            <span class="chip-qty">${t}</span>
            <span>${e}</span>
          </div>
        `).join(``);t.innerHTML=`
        <div style="display:flex; align-items:center; gap:0.5rem; margin-right: 0.5rem;">
          <strong style="color:#ffffff; font-size:1rem;">TOTAL: ${r}</strong>
        </div>
        ${i}
      `},a=e=>{let t=document.getElementById(`kdsQueue`),n=document.getElementById(`queueCount`);t&&(n&&(n.textContent=e.length),e.length?(t.innerHTML=e.map(e=>{let t=r(e.createdAt),n=e.status===`en_preparacion`,i=``,a=e.customerName||`CLIENTE`;e.orderType===`aqui`?i=`
              <div class="kds-card-meta">
                ${a} [COMER AQUI]
                ${e.round&&e.round>1?`<span style="background:#ea580c; color:#fff; padding:2px 5px; border-radius:3px; margin-left:4px;">TANDA #${e.round}</span>`:``}
              </div>
            `:e.orderType===`llevar`?i=`
              <div class="kds-card-meta" style="color:#0284c7;">
                PARA LLEVAR: ${a}
              </div>
            `:e.orderType===`domicilio`&&(i=`
              <div class="kds-card-meta" style="color:#dc2626;">
                DOMICILIO: ${e.address||`SIN DIRECCION`}
                ${e.phone?`<br/><span style="font-size:0.75rem;">TEL: ${e.phone}</span>`:``}
              </div>
            `);let o=``;o=e.plates&&e.plates.length>0?e.plates.map(e=>{let t=e.items.map(e=>`
                    <li class="kds-item-row">
                      <span class="kds-item-qty">${e.quantity}</span>
                      <span style="flex:1;">${e.name}</span>
                    </li>
                  `).join(``);return`
                  <div class="kds-plate-box">
                    <div class="row between">
                      <span class="kds-plate-title">${e.name.toUpperCase()}</span>
                      ${e.notes?`<span style="color:#b45309; font-weight:800; font-size:0.72rem;">[${e.notes}]</span>`:``}
                    </div>
                    <ul class="kds-items-list">${t}</ul>
                  </div>
                `}).join(``):`<ul class="kds-items-list">${e.items.map(e=>`
                <li class="kds-item-row">
                  <span class="kds-item-qty">${e.quantity}</span>
                  <span style="flex:1;">${e.name}</span>
                </li>
              `).join(``)}</ul>`;let s=e.notes?`<div class="kds-card-notes">NOTA GENERAL: ${e.notes}</div>`:``,c=n?`<button class="kds-action-btn done" data-action="done" data-id="${e.id}">LISTO PARA SERVIR</button>`:`<button class="kds-action-btn start" data-action="start" data-id="${e.id}">EMPEZAR PREPARACION</button>`;return`
            <article class="kds-card ${n?`status-en_preparacion`:``} ${t.isUrgent?`status-urgente`:``}">
              <header class="kds-card-header">
                <div>
                  <div class="kds-card-folio">#${e.folio}</div>
                  ${i}
                </div>
                <div class="kds-card-timer ${t.colorClass}">
                  ${t.label}
                </div>
              </header>

              <div class="kds-card-body">
                ${o}
                ${s}
              </div>

              <footer class="kds-card-footer">
                ${c}
              </footer>
            </article>
          `}).join(``),t.querySelectorAll(`button[data-action="start"]`).forEach(e=>{e.addEventListener(`click`,()=>o(e.dataset.id,`en_preparacion`))}),t.querySelectorAll(`button[data-action="done"]`).forEach(e=>{e.addEventListener(`click`,()=>o(e.dataset.id,`terminado`))})):t.innerHTML=`
          <div class="empty" style="grid-column: 1 / -1; color: #a1a1aa; border-color: #27272a; padding: 3rem 1rem;">
            <p style="font-size: 1.15rem; font-weight: 800; color: #f4f4f5;">COMAL Y COCINA AL DIA</p>
            <p class="muted" style="margin-top: 0.5rem;">Esperando nuevas comandas de los meseros...</p>
          </div>
        `)},o=async(e,t)=>{try{await fetch(`/api/orders/${e}`,{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify({status:t})}),await s()}catch(e){console.error(e)}},s=async()=>{try{let t=(await(await fetch(`/api/orders`)).json()).filter(e=>[`pendiente`,`en_preparacion`].includes(e.status)),r=!1;t.forEach(t=>{e.knownFolios.has(t.folio)||(e.knownFolios.add(t.folio),r=!0)}),r&&e.knownFolios.size>t.length&&n(),i(t),a(t)}catch(e){console.error(e)}},c=null,l=[],u=null,d=0;(()=>{let t=document.getElementById(`wtButton`),n=document.getElementById(`wtLabel`),r=document.getElementById(`wtTimer`),i=document.getElementById(`incomingAudioBanner`),a=document.getElementById(`replayAudioBtn`),o=document.getElementById(`dismissAudioBtn`);if(!t)return;let s=async()=>{if(!e.isRecordingWT)try{let i=await navigator.mediaDevices.getUserMedia({audio:!0});l=[],c=new MediaRecorder(i),c.ondataavailable=e=>{e.data.size>0&&l.push(e.data)},c.onstop=async()=>{if(i.getTracks().forEach(e=>e.stop()),clearInterval(u),r&&(r.style.display=`none`),l.length===0)return;let e=new Blob(l,{type:`audio/webm`});if(e.size<500)return;let t=new FileReader;t.readAsDataURL(e),t.onloadend=async()=>{let e=t.result;try{await fetch(`/api/audio`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({sender:`Cocina`,audioData:e,duration:Math.round((Date.now()-d)/1e3)})})}catch(e){console.error(e)}}},c.start(),e.isRecordingWT=!0,d=Date.now(),t.classList.add(`recording`),n&&(n.textContent=`TRANSMITIENDO`),r&&(r.style.display=`inline`,r.textContent=`0:01`,u=setInterval(()=>{let e=Math.floor((Date.now()-d)/1e3);r.textContent=`0:${e<10?`0`:``}${e}`},500))}catch{alert(`AUTORIZA EL MICROFONO.`)}},f=()=>{e.isRecordingWT&&(e.isRecordingWT=!1,t.classList.remove(`recording`),n&&(n.textContent=`WALKIE A MESEROS`),c&&c.state!==`inactive`&&c.stop())};t.addEventListener(`click`,()=>{e.isRecordingWT?f():(s(),setTimeout(()=>{e.isRecordingWT&&f()},4e3))}),a?.addEventListener(`click`,()=>{e.lastPlayedAudioData&&new Audio(e.lastPlayedAudioData).play()}),o?.addEventListener(`click`,()=>{i&&(i.style.display=`none`)}),setInterval(async()=>{try{let t=await fetch(`/api/audio?since=${e.lastAudioTimestamp}`);if(!t.ok)return;let n=await t.json();if(n.messages&&n.messages.length>0){e.lastAudioTimestamp=n.serverTime||Date.now();let t=n.messages.find(e=>e.sender===`Mesero`);t&&(e.lastPlayedAudioData=t.audioData,i&&(i.style.display=`flex`,document.getElementById(`incomingAudioText`).textContent=`MENSAJE DE VOZ DE MESERO`),new Audio(t.audioData).play().catch(()=>{}))}}catch{}},2500)})(),(()=>{let t=document.getElementById(`soundToggleBtn`);t?.addEventListener(`click`,()=>{e.soundEnabled=!e.soundEnabled,t.textContent=e.soundEnabled?`SONIDO ON`:`SONIDO OFF`});let n=document.getElementById(`fullscreenBtn`);n?.addEventListener(`click`,()=>{document.fullscreenElement?(document.exitFullscreen().catch(()=>{}),n.textContent=`PANTALLA COMPLETA`):(document.documentElement.requestFullscreen().catch(()=>{}),n.textContent=`SALIR`)})})(),s(),setInterval(s,2500);