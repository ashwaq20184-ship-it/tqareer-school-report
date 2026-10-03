const $=id=>document.getElementById(id), ids=['program','target','count','goal','steps','results','preparer','durationText','fromDay','fromMonth','fromYear','toDay','toMonth','toYear'];let evidenceImages=[],evidenceTitles=Array(12).fill('');
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
function hijriText(){const d=$('hDay').value||DEFAULT_HIJRI.d,m=$('hMonth').value||DEFAULT_HIJRI.m,y=$('hYear').value||DEFAULT_HIJRI.y;return `${d} / ${m} / ${y} هـ`}
function manualHijriText(prefix){
  const d=String($(prefix+'Day').value||'').trim(),m=String($(prefix+'Month').value||'').trim(),y=String($(prefix+'Year').value||'').trim();
  return d&&m&&y?`${d} / ${m} / ${y} هـ`:'';
}
function executionMode(){return ($('executionMode')&&$('executionMode').value)||'single'}
function executionDateLabel(){return executionMode()==='multi'?'مدة التنفيذ':'تاريخ التنفيذ'}
function executionDateValue(){
  if(executionMode()!=='multi')return hijriText();
  const duration=String(($('durationText')&&$('durationText').value)||'').trim();
  const from=manualHijriText('from'),to=manualHijriText('to');
  const period=from&&to?`من ${from} إلى ${to}`:'';
  return [duration,period].filter(Boolean).join(' — ');
}
function validateExecutionFields(){
  if(executionMode()!=='multi')return '';
  const duration=String(($('durationText')&&$('durationText').value)||'').trim();
  if(!duration)return 'اكتبي مدة التنفيذ، مثل: أسبوع أو أسبوعان أو فصل دراسي.';
  const vals=[
    ['fromDay',1,30,'يوم البداية'],['fromMonth',1,12,'شهر البداية'],['fromYear',1400,1600,'سنة البداية'],
    ['toDay',1,30,'يوم النهاية'],['toMonth',1,12,'شهر النهاية'],['toYear',1400,1600,'سنة النهاية']
  ];
  for(const [id,min,max,label] of vals){
    const raw=String(($(id)&&$(id).value)||'').trim(),n=Number(raw);
    if(!raw||!Number.isInteger(n)||n<min||n>max)return 'تحققي من '+label+' في التاريخ الهجري.';
  }
  return '';
}
function updateDate(){
  $('hijriPreview').textContent='سيظهر في التقرير: '+hijriText();
  const p=$('multiHijriPreview');
  if(p)p.textContent=executionMode()==='multi'&&executionDateValue()?'سيظهر في التقرير: '+executionDateValue():'';
}
function toggleExecutionMode(){
  const multi=executionMode()==='multi';
  if($('singleDateWrap'))$('singleDateWrap').style.display=multi?'none':'block';
  if($('multiDateWrap'))$('multiDateWrap').style.display=multi?'block':'none';
  updateDate();
}
function initHijri(){fillYears(DEFAULT_HIJRI.y);fillMonths(DEFAULT_HIJRI.m);fillDays(DEFAULT_HIJRI.d);updateDate();toggleExecutionMode()}
initHijri();
$('hYear').addEventListener('change',()=>{fillDays($('hDay').value);updateDate()});
$('hMonth').addEventListener('change',()=>{fillDays($('hDay').value);updateDate()});
$('hDay').addEventListener('change',updateDate);
if($('executionMode'))$('executionMode').addEventListener('change',toggleExecutionMode);
for(const id of ['durationText','fromDay','fromMonth','fromYear','toDay','toMonth','toYear'])if($(id))$(id).addEventListener('input',updateDate);
function show(msg){$('notice').textContent=msg;$('notice').classList.add('show')}function hide(){$('notice').classList.remove('show')}
async function compressImage(file,maxW=1200,maxH=1200,q=.76){return new Promise((res,rej)=>{const r=new FileReader();r.onerror=rej;r.onload=e=>{const im=new Image();im.onerror=rej;im.onload=()=>{let s=Math.min(1,maxW/im.naturalWidth,maxH/im.naturalHeight),w=Math.max(1,Math.round(im.naturalWidth*s)),h=Math.max(1,Math.round(im.naturalHeight*s)),c=document.createElement('canvas');c.width=w;c.height=h;let x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(im,0,0,w,h);res(c.toDataURL('image/jpeg',q))};im.src=e.target.result};r.readAsDataURL(file)})}
function renderPhotos(){
  $('photos').innerHTML='';
  for(let i=0;i<12;i++){
    const d=document.createElement('div');d.className='photo';
    const preview=document.createElement('div');preview.className='photo-preview';

    if(evidenceImages[i]){
      const im=new Image();im.src=evidenceImages[i];preview.appendChild(im);
    }else{
      preview.classList.add('empty');preview.textContent=`الشاهد ${i+1}`;
    }

    const controls=document.createElement('div');controls.className='evidence-controls';

    const upload=document.createElement('label');upload.className='evidence-upload';
    upload.textContent=evidenceImages[i]?'تغيير الصورة':'إضافة الشاهد';
    const file=document.createElement('input');
    file.type='file';file.accept='image/*';file.className='evidence-file';
    file.addEventListener('change',async()=>{
      const f=file.files&&file.files[0];
      if(!f)return;
      show(`جارٍ تجهيز الشاهد ${i+1}...`);
      try{
        evidenceImages[i]=await compressImage(f);
        renderPhotos();
        show(`تمت إضافة الشاهد ${i+1}.`);
      }catch(e){
        show(`تعذر تجهيز الشاهد ${i+1}.`);
      }
    });
    upload.appendChild(file);
    controls.appendChild(upload);

    if(evidenceImages[i]){
      const remove=document.createElement('button');
      remove.type='button';remove.className='evidence-remove';remove.textContent='إزالة';
      remove.addEventListener('click',()=>{
        evidenceImages[i]=null;
        evidenceTitles[i]='';
        renderPhotos();
        show(`تم حذف الشاهد ${i+1}.`);
      });
      controls.appendChild(remove);
    }

    const inp=document.createElement('input');
    inp.className='evidence-title';
    inp.type='text';
    inp.placeholder='عنوان الشاهد (اختياري)';
    inp.value=evidenceTitles[i]||'';
    inp.disabled=!evidenceImages[i];
    inp.addEventListener('input',()=>{evidenceTitles[i]=inp.value});

    d.appendChild(preview);
    d.appendChild(controls);
    d.appendChild(inp);
    $('photos').appendChild(d);
  }
}
renderPhotos();
$('saveBtn').onclick=()=>{const o={};ids.forEach(id=>o[id]=$(id).value);o.executionMode=executionMode();o.hYear=$('hYear').value;o.hMonth=$('hMonth').value;o.hDay=$('hDay').value;o.evidenceTitles=evidenceTitles;localStorage.setItem('schoolReport',JSON.stringify(o));show('تم حفظ البيانات على هذا الجهاز.')};
function load(){try{const o=JSON.parse(localStorage.getItem('schoolReport')||'{}');ids.forEach(id=>{if(o[id]!==undefined&&$(id))$(id).value=o[id]});if($('executionMode')&&o.executionMode)$('executionMode').value=o.executionMode;if(o.hYear)fillYears(o.hYear);if(o.hMonth)fillMonths(o.hMonth);if(Array.isArray(o.evidenceTitles))evidenceTitles=o.evidenceTitles.slice(0,12).concat(Array(12).fill('')).slice(0,12);fillDays(o.hDay);toggleExecutionMode();updateDate();renderPhotos()}catch(e){}}load();
$('clearBtn').onclick=()=>{if(!confirm('هل تريدين مسح جميع الحقول؟'))return;ids.forEach(id=>{if($(id))$(id).value=''});if($('executionMode'))$('executionMode').value='single';toggleExecutionMode();evidenceImages=[];evidenceTitles=Array(12).fill('');renderPhotos();localStorage.removeItem('schoolReport');show('تم مسح الحقول.')};
