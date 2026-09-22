const b=document.querySelector("#server-install-button")
const p=document.querySelector("#play-button")
const o=document.querySelector("#install-options")
const v=document.querySelector("#include-video")
const m=document.querySelector("#map-selection")
const s=document.querySelector("#install-copy-size")
let list

async function save(root,path){
    let a=path.split("/"),name=a.pop()
    for(let x of a)root=await root.getDirectoryHandle(x,{create:true})
    let f=await root.getFileHandle(name,{create:true})
    let r=await fetch("cod4/"+path)
    if(!r.ok)throw Error(path)
    await r.body.pipeTo(await f.createWritable())
}

async function install(){
    if(!list)return

    let files=[...list.required]

    if(v.checked)files.push(...list.video)

    if(document.querySelector("#campaign").checked)
        for(let x in list.maps)
            if(!x.startsWith("mp_"))files.push(...list.maps[x])

    let root=await (await navigator.storage.getDirectory()).getDirectoryHandle("cod4",{create:true})

    b.disabled=true

    for(let i=0;i<files.length;i++){
        s.textContent=`copying ${i+1}/${files.length}`
        await save(root,files[i])
    }

    localStorage.setItem("kisak_opfs_ready","1")
    s.textContent="done"
    p.disabled=false
}

fetch("cod4/manifest.json").then(async r=>{
    if(!r.ok)throw Error("manifest "+r.status)

    list=await r.json()

    let campaign=Object.keys(list.maps).filter(x=>!x.startsWith("mp_"))

    m.innerHTML=`<label class="map-group"><input id="campaign" type="checkbox" checked> campaign maps <span class="map-group-count">· ${campaign.length} maps · skip to save 1.06 gb</span></label>`

    document.querySelector("#video-size").textContent="skip to save 1.23 gb"
    s.textContent="will copy 3.39 gb"
    o.hidden=false
}).catch(e=>{
    s.textContent="failed: "+e.message
})

b.onclick=install