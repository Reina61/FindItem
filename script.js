const STORAGE_KEY = "finditem_reports_v1";
const demoReports = [
  {id:"demo-1",type:"found",name:"Dompet hitam",area:"Jakarta Pusat",date:"2026-11-03",description:"Ditemukan di sekitar area umum. Pemilik diminta menyebutkan ciri khusus untuk verifikasi.",contact:"",createdAt:1},
  {id:"demo-2",type:"lost",name:"Kunci motor",area:"Jakarta Selatan",date:"2026-11-02",description:"Kunci motor dengan gantungan kecil. Hilang di sekitar area publik.",contact:"",createdAt:2},
  {id:"demo-3",type:"lost",name:"Botol minum biru",area:"Jakarta Timur",date:"2026-11-01",description:"Botol minum warna biru tertinggal. Ada ciri khusus yang bisa disebutkan saat verifikasi.",contact:"",createdAt:3}
];
const $ = (id) => document.getElementById(id);
let reports = loadReports();

function loadReports(){
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : demoReports;
  } catch { return demoReports; }
}
function saveReports(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(reports)); }
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
}
function formatDate(value){
  if(!value) return "Tanggal tidak dicantumkan";
  return new Date(value+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"});
}
function iconFor(name){
  const n = name.toLowerCase();
  if(n.includes("dompet")) return "👛";
  if(n.includes("hp") || n.includes("ponsel") || n.includes("handphone")) return "📱";
  if(n.includes("kunci")) return "🔑";
  if(n.includes("tas")) return "🎒";
  if(n.includes("kartu")) return "💳";
  if(n.includes("botol")) return "🧴";
  if(n.includes("jam")) return "⌚";
  return "📦";
}
function render(){
  const query = $("search-input").value.trim().toLowerCase();
  const type = $("type-filter").value;
  const area = $("area-filter").value;
  const filtered = reports.filter(r => {
    const matchesText = (r.name+" "+r.description+" "+r.area).toLowerCase().includes(query);
    return matchesText && (type==="all" || r.type===type) && (area==="all" || r.area===area);
  }).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  $("report-list").innerHTML = filtered.map(r => `
    <article class="report-card">
      <div class="card-art"><span class="status ${r.type}">${r.type==="lost"?"Hilang":"Ditemukan"}</span>${iconFor(r.name)}</div>
      <div class="card-body">
        <h3>${escapeHTML(r.name)}</h3>
        <div class="card-meta"><span>📍 ${escapeHTML(r.area)}</span><span>📅 ${formatDate(r.date)}</span></div>
        <p>${escapeHTML(r.description.slice(0,90))}${r.description.length>90?"…":""}</p>
        <button class="text-link" data-detail="${escapeHTML(r.id)}">Lihat detail →</button>
      </div>
    </article>`).join("");
  $("empty-state").classList.toggle("hidden", filtered.length!==0);
  $("total-count").textContent = reports.length;
  $("lost-count").textContent = reports.filter(r=>r.type==="lost").length;
  $("found-count").textContent = reports.filter(r=>r.type==="found").length;
}
$("report-list").addEventListener("click", event => {
  const button = event.target.closest("[data-detail]");
  if(!button) return;
  const r = reports.find(item=>item.id===button.dataset.detail);
  if(!r) return;
  $("dialog-content").innerHTML = `
    <span class="detail-label">${r.type==="lost"?"Barang hilang":"Barang ditemukan"}</span>
    <h2>${escapeHTML(r.name)}</h2>
    <p>📍 ${escapeHTML(r.area)}<br>📅 ${formatDate(r.date)}</p>
    <p>${escapeHTML(r.description)}</p>
    ${r.contact?`<p><strong>Kontak:</strong> ${escapeHTML(r.contact)}</p>`:"<p><strong>Kontak:</strong> Belum dicantumkan. Gunakan kanal komunitas setempat untuk bantuan.</p>"}
    <p><small>Pastikan identitas dan kepemilikan diverifikasi sebelum penyerahan barang. Pilih tempat umum yang aman.</small></p>`;
  $("detail-dialog").showModal();
});
$("dialog-close").addEventListener("click",()=>$("detail-dialog").close());
$("detail-dialog").addEventListener("click",e=>{if(e.target===$("detail-dialog")) $("detail-dialog").close();});
["search-input","type-filter","area-filter"].forEach(id=>$(id).addEventListener(id==="search-input"?"input":"change",render));
$("report-form").addEventListener("submit",event=>{
  event.preventDefault();
  const report = {
    id: (crypto.randomUUID?crypto.randomUUID():String(Date.now())),
    type:$("report-type").value,
    name:$("item-name").value.trim(),
    area:$("item-area").value,
    date:$("item-date").value,
    description:$("item-description").value.trim(),
    contact:$("item-contact").value.trim(),
    createdAt:Date.now()
  };
  if(!report.name || !report.area || !report.date || !report.description) return;
  reports.unshift(report);
  saveReports();
  render();
  $("report-form").reset();
  $("form-message").textContent="Laporan berhasil disimpan di perangkat ini.";
  $("search-input").value="";
  $("type-filter").value="all";
  $("area-filter").value="all";
  document.getElementById("laporan").scrollIntoView({behavior:"smooth"});
});
render();
