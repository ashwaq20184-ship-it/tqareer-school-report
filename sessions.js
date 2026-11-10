(function(){
'use strict';

const KEY='activationSessionsStandaloneV1';
const $=id=>document.getElementById(id);
const W=827,H=1170;
const COLORS={teal:'#138a8b',green:'#23a576',red:'#d11111',pale:'#e3efd8',gold:'#8b6600',ink:'#050505',soft:'#acd987'};
const fieldIds=['sessionNumber','sessionDay','sessionDate','specialty','topic','objectives','agenda','recommendations'];
let teachers=['','','',''];
let barcodeData='',barcodeImg=null,logoImg=null,previewTimer=null;

function notice(msg,error=false){
  const n=$('notice');if(!n)return;
  n.textContent=msg||'';n.style.color=error?'#a52525':'#157268';
}
function field(id){return String(($(id)&&$(id).value)||'').trim()}
function currentData(){
  const data={teachers:[...teachers],barcodeData};
  fieldIds.forEach(id=>data[id]=field(id));
  return data;
}
function save(show=true){
  try{
    localStorage.setItem(KEY,JSON.stringify(currentData()));
    if(show)notice('تم حفظ بيانات الحلقة على هذا الجهاز.');
  }catch(e){notice('تعذر حفظ البيانات. قد تكون صورة الباركود كبيرة جدًا.',true)}
}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem(KEY)||'null');if(!s)return;
    fieldIds.forEach(id=>{if($(id)&&Object.prototype.hasOwnProperty.call(s,id))$(id).value=s[id]||''});
    if(Array.isArray(s.teachers)&&s.teachers.length)teachers=s.teachers.map(v=>String(v||''));
    if(s.barcodeData)setBarcodeData(s.barcodeData,false);
  }catch(e){}
}
function clearAll(){
  fieldIds.forEach(id=>{if($(id))$(id).value=''});
  teachers=['','','',''];
  barcodeData='';barcodeImg=null;
  $('barcodeInput').value='';
  updateBarcodeThumb();
  renderTeachers();
  localStorage.removeItem(KEY);
  schedulePreview();
  notice('تم مسح بيانات الحلقة.');
}

function renderTeachers(){
  const host=$('teachersList');host.innerHTML='';
  teachers.forEach((name,i)=>{
    const row=document.createElement('div');row.className='teacher-row';

    const num=document.createElement('div');num.className='teacher-num';num.textContent=String(i+1);

    const input=document.createElement('input');input.type='text';input.autocomplete='off';
    input.value=name;input.placeholder='اسم المعلمة';
    input.addEventListener('input',()=>{teachers[i]=input.value;schedulePreview()});

    const sig=document.createElement('div');sig.className='signature-placeholder';sig.textContent='فارغ للتوقيع';

    const remove=document.createElement('button');remove.type='button';remove.className='remove-teacher';remove.textContent='×';
    remove.title='حذف المعلمة';
    remove.addEventListener('click',()=>{
      if(teachers.length<=1){notice('يجب إبقاء صف واحد على الأقل.',true);return}
      teachers.splice(i,1);renderTeachers();schedulePreview();
    });

    row.append(num,input,sig,remove);host.appendChild(row);
  });
}
function addTeacher(){
  teachers.push('');
  renderTeachers();
  schedulePreview();
}

function setBarcodeData(data,doSave=false){
  barcodeData=data||'';
  barcodeImg=null;
  updateBarcodeThumb();
  if(barcodeData){
    const im=new Image();
    im.onload=()=>{barcodeImg=im;updateBarcodeThumb();schedulePreview();if(doSave)save(false)};
    im.src=barcodeData;
  }else{
    schedulePreview();
    if(doSave)save(false);
  }
}
function updateBarcodeThumb(){
  const wrap=$('barcodePreviewWrap'),img=$('barcodeThumb');
  if(barcodeData){
    wrap.classList.remove('empty');
    img.src=barcodeData;
  }else{
    wrap.classList.add('empty');
    img.removeAttribute('src');
  }
}
function readBarcodeFile(file){
  if(!file)return;
  if(!file.type.startsWith('image/')){notice('اختاري ملف صورة للباركود.',true);return}
  const reader=new FileReader();
  reader.onload=()=>{
    const im=new Image();
    im.onload=()=>{
      const max=800,scale=Math.min(1,max/Math.max(im.width,im.height));
      const c=document.createElement('canvas');
      c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));
      const ctx=c.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);
      ctx.drawImage(im,0,0,c.width,c.height);
      setBarcodeData(c.toDataURL('image/png'),true);
      notice('تم رفع صورة الباركود.');
    };
    im.onerror=()=>notice('تعذر قراءة الصورة.',true);
    im.src=reader.result;
  };
  reader.readAsDataURL(file);
}

function ctxBase(ctx){
  ctx.textBaseline='middle';ctx.direction='rtl';ctx.fillStyle=COLORS.ink;ctx.strokeStyle='#111';ctx.lineWidth=1;
}
function font(ctx,size,weight=500,family='Tajawal'){ctx.font=weight+' '+size+'px '+family+', Tahoma, Arial, sans-serif'}
function rect(ctx,x,y,w,h,fill=null,stroke='#111',lineWidth=1){
  if(fill){ctx.fillStyle=fill;ctx.fillRect(x,y,w,h)}
  if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lineWidth;ctx.strokeRect(x+.5,y+.5,w-1,h-1)}
}
function line(ctx,x1,y1,x2,y2,color='#111',lw=1){
  ctx.strokeStyle=color;ctx.lineWidth=lw;ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();
}
function centerText(ctx,text,x,y,w,h,size=14,color=COLORS.ink,weight=700){
  font(ctx,size,weight);ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(String(text||''),x+w/2,y+h/2,w-6);
}
function wrap(ctx,text,maxWidth){
  const raw=String(text||'').replace(/\r/g,'').split('\n'),lines=[];
  raw.forEach(par=>{
    const words=par.split(/\s+/).filter(Boolean);
    if(!words.length){lines.push('');return}
    let cur='';
    words.forEach(word=>{
      const test=cur?cur+' '+word:word;
      if(!cur||ctx.measureText(test).width<=maxWidth)cur=test;
      else{lines.push(cur);cur=word}
    });
    if(cur)lines.push(cur);
  });
  return lines.length?lines:[''];
}
function fitBoxText(ctx,text,x,y,w,h,opt={}){
  text=String(text||'').trim();if(!text)return;
  let size=opt.size||16,min=opt.min||8,weight=opt.weight||500,lines=[],lh=0;
  for(;size>=min;size-=.5){
    font(ctx,size,weight,opt.family||'Tahoma');
    lines=wrap(ctx,text,w-(opt.pad||10));
    lh=size*(opt.lineHeight||1.25);
    if(lines.length*lh<=h-(opt.pad||8))break;
  }
  ctx.fillStyle=opt.color||COLORS.ink;ctx.textAlign=opt.align||'right';ctx.textBaseline='middle';
  const px=opt.align==='center'?x+w/2:opt.align==='left'?x+(opt.pad||6):x+w-(opt.pad||6);
  const start=y+h/2-(lines.length-1)*lh/2;
  lines.forEach((s,i)=>ctx.fillText(s,px,start+i*lh,w-(opt.pad||10)));
}
function drawGradientBar(ctx,y,h){
  const g=ctx.createLinearGradient(0,y,W,y);g.addColorStop(0,COLORS.teal);g.addColorStop(1,COLORS.green);
  ctx.fillStyle=g;ctx.fillRect(0,y,W,h);
}
function drawHeader(ctx){
  drawGradientBar(ctx,0,28);
  if(logoImg&&logoImg.complete)ctx.drawImage(logoImg,34,50,90,70);
  ctx.fillStyle='#000';ctx.textAlign='right';ctx.textBaseline='top';font(ctx,13,700,'Tahoma');
  ['المملكة العربية السعودية','وزارة التعليم','إدارة التعليم بمحافظة ينبع','متوسطة جميلة بنت عمر بن الخطاب','المتوسطة الأولى لتعليم الكبيرات']
    .forEach((s,i)=>ctx.fillText(s,788,49+i*16));
}
function drawTitle(ctx,data){
  ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillStyle=COLORS.gold;font(ctx,27,700,'Tahoma');
  ctx.fillText('محضر اجتماع الحلقات التنشيطية',W/2,162);
  ctx.fillStyle='#2b2b2b';font(ctx,16,500,'Tahoma');
  const n=data.sessionNumber?'الحلقة رقم ( '+data.sessionNumber+' )':'الحلقة رقم (      )';
  ctx.fillText(n,W/2,194);
}
function drawInfo(ctx,data){
  const top=220,row1=42,row2=42;
  // right pair: specialty
  rect(ctx,667,top,120,row1,COLORS.pale);rect(ctx,510,top,157,row1,'#fff');
  // middle pair: date
  rect(ctx,390,top,120,row1,COLORS.pale);rect(ctx,270,top,120,row1,'#fff');
  // left pair: day
  rect(ctx,150,top,120,row1,COLORS.pale);rect(ctx,50,top,100,row1,'#fff');

  centerText(ctx,'التخصص',667,top,120,row1,14,COLORS.ink,700);
  centerText(ctx,'التاريخ',390,top,120,row1,14,COLORS.ink,700);
  centerText(ctx,'اليوم',150,top,120,row1,14,COLORS.ink,700);

  fitBoxText(ctx,data.specialty,510,top,157,row1,{size:13,min:9,weight:500,align:'center'});
  fitBoxText(ctx,data.sessionDate,270,top,120,row1,{size:13,min:9,weight:500,align:'center'});
  fitBoxText(ctx,data.sessionDay,50,top,100,row1,{size:13,min:9,weight:500,align:'center'});

  rect(ctx,667,top+row1,120,row2,COLORS.pale);
  rect(ctx,50,top+row1,617,row2,'#fff');
  centerText(ctx,'موضوع الحلقة',667,top+row1,120,row2,14,COLORS.ink,700);
  fitBoxText(ctx,data.topic,50,top+row1,617,row2,{size:14,min:9,weight:500,align:'right'});
}
function drawSection(ctx,title,text,y,h){
  ctx.fillStyle=COLORS.red;ctx.textAlign='right';ctx.textBaseline='middle';font(ctx,16,700,'Tahoma');
  ctx.fillText('•  '+title,787,y);
  rect(ctx,50,y+16,737,h,'#fff','#b5a466',1);
  fitBoxText(ctx,text,58,y+20,721,h-8,{size:13.5,min:7.5,weight:500,align:'right',pad:8,lineHeight:1.22});
}
function drawTeachersAndEvidence(ctx,data){
  const tableX=330,tableY=714,tableW=457,headH=28;
  const sigW=170,nameW=230,numW=57;
  const count=Math.max(1,data.teachers.length);
  const available=236;
  const rowH=Math.max(17,Math.min(34,available/count));
  const tableH=headH+rowH*count;

  // evidence
  ctx.fillStyle=COLORS.red;ctx.textAlign='center';ctx.textBaseline='middle';font(ctx,15,700,'Tahoma');
  ctx.fillText('الشاهد',170,694);
  rect(ctx,65,714,210,210,'#fff','#9caeb1',1);
  if(barcodeImg&&barcodeImg.complete){
    const pad=12,maxW=186,maxH=186;
    const s=Math.min(maxW/barcodeImg.width,maxH/barcodeImg.height);
    const w=barcodeImg.width*s,h=barcodeImg.height*s;
    ctx.drawImage(barcodeImg,65+(210-w)/2,714+(210-h)/2,w,h);
  }else{
    ctx.fillStyle='#8a9699';font(ctx,12,500,'Tahoma');ctx.fillText('صورة الباركود',170,819);
  }

  // teachers table header
  rect(ctx,tableX,tableY,sigW,headH,COLORS.pale);
  rect(ctx,tableX+sigW,tableY,nameW,headH,COLORS.pale);
  rect(ctx,tableX+sigW+nameW,tableY,numW,headH,COLORS.pale);
  centerText(ctx,'التوقيع',tableX,tableY,sigW,headH,13,COLORS.ink,700);
  centerText(ctx,'اسم المعلمة',tableX+sigW,tableY,nameW,headH,13,COLORS.ink,700);
  centerText(ctx,'م',tableX+sigW+nameW,tableY,numW,headH,13,COLORS.ink,700);

  data.teachers.forEach((name,i)=>{
    const y=tableY+headH+i*rowH;
    rect(ctx,tableX,y,sigW,rowH,'#fff');
    rect(ctx,tableX+sigW,y,nameW,rowH,'#fff');
    rect(ctx,tableX+sigW+nameW,y,numW,rowH,'#fff');
    centerText(ctx,String(i+1),tableX+sigW+nameW,y,numW,rowH,11,COLORS.ink,500);
    fitBoxText(ctx,name,tableX+sigW,y,nameW,rowH,{size:11.5,min:7,weight:500,align:'center',pad:4});
  });

  if(tableH<210){
    ctx.fillStyle='#7b888b';font(ctx,10.5,500,'Tahoma');ctx.textAlign='center';
    ctx.fillText('تُترك خانات التوقيع فارغة للتوقيع بعد الطباعة',tableX+tableW/2,tableY+tableH+15);
  }
}
function drawFooter(ctx){
  ctx.textBaseline='middle';ctx.textAlign='center';

  ctx.fillStyle=COLORS.soft;font(ctx,13.5,700,'Tahoma');
  ctx.fillText('معدة التقرير',650,1058);
  ctx.fillStyle='#050505';font(ctx,14.5,500,'Tahoma');
  ctx.fillText('فاطمة مصطفى الجهني',650,1084);
  line(ctx,560,1108,740,1108,'#777',1);

  ctx.fillStyle=COLORS.soft;font(ctx,13.5,700,'Tahoma');
  ctx.fillText('مديرة المدرسة',177,1058);
  ctx.fillStyle='#050505';font(ctx,14.5,500,'Tahoma');
  ctx.fillText('حنان الغامدي',177,1084);
  line(ctx,87,1108,267,1108,'#777',1);

  drawGradientBar(ctx,1142,28);
}
function drawPage(ctx,data){
  ctx.clearRect(0,0,W,H);ctx.fillStyle='#fff';ctx.fillRect(0,0,W,H);
  ctxBase(ctx);drawHeader(ctx);drawTitle(ctx,data);drawInfo(ctx,data);
  drawSection(ctx,'أهداف الحلقة',data.objectives,330,78);
  drawSection(ctx,'محاور الاجتماع',data.agenda,442,78);
  drawSection(ctx,'التوصيات المتفق عليها',data.recommendations,554,78);
  drawTeachersAndEvidence(ctx,data);
  drawFooter(ctx);
}
function renderPreview(){
  const c=$('preview1');if(c)drawPage(c.getContext('2d'),currentData());
}
function schedulePreview(){clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,80)}
function makePageCanvas(data,scale=2){
  const c=document.createElement('canvas');c.width=Math.round(W*scale);c.height=Math.round(H*scale);
  const ctx=c.getContext('2d');ctx.scale(scale,scale);drawPage(ctx,data);return c;
}
async function exportPdf(){
  if(!window.PDFLib)throw new Error('تعذر تحميل محرك PDF. تحققي من الاتصال بالإنترنت.');
  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  if(barcodeData&&(!barcodeImg||!barcodeImg.complete)){
    await new Promise(resolve=>{
      const im=new Image();im.onload=()=>{barcodeImg=im;resolve()};im.onerror=resolve;im.src=barcodeData;
    });
  }
  const data=currentData(),doc=await PDFLib.PDFDocument.create();
  const c=makePageCanvas(data,2);
  const png=await doc.embedPng(c.toDataURL('image/png'));
  const p=doc.addPage([595.28,841.89]);
  p.drawImage(png,{x:0,y:0,width:595.28,height:841.89});
  doc.setTitle('محضر اجتماع الحلقات التنشيطية');
  doc.setCreator('متوسطة جميلة بنت عمر بن الخطاب');

  const bytes=await doc.save();
  const blob=new Blob([bytes],{type:'application/pdf'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='الحلقة-التنشيطية.pdf';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1500);
}
async function init(){
  logoImg=new Image();logoImg.src='moe-logo.svg?v=20260920-1';
  try{await logoImg.decode()}catch(e){}

  load();
  renderTeachers();
  updateBarcodeThumb();

  fieldIds.forEach(id=>$(id)&&$(id).addEventListener('input',schedulePreview));
  $('addTeacherBtn').addEventListener('click',addTeacher);
  $('barcodeInput').addEventListener('change',e=>readBarcodeFile(e.target.files&&e.target.files[0]));
  $('removeBarcodeBtn').addEventListener('click',()=>{
    setBarcodeData('',true);$('barcodeInput').value='';notice('تمت إزالة صورة الباركود.');
  });
  $('saveBtn').addEventListener('click',()=>save(true));
  $('clearBtn').addEventListener('click',()=>{if(confirm('هل تريدين مسح جميع بيانات الحلقة الحالية؟'))clearAll()});
  $('pdfBtn').addEventListener('click',async()=>{
    const b=$('pdfBtn'),old=b.textContent;b.disabled=true;b.textContent='جارٍ إنشاء PDF...';
    notice('جارٍ إنشاء النموذج النهائي...');
    try{save(false);await exportPdf();notice('تم إنشاء ملف PDF بصفحة واحدة بنجاح.')}
    catch(e){console.error(e);notice(e.message||'تعذر إنشاء ملف PDF.',true)}
    finally{b.disabled=false;b.textContent=old}
  });

  if(document.fonts&&document.fonts.ready)await document.fonts.ready;
  renderPreview();
}
init();
})();