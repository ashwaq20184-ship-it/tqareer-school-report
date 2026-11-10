(function(){
'use strict';

const KEY='exchangeVisitsStandaloneV2';
const $=id=>document.getElementById(id);
const W=827,H=1170;
const COLORS={teal:'#138a8b',green:'#23a576',red:'#d11111',pale:'#e3efd8',gold:'#8b6600',ink:'#050505',soft:'#acd987'};
const rightCriteria=[
  'التهيئة للدرس بأسلوب مشوق',
  'توظيف الوسائل التعليمية المناسبة للدرس',
  'العناية بصياغة الأهداف السلوكية وتحقيقها',
  'تنوع المصادر الرقمية المستخدمة في التعلم',
  'التسلسل المنطقي في عرض الدرس',
  'تنوع أساليب التقويم وأدواته',
  'ربط الدرس بالحياة اليومية',
  'الالتزام بزمن الحصة'
];
const middleCriteria=[
  'مراعاة الأنشطة للفروق الفردية للمتعلمين',
  'إثارة الدافعية لدى المتعلمين وتعزيز إجاباتهم',
  'التغذية الراجعة الفورية أثناء الموقف التعليمية',
  'إدارة الصفية بأسلوب تربوي فاعل',
  'تعزيز العلاقات الإيجابية والتعاون بين المتعلمين',
  'المشاركة الفاعلة للمتعلمين أثناء التعلم',
  'مناسبة استراتيجيات التدريس لطبيعة ناتج التعلم',
  'تنوع الأنشطة التعليمية بما يتناسب مع نواتج التعلم المستهدفة'
];
const behaviorCriteria=[
  'الانضباط والهدوء أثناء شرح المعلمة',
  'الالتزام بآداب الحوار والاستئذان قبل الحديث',
  'المشاركة الإيجابية والتفاعل مع الأنشطة الصفية',
  'التعاون مع الزميلات أثناء التعلم والعمل الجماعي',
  'المحافظة على الممتلكات والتجهيزات الصفية',
  'تجنب السلوكيات المشتتة لسير الدرس'
];
const fieldIds=['hostTeacher','className','subjectName','periodName','visitDay','visitDate','lessonTopic','teachingStrategies','learnedPractices','visitorName'];
const ratings={};
let logoImg=null,previewTimer=null;
let sigCtx=null,sigDrawing=false,sigLast=null;

function notice(msg,error=false){
  const n=$('notice'); if(!n)return;
  n.textContent=msg||''; n.style.color=error?'#a52525':'#157268';
}
function field(id){return String(($(id)&&$(id).value)||'').trim()}
function currentData(){
  const fields={}; fieldIds.forEach(id=>fields[id]=field(id));
  return {fields,ratings:{...ratings},signature:signatureData()};
}
function save(show=true){
  try{localStorage.setItem(KEY,JSON.stringify(currentData())); if(show)notice('تم حفظ بيانات الزيارة على هذا الجهاز.')}
  catch(e){notice('تعذر حفظ البيانات على الجهاز.',true)}
}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null'); if(!s)return;
    fieldIds.forEach(id=>{if($(id)&&s.fields&&Object.prototype.hasOwnProperty.call(s.fields,id))$(id).value=s.fields[id]||''});
    if(s.ratings)Object.entries(s.ratings).forEach(([g,v])=>setRating(g,v,false));
    if(s.signature)restoreSignature(s.signature);
  }catch(e){}
}
function clearAll(){
  fieldIds.forEach(id=>{if($(id))$(id).value=''});
  Object.keys(ratings).forEach(g=>setRating(g,'',false));
  clearSignature(); localStorage.removeItem(KEY); schedulePreview();
  notice('تم مسح بيانات الزيارة فقط.');
}

function buildCriterionList(hostId,items,prefix,labels){
  const host=$(hostId); host.innerHTML='';
  items.forEach((text,i)=>{
    const row=document.createElement('div'); row.className='criterion-row';
    const t=document.createElement('div'); t.className='criterion-text'; t.textContent=text;
    const seg=document.createElement('div'); seg.className='segment';
    labels.forEach(([value,label])=>{
      const b=document.createElement('button'); b.type='button'; b.dataset.group=prefix+i; b.dataset.value=value; b.textContent=label;
      b.addEventListener('click',()=>setRating(prefix+i,value,true));
      seg.appendChild(b);
    });
    row.append(t,seg); host.appendChild(row);
  });
}
function setRating(group,value,toggle){
  const next=toggle&&ratings[group]===value?'':value;
  ratings[group]=next;
  document.querySelectorAll('[data-group="'+group+'"]').forEach(b=>b.classList.toggle('selected',b.dataset.value===next));
  schedulePreview();
}
function initCriteria(){
  buildCriterionList('rightCriteria',rightCriteria,'right',[['ok','مناسب'],['not','غير مناسب']]);
  buildCriterionList('middleCriteria',middleCriteria,'middle',[['ok','مناسب'],['not','غير مناسب']]);
  buildCriterionList('behaviorCriteria',behaviorCriteria,'behavior',[['yes','متحقق'],['partial','متحقق جزئيًا'],['no','غير متحقق']]);
}

function setupSignature(){
  const c=$('signatureCanvas'); if(!c)return;
  sigCtx=c.getContext('2d'); sigCtx.strokeStyle='#111'; sigCtx.lineWidth=4; sigCtx.lineCap='round'; sigCtx.lineJoin='round';
  const point=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
  c.addEventListener('pointerdown',e=>{e.preventDefault();sigDrawing=true;sigLast=point(e);c.setPointerCapture&&c.setPointerCapture(e.pointerId)});
  c.addEventListener('pointermove',e=>{if(!sigDrawing)return;e.preventDefault();const p=point(e);sigCtx.beginPath();sigCtx.moveTo(sigLast.x,sigLast.y);sigCtx.lineTo(p.x,p.y);sigCtx.stroke();sigLast=p;schedulePreview()});
  const stop=e=>{if(!sigDrawing)return;sigDrawing=false;sigLast=null;try{c.releasePointerCapture&&c.releasePointerCapture(e.pointerId)}catch(_){}schedulePreview()};
  c.addEventListener('pointerup',stop);c.addEventListener('pointercancel',stop);
}
function clearSignature(){const c=$('signatureCanvas');if(sigCtx&&c)sigCtx.clearRect(0,0,c.width,c.height);schedulePreview()}
function signatureData(){
  const c=$('signatureCanvas'); if(!sigCtx||!c)return'';
  const d=sigCtx.getImageData(0,0,c.width,c.height).data;
  for(let i=3;i<d.length;i+=4)if(d[i])return c.toDataURL('image/png');
  return'';
}
function restoreSignature(data){
  clearSignature(); if(!data||!sigCtx)return;
  const im=new Image();im.onload=()=>{sigCtx.drawImage(im,0,0,$('signatureCanvas').width,$('signatureCanvas').height);schedulePreview()};im.src=data;
}

function ctxBase(ctx){
  ctx.textBaseline='middle'; ctx.direction='rtl'; ctx.fillStyle=COLORS.ink; ctx.strokeStyle='#111'; ctx.lineWidth=1;
}
function font(ctx,size,weight=500,family='Tajawal'){ctx.font=weight+' '+size+'px '+family+', Tahoma, Arial, sans-serif'}
function rect(ctx,x,y,w,h,fill=null,stroke='#111',lineWidth=1){
  if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h)}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}
}
function line(ctx,x1,y1,x2,y2,color='#111',lw=1){ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke()}
function centerText(ctx,text,x,y,w,h,size=14,color=COLORS.ink,weight=700){
  font(ctx,size,weight);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+w/2,y+h/2,w-4);
}
function wrap(ctx,text,maxWidth){
  const words=String(text||'').split(/\s+/).filter(Boolean),lines=[];let cur='';
  for(const word of words){
    const test=cur?cur+' '+word:word;
    if(!cur||ctx.measureText(test).width<=maxWidth)cur=test;
    else{lines.push(cur);cur=word}
  }
  if(cur)lines.push(cur);return lines.length?lines:[''];
}
function fitBoxText(ctx,text,x,y,w,h,opt={}){
  text=String(text||'').trim(); if(!text)return;
  let size=opt.size||16,min=opt.min||8,weight=opt.weight||700,lines=[],lh=0;
  for(;size>=min;size-=.5){
    font(ctx,size,weight); lines=wrap(ctx,text,w-(opt.pad||8)); lh=size*(opt.lineHeight||1.15);
    if(lines.length*lh<=h-(opt.pad||6))break;
  }
  ctx.fillStyle=opt.color||COLORS.ink;ctx.textAlign=opt.align||'center';ctx.textBaseline='middle';
  const cx=opt.align==='right'?x+w-(opt.pad||6):opt.align==='left'?x+(opt.pad||6):x+w/2;
  const start=y+h/2-(lines.length-1)*lh/2;
  lines.forEach((s,i)=>ctx.fillText(s,cx,start+i*lh,w-(opt.pad||8)));
}
function drawCheck(ctx,x,y,w,h){
  ctx.save();ctx.direction='ltr';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#111';ctx.font='700 21px Arial,sans-serif';ctx.fillText('✓',x+w/2,y+h/2+1);ctx.restore();
}
function drawGradientBar(ctx,y,h){
  const g=ctx.createLinearGradient(0,y,W,y);g.addColorStop(0,COLORS.teal);g.addColorStop(1,COLORS.green);ctx.fillStyle=g;ctx.fillRect(0,y,W,h);
}
function drawHeader(ctx){
  drawGradientBar(ctx,0,28);
  if(logoImg&&logoImg.complete)ctx.drawImage(logoImg,34,52,90,70);
  ctx.fillStyle='#000';ctx.textAlign='right';ctx.textBaseline='top';font(ctx,13,700,'Tahoma');
  ['المملكة العربية السعودية','وزارة التعليم','إدارة التعليم بمحافظة ينبع','متوسطة جميلة بنت عمر بن الخطاب','المتوسطة الأولى لتعليم الكبيرات']
    .forEach((s,i)=>ctx.fillText(s,788,52+i*16));
}
function drawFooter(ctx){
  ctx.textBaseline='top';

  ctx.textAlign='right';font(ctx,12.5,700,'Tahoma');ctx.fillStyle=COLORS.soft;
  ctx.fillText('معدة التقرير :',787,1052);
  ctx.fillText('المدرسة :',787,1068);
  ctx.fillStyle='#050505';font(ctx,13.5,400,'Tahoma');
  ctx.fillText('فاطمة مصطفى الجهني',787,1090);
  ctx.fillText('الغامدي',787,1108);

  ctx.textAlign='left';font(ctx,12.5,700,'Tahoma');ctx.fillStyle=COLORS.soft;
  ctx.fillText('مديرة',58,1052);
  ctx.fillText('المدرسة :',58,1068);
  ctx.fillStyle='#050505';font(ctx,13.5,400,'Tahoma');
  ctx.fillText('حنان',58,1090);
  ctx.fillText('الغامدي',58,1108);

  line(ctx,49,1037,89,1037,'#111',1.4);
  drawGradientBar(ctx,1142,28);
}
function drawInfoTable(ctx,data){
  const x=[49,127,206,284,362,440,534,667,787], y=[253,294,319,345];
  // outer and inner lines
  line(ctx,x[0],y[0],x[8],y[0]);line(ctx,x[0],y[3],x[8],y[3]);line(ctx,x[0],y[0],x[0],y[3]);line(ctx,x[8],y[0],x[8],y[3]);
  [127,206,284,362,440,534,667].forEach(v=>line(ctx,v,y[0],v,y[1]));
  [534,667].forEach(v=>line(ctx,v,y[1],v,y[3]));
  line(ctx,667,y[1],787,y[1]);line(ctx,667,y[2],787,y[2]);
  line(ctx,49,y[1],534,y[1]);
  // label fills
  [[667,253,120,41],[440,253,94,41],[284,253,78,41],[127,253,79,41],[667,294,120,25],[667,319,120,26],[440,294,94,51]].forEach(r=>rect(ctx,...r,COLORS.pale,null,0));
  // redraw borders over fills
  line(ctx,49,253,787,253);line(ctx,49,294,787,294);line(ctx,667,319,787,319);line(ctx,49,345,787,345);
  [49,127,206,284,362,440,534,667,787].forEach((v,i)=>{if([127,206,284,362,440,534].includes(v))line(ctx,v,253,v,294);else line(ctx,v,253,v,345)});
  line(ctx,534,294,534,345);
  // labels
  fitBoxText(ctx,'اسم المعلمة المضيفة',667,253,120,41,{size:14,min:11,color:COLORS.red,weight:700});
  centerText(ctx,'الصف',440,253,94,41,14,COLORS.red,700);centerText(ctx,'المادة',284,253,78,41,14,COLORS.red,700);centerText(ctx,'الحصة',127,253,79,41,14,COLORS.red,700);
  centerText(ctx,'اليوم',667,294,120,25,13,COLORS.red,700);centerText(ctx,'التاريخ',667,319,120,26,13,COLORS.red,700);
  fitBoxText(ctx,'موضوع الدرس',440,294,94,51,{size:13,min:11,color:COLORS.red,weight:700});
  // values
  fitBoxText(ctx,data.hostTeacher,534,253,133,41,{size:13,min:9,weight:500});
  fitBoxText(ctx,data.className,362,253,78,41,{size:13,min:9,weight:500});
  fitBoxText(ctx,data.subjectName,206,253,78,41,{size:13,min:9,weight:500});
  fitBoxText(ctx,data.periodName,49,253,78,41,{size:13,min:9,weight:500});
  fitBoxText(ctx,data.visitDay,534,294,133,25,{size:12,min:9,weight:500});
  fitBoxText(ctx,data.visitDate,534,319,133,26,{size:12,min:9,weight:500});
  fitBoxText(ctx,data.lessonTopic,49,294,391,51,{size:13,min:9,weight:500});
}
function drawEvalHeaders(ctx){
  const y0=374,y1=406,y2=432;
  rect(ctx,50,y0,117,y1-y0,COLORS.pale);
  rect(ctx,167,y0,144,y1-y0,COLORS.pale);
  rect(ctx,311,y0,84,y1-y0,COLORS.pale);
  rect(ctx,395,y0,157.5,y2-y0,COLORS.pale);
  rect(ctx,552.5,y0,79,y1-y0,COLORS.pale);
  rect(ctx,631.5,y0,157,y2-y0,COLORS.pale);

  centerText(ctx,'مستوى التحقق',50,y0,117,y1-y0,12,COLORS.red,700);
  fitBoxText(ctx,'مؤشرات متابعة سلوك المتعلمين أثناء الدرس',167,y0,144,y1-y0,{size:11,min:8,color:COLORS.red,weight:700});
  centerText(ctx,'مستوى التنفيذ',311,y0,84,y1-y0,11.5,COLORS.red,700);
  centerText(ctx,'العنصر',395,y0,157.5,y2-y0,14,COLORS.red,700);
  centerText(ctx,'مستوى التنفيذ',552.5,y0,79,y1-y0,11.5,COLORS.red,700);
  centerText(ctx,'العنصر',631.5,y0,157,y2-y0,14,COLORS.red,700);

  rect(ctx,50,y1,39,y2-y1,COLORS.pale);rect(ctx,89,y1,39,y2-y1,COLORS.pale);rect(ctx,128,y1,39,y2-y1,COLORS.pale);
  rect(ctx,167,y1,144,y2-y1,COLORS.pale);
  rect(ctx,311,y1,39,y2-y1,COLORS.pale);rect(ctx,350,y1,45,y2-y1,COLORS.pale);
  rect(ctx,552.5,y1,40,y2-y1,COLORS.pale);rect(ctx,592.5,y1,39,y2-y1,COLORS.pale);

  fitBoxText(ctx,'غير متحقق',50,y1,39,y2-y1,{size:8.5,min:6.5,color:COLORS.red,weight:700});
  fitBoxText(ctx,'متحقق جزئيًا',89,y1,39,y2-y1,{size:8.3,min:6.3,color:COLORS.red,weight:700});
  fitBoxText(ctx,'متحقق',128,y1,39,y2-y1,{size:8.5,min:6.5,color:COLORS.red,weight:700});
  centerText(ctx,'العنصر',167,y1,144,y2-y1,11.5,COLORS.red,700);
  fitBoxText(ctx,'غير مناسب',311,y1,39,y2-y1,{size:8.2,min:6.2,color:COLORS.red,weight:700});
  fitBoxText(ctx,'مناسب',350,y1,45,y2-y1,{size:8.3,min:6.3,color:COLORS.red,weight:700});
  fitBoxText(ctx,'غير مناسب',552.5,y1,40,y2-y1,{size:8.2,min:6.2,color:COLORS.red,weight:700});
  fitBoxText(ctx,'مناسب',592.5,y1,39,y2-y1,{size:8.3,min:6.3,color:COLORS.red,weight:700});
}

function drawEvaluation(ctx,data){
  const xs=[50,89,128,167,311,350,395,552.5,592.5,631.5,788.5];
  const ys=[432,487,542,597,652,707,762,817,872];
  drawEvalHeaders(ctx);

  for(let r=0;r<8;r++){
    const y=ys[r],h=ys[r+1]-ys[r];
    for(let c=0;c<10;c++)rect(ctx,xs[c],y,xs[c+1]-xs[c],h,'#fff');

    if(r<6)fitBoxText(ctx,behaviorCriteria[r],167,y,144,h,{size:14,min:9,weight:700});
    fitBoxText(ctx,middleCriteria[r],395,y,157.5,h,{size:14,min:8.7,weight:700});
    fitBoxText(ctx,rightCriteria[r],631.5,y,157,h,{size:14,min:8.7,weight:700});

    if(r<6){
      const sel=data.ratings['behavior'+r];
      if(sel==='no')drawCheck(ctx,50,y,39,h);
      if(sel==='partial')drawCheck(ctx,89,y,39,h);
      if(sel==='yes')drawCheck(ctx,128,y,39,h);
    }

    const m=data.ratings['middle'+r];
    if(m==='not')drawCheck(ctx,311,y,39,h);
    if(m==='ok')drawCheck(ctx,350,y,45,h);

    const rr=data.ratings['right'+r];
    if(rr==='not')drawCheck(ctx,552.5,y,40,h);
    if(rr==='ok')drawCheck(ctx,592.5,y,39,h);
  }
}

function drawClosingSections(ctx,data){
  ctx.textAlign='right';ctx.textBaseline='middle';

  ctx.fillStyle=COLORS.red;font(ctx,15.5,500,'Tahoma');
  ctx.fillText('استراتيجيات التدريس المنفذة',787,888);
  line(ctx,70,899,787,899,'#333',1);
  line(ctx,70,925,787,925,'#333',1);
  fitBoxText(ctx,data.teachingStrategies,72,900,713,24,{size:11.5,min:7.5,weight:500,align:'right',pad:4});

  ctx.fillStyle=COLORS.red;font(ctx,15.5,500,'Tahoma');
  ctx.fillText('الممارسات التدريسية المكتسبة',787,942);
  line(ctx,70,953,787,953,'#333',1);
  line(ctx,70,979,787,979,'#333',1);
  fitBoxText(ctx,data.learnedPractices,72,954,713,24,{size:11.5,min:7.5,weight:500,align:'right',pad:4});

  const x=239,y=988,w=359;
  rect(ctx,x,y,w,20,COLORS.pale);centerText(ctx,'الزائرة',x,y,w,20,13,COLORS.red,700);
  rect(ctx,x,y+20,238,22,'#fff');rect(ctx,x+238,y+20,121,22,COLORS.pale);centerText(ctx,'الاسم',x+238,y+20,121,22,12,COLORS.red,700);
  rect(ctx,x,y+42,238,22,'#fff');rect(ctx,x+238,y+42,121,22,COLORS.pale);centerText(ctx,'التوقيع',x+238,y+42,121,22,12,COLORS.red,700);
  fitBoxText(ctx,data.visitorName,x,y+20,238,22,{size:11,min:8,weight:500});
  if(data.signature&&$('signatureCanvas'))ctx.drawImage($('signatureCanvas'),x+5,y+45,228,16);
}

function drawPage1(ctx,data){
  ctx.clearRect(0,0,W,H);
  ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  ctxBase(ctx);drawHeader(ctx);

  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=COLORS.gold;font(ctx,30,700,'Tahoma');ctx.fillText('أداة ملاحظة',W/2,169);
  ctx.fillStyle=COLORS.red;font(ctx,25,400,'Tahoma');ctx.fillText('زيارة متبادلة',W/2-14,217);
  ctx.strokeStyle='#c70000';ctx.lineWidth=4;ctx.strokeRect(500,208,18,18);

  drawInfoTable(ctx,data);
  ctx.fillStyle=COLORS.red;font(ctx,23,700,'Tahoma');ctx.fillText('عناصر تقويم الدرس',W/2,361);

  drawEvaluation(ctx,data);
  drawClosingSections(ctx,data);
  drawFooter(ctx);
}

function renderPreview(){
  const data=currentData();
  const c1=$('preview1');
  if(c1)drawPage1(c1.getContext('2d'),data);
}
function schedulePreview(){clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,80)}

function makePageCanvas(data,scale=2){
  const c=document.createElement('canvas');
  c.width=Math.round(W*scale);c.height=Math.round(H*scale);
  const ctx=c.getContext('2d');ctx.scale(scale,scale);
  drawPage1(ctx,data);
  return c;
}

async function exportPdf(){
  if(!window.PDFLib)throw new Error('تعذر تحميل محرك PDF. تحققي من الاتصال بالإنترنت.');
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;

  const data=currentData(),doc=await PDFLib.PDFDocument.create();
  const c=makePageCanvas(data,2);
  const png=await doc.embedPng(c.toDataURL('image/png'));
  const p=doc.addPage([595.28,841.89]);
  p.drawImage(png,{x:0,y:0,width:595.28,height:841.89});

  doc.setTitle('زيارة متبادلة');
  doc.setCreator('متوسطة جميلة بنت عمر بن الخطاب');

  const bytes=await doc.save();
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download='زيارة-متبادلة.pdf';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}

async function init(){
  initCriteria();setupSignature();

  logoImg=new Image();
  logoImg.src='moe-logo.svg?v=20260920-1';
  try{await logoImg.decode()}catch(e){}

  load();

  fieldIds.forEach(id=>$(id)&&$(id).addEventListener('input',schedulePreview));
  $('saveBtn').addEventListener('click',()=>save(true));
  $('clearBtn').addEventListener('click',()=>{if(confirm('هل تريدين مسح جميع بيانات الزيارة الحالية؟'))clearAll()});
  $('clearSignatureBtn').addEventListener('click',()=>{clearSignature();notice('تم مسح التوقيع.')});
  $('pdfBtn').addEventListener('click',async()=>{
    const b=$('pdfBtn'),old=b.textContent;
    b.disabled=true;b.textContent='جارٍ إنشاء PDF...';notice('جارٍ إنشاء النموذج النهائي...');
    try{save(false);await exportPdf();notice('تم إنشاء ملف PDF بصفحة واحدة بنجاح.')}
    catch(e){console.error(e);notice(e.message||'تعذر إنشاء ملف PDF.',true)}
    finally{b.disabled=false;b.textContent=old}
  });

  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  renderPreview();
}

init();
})();