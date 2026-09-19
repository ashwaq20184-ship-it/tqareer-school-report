const $=id=>document.getElementById(id), ids=['program','target','count','goal','steps','results','preparer'];let evidenceImages=[];
const monthNames=['محرم','صفر','ربيع الأول','ربيع الآخر','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوال','ذو القعدة','ذو الحجة'];
// أطوال أشهر تقويم أم القرى مثبتة مسبقًا حتى تعمل القوائم على Safari/iPhone دون الاعتماد على دعم Intl في الجهاز.
const HIJRI_MONTH_LENGTHS={
1442:[29,30,29,30,29,30,29,30,30,29,30,29],
1443:[30,29,30,29,30,29,30,29,30,29,30,30],
1444:[29,30,29,30,30,29,29,30,29,30,29,30],
1445:[29,30,30,30,29,30,29,29,30,29,29,30],
1446:[29,30,30,30,29,30,30,29,29,30,29,29],
1447:[30,29,30,30,30,29,30,29,30,29,30,29],
1448:[29,30,29,30,30,29,30,30,29,30,29,30],
1449:[29,29,30,29,30,29,30,30,29,30,30,29],
1450:[30,29,30,29,29,30,29,30,29,30,30,29],
1451:[30,30,30,29,29,30,29,29,30,30,29,30],
1452:[30,29,30,30,29,29,30,29,29,30,29,30],
1453:[30,29,30,30,29,30,29,30,29,29,30,29],
1454:[30,29,30,30,29,30,30,29,30,29,30,29],
1455:[29,30,29,30,30,29,30,29,30,30,29,30],
1456:[29,29,30,29,30,29,30,29,30,30,30,29],
1457:[30,29,29,30,29,29,30,29,30,30,30,30]
};
function safeCurrentHijri(){
  try{
    const fmt=new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura-nu-latn',{day:'numeric',month:'numeric',year:'numeric'});
    const out={};
    for(const x of fmt.formatToParts(new Date())) if(['day','month','year'].includes(x.type)) out[x.type]=Number(x.value);
    if(Number.isFinite(out.day)&&Number.isFinite(out.month)&&Number.isFinite(out.year)) return {d:out.day,m:out.month,y:out.year};
  }catch(e){}
  return {d:1,m:4,y:1448};
}
const DEFAULT_HIJRI=safeCurrentHijri();
function monthDays(y,m){const a=HIJRI_MONTH_LENGTHS[Number(y)];return a&&a[Number(m)-1]?a[Number(m)-1]:30}
function fillYears(sel){
  const chosen=Number(sel)||DEFAULT_HIJRI.y, el=$('hYear');el.innerHTML='';
  const years=Object.keys(HIJRI_MONTH_LENGTHS).map(Number);
  if(!years.includes(chosen)) years.push(chosen);
  years.sort((a,b)=>a-b);
  years.forEach(y=>el.add(new Option(y+' هـ',String(y),false,y===chosen)));
  el.value=String(chosen);
}
function fillMonths(sel){
  const chosen=Math.min(12,Math.max(1,Number(sel)||DEFAULT_HIJRI.m)),el=$('hMonth');el.innerHTML='';
  monthNames.forEach((n,i)=>el.add(new Option(n,String(i+1),false,i+1===chosen)));
  el.value=String(chosen);
}
function fillDays(sel){
  const chosen=Math.max(1,Number(sel)||DEFAULT_HIJRI.d), y=Number($('hYear').value)||DEFAULT_HIJRI.y, m=Number($('hMonth').value)||DEFAULT_HIJRI.m, max=monthDays(y,m), el=$('hDay');el.innerHTML='';
  for(let d=1;d<=max;d++)el.add(new Option(String(d),String(d),false,d===Math.min(chosen,max)));
  el.value=String(Math.min(chosen,max));
}
function hijriText(){const d=$('hDay').value||DEFAULT_HIJRI.d,m=Number($('hMonth').value)||DEFAULT_HIJRI.m,y=$('hYear').value||DEFAULT_HIJRI.y;return `${d} ${monthNames[m-1]} ${y} هـ`}
function updateDate(){$('hijriPreview').textContent='سيظهر في التقرير: '+hijriText()}
function initHijri(){fillYears(DEFAULT_HIJRI.y);fillMonths(DEFAULT_HIJRI.m);fillDays(DEFAULT_HIJRI.d);updateDate()}
initHijri();
$('hYear').addEventListener('change',()=>{fillDays($('hDay').value);updateDate()});
$('hMonth').addEventListener('change',()=>{fillDays($('hDay').value);updateDate()});
$('hDay').addEventListener('change',updateDate);
function show(msg){$('notice').textContent=msg;$('notice').classList.add('show')}function hide(){$('notice').classList.remove('show')}
async function compressImage(file,maxW=1200,maxH=1200,q=.76){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=e=>{const im=new Image();im.onerror=rej;im.onload=()=>{let s=Math.min(1,maxW/im.naturalWidth,maxH/im.naturalHeight),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s)),c=document.createElement('canvas');c.width=w;c.height=h;let x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',q))};im.src=e.target.result};r.readAsDataURL(file)})}
function renderPhotos(){$('photos').innerHTML='';for(let i=0;i<12;i++){const d=document.createElement('div');d.className='photo';if(evidenceImages[i]){const im=new Image();im.src=evidenceImages[i];d.appendChild(im)}else d.textContent=`الشاهد ${i+1}`;$('photos').appendChild(d)}}renderPhotos();
$('images').addEventListener('change',async()=>{evidenceImages=[];show('جارٍ تجهيز صور الشواهد...');for(const f of [...$('images').files].slice(0,12)){try{evidenceImages.push(await compressImage(f))}catch(e){}}renderPhotos();show(`تم تجهيز ${evidenceImages.length} من 12 شاهدًا.`)});
const COUNTER_URL='https://ebsrurheeqyiexcfcehx.supabase.co',COUNTER_KEY='sb_publishable_iBthlnseptMOOcKGPE5nbQ_PlsDvaml';
async function refreshCounter(){try{const r=await fetch(COUNTER_URL+'/rest/v1/report_page_counter?select=total&id=eq.1',{headers:{apikey:COUNTER_KEY}}),d=await r.json();if(d&&d[0])$('reportCounter').textContent=Number(d[0].total).toLocaleString('ar-SA')}catch(e){if($('reportCounter').textContent==='—')$('reportCounter').textContent='غير متاح'}}
async function incrementCounter(){try{const r=await fetch(COUNTER_URL+'/rest/v1/rpc/increment_report_page_counter',{method:'POST',headers:{apikey:COUNTER_KEY,'Content-Type':'application/json'},body:'{}'}),n=await r.json();if(n!=null)$('reportCounter').textContent=Number(n).toLocaleString('ar-SA')}catch(e){}}
refreshCounter();setInterval(refreshCounter,30000);
$('saveBtn').onclick=()=>{const o={};ids.forEach(id=>o[id]=$(id).value);o.hYear=$('hYear').value;o.hMonth=$('hMonth').value;o.hDay=$('hDay').value;localStorage.setItem('schoolReport',JSON.stringify(o));show('تم حفظ البيانات على هذا الجهاز.')};
function load(){try{const o=JSON.parse(localStorage.getItem('schoolReport')||'{}');ids.forEach(id=>{if(o[id])$(id).value=o[id]});if(o.hYear)fillYears(o.hYear);if(o.hMonth)fillMonths(o.hMonth);fillDays(o.hDay);updateDate()}catch(e){}}load();
$('clearBtn').onclick=()=>{if(!confirm('هل تريدين مسح جميع الحقول؟'))return;ids.forEach(id=>$(id).value='');$('images').value='';evidenceImages=[];renderPhotos();localStorage.removeItem('schoolReport');show('تم مسح الحقول.')};
