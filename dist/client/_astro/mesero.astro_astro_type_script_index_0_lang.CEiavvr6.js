var e=document.getElementById(`guisadosGrid`),t=document.getElementById(`ordersList`),n=document.getElementById(`statusMsg`),r={guisados:[]},i=e=>{let t=Number.parseInt(e,10);return Number.isFinite(t)&&t>=0?t:0},a=async()=>{let t=await(await fetch(`/api/config`)).json();r.guisados=t.guisadosDelDia,e.innerHTML=t.guisadosDelDia.map(e=>`
            <label>${e}
              <input type="number" min="0" value="0" data-guisado="${e}" />
            </label>
          `).join(``)},o=async()=>{let e=r.guisados.map(e=>({name:e,quantity:i(document.querySelector(`[data-guisado="${e}"]`)?.value??`0`)})),t={notes:document.getElementById(`notes`).value,guisados:e,drinks:{aguaFrescaChica:i(document.getElementById(`aguaFrescaChica`).value),aguaFrescaLitro:i(document.getElementById(`aguaFrescaLitro`).value),cafe:i(document.getElementById(`cafe`).value)}},a=await fetch(`/api/orders`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify(t)});n.textContent=a.ok?`Comanda enviada.`:`Revisa los datos.`,a.ok&&(document.querySelectorAll(`input[type="number"]`).forEach(e=>{e.value=`0`}),document.getElementById(`notes`).value=``,await d())},s=async(e,t)=>{let a;if(t===`cancel`)a={status:`cancelado`};else{let t=document.querySelector(`[data-order-edit="${e}"]`),n=r.guisados.map(n=>({name:n,quantity:i(t.querySelector(`[data-edit-guisado="${e}-${n}"]`)?.value??`0`)}));a={notes:t.querySelector(`[data-edit-notes="${e}"]`)?.value??``,guisados:n,drinks:{aguaFrescaChica:i(t.querySelector(`[data-edit-drink="${e}-aguaFrescaChica"]`)?.value??`0`),aguaFrescaLitro:i(t.querySelector(`[data-edit-drink="${e}-aguaFrescaLitro"]`)?.value??`0`),cafe:i(t.querySelector(`[data-edit-drink="${e}-cafe"]`)?.value??`0`)}}}n.textContent=(await fetch(`/api/orders/${e}`,{method:`PATCH`,headers:{"Content-Type":`application/json`},body:JSON.stringify(a)})).ok?`Pedido actualizado.`:`No se pudo actualizar.`,await d()},c=(e,t)=>e.items.find(e=>e.kind===`bebida`&&e.name===t)?.quantity??0,l=(e,t)=>e.items.find(e=>e.kind===`guisado`&&e.name===t)?.quantity??0,u=e=>{let t=![`terminado`,`cancelado`].includes(e.status),n=e.items.map(e=>`${e.name} x${e.quantity} · $${e.total}`).join(`<br/>`),i=t?`
          <div class="grid cols-3" data-order-edit="${e.id}">
            ${r.guisados.map(t=>`<label>${t}<input data-edit-guisado="${e.id}-${t}" type="number" min="0" value="${l(e,t)}" /></label>`).join(``)}
            <label>Agua chica<input data-edit-drink="${e.id}-aguaFrescaChica" type="number" min="0" value="${c(e,`Agua fresca chica`)}" /></label>
            <label>Agua 1 L<input data-edit-drink="${e.id}-aguaFrescaLitro" type="number" min="0" value="${c(e,`Agua fresca 1 L`)}" /></label>
            <label>Café<input data-edit-drink="${e.id}-cafe" type="number" min="0" value="${c(e,`Café`)}" /></label>
            <label style="grid-column:1/-1;">Notas<input data-edit-notes="${e.id}" value="${e.notes??``}" /></label>
            <div class="row" style="grid-column:1/-1;">
              <button class="btn secondary" data-action="save" data-id="${e.id}">Guardar cambios</button>
              <button class="btn warn" data-action="cancel" data-id="${e.id}">Cancelar pedido</button>
            </div>
          </div>
        `:``;return`
        <article class="card">
          <div class="row between">
            <strong>Folio #${e.folio}</strong>
            <span class="badge ${e.status}">${e.status.replace(`_`,` `)}</span>
          </div>
          <p class="muted">${new Date(e.createdAt).toLocaleTimeString(`es-MX`,{hour:`2-digit`,minute:`2-digit`})}</p>
          <p>${n||`Sin productos`}</p>
          <p><strong>Total: $${e.total}</strong></p>
          ${i}
        </article>
      `},d=async()=>{let e=await(await fetch(`/api/orders`)).json();e.length?(t.innerHTML=e.map(u).join(``),t.querySelectorAll(`button[data-action="save"]`).forEach(e=>{e.addEventListener(`click`,()=>s(e.dataset.id,`save`))}),t.querySelectorAll(`button[data-action="cancel"]`).forEach(e=>{e.addEventListener(`click`,()=>s(e.dataset.id,`cancel`))})):t.innerHTML=`<div class="empty">Aún no hay pedidos.</div>`};document.getElementById(`crearPedido`)?.addEventListener(`click`,o),a().then(d),setInterval(d,3500);