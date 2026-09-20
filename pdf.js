const PDF_FONT_URL='https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoNaskhArabic/hinted/ttf/NotoNaskhArabic-Bold.ttf';
const PDF_LOGO_B64='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';
const PF={
'ء':['\uFE80',null,null,null],
'آ':['\uFE81','\uFE82',null,null],'أ':['\uFE83','\uFE84',null,null],'ؤ':['\uFE85','\uFE86',null,null],'إ':['\uFE87','\uFE88',null,null],
'ئ':['\uFE89','\uFE8A','\uFE8B','\uFE8C'],'ا':['\uFE8D','\uFE8E',null,null],'ب':['\uFE8F','\uFE90','\uFE91','\uFE92'],
'ة':['\uFE93','\uFE94',null,null],'ت':['\uFE95','\uFE96','\uFE97','\uFE98'],'ث':['\uFE99','\uFE9A','\uFE9B','\uFE9C'],
'ج':['\uFE9D','\uFE9E','\uFE9F','\uFEA0'],'ح':['\uFEA1','\uFEA2','\uFEA3','\uFEA4'],'خ':['\uFEA5','\uFEA6','\uFEA7','\uFEA8'],
'د':['\uFEA9','\uFEAA',null,null],'ذ':['\uFEAB','\uFEAC',null,null],'ر':['\uFEAD','\uFEAE',null,null],'ز':['\uFEAF','\uFEB0',null,null],
'س':['\uFEB1','\uFEB2','\uFEB3','\uFEB4'],'ش':['\uFEB5','\uFEB6','\uFEB7','\uFEB8'],'ص':['\uFEB9','\uFEBA','\uFEBB','\uFEBC'],
'ض':['\uFEBD','\uFEBE','\uFEBF','\uFEC0'],'ط':['\uFEC1','\uFEC2','\uFEC3','\uFEC4'],'ظ':['\uFEC5','\uFEC6','\uFEC7','\uFEC8'],
'ع':['\uFEC9','\uFECA','\uFECB','\uFECC'],'غ':['\uFECD','\uFECE','\uFECF','\uFED0'],'ف':['\uFED1','\uFED2','\uFED3','\uFED4'],
'ق':['\uFED5','\uFED6','\uFED7','\uFED8'],'ك':['\uFED9','\uFEDA','\uFEDB','\uFEDC'],'ل':['\uFEDD','\uFEDE','\uFEDF','\uFEE0'],
'م':['\uFEE1','\uFEE2','\uFEE3','\uFEE4'],'ن':['\uFEE5','\uFEE6','\uFEE7','\uFEE8'],'ه':['\uFEE9','\uFEEA','\uFEEB','\uFEEC'],
'و':['\uFEED','\uFEEE',null,null],'ى':['\uFEEF','\uFEF0',null,null],'ي':['\uFEF1','\uFEF2','\uFEF3','\uFEF4']
};
const DUAL=new Set([...'بتثجحخسشصضطظعغفقكلمنهيئ']);
const RIGHT=new Set([...'اأإآدذرزوةىؤ']);
const LAM_ALEF={
  'آ':['\uFEF5','\uFEF6'],
  'أ':['\uFEF7','\uFEF8'],
  'إ':['\uFEF9','\uFEFA'],
  'ا':['\uFEFB','\uFEFC']
};
const MIRROR={'(':')',')':'(','[':']',']':'[','{':'}','}':'{'};
const canL=c=>DUAL.has(c),canR=c=>DUAL.has(c)||RIGHT.has(c);
const isMark=c=>/[\u064B-\u065F\u0670\u06D6-\u06ED]/.test(c);
function neighbor(a,i,s){
  for(let j=i+s;j>=0&&j<a.length;j+=s){
    if(isMark(a[j]))continue;
    return a[j];
  }
  return null;
}
function shapeChars(text){
  const a=[...String(text??'')],out=[],digitFlags=[];
  for(let i=0;i<a.length;i++){
    const c=a[i];

    // لام + ألف لها أشكال طباعية خاصة. معالجتها هنا تمنع ظهور "لا / لأ / لإ / لآ" بصورة مفككة.
    if(c==='ل' && LAM_ALEF[a[i+1]]){
      const pr=neighbor(a,i,-1);
      const joinedPrev=!!(pr&&canL(pr)&&canR('ل'));
      out.push(LAM_ALEF[a[i+1]][joinedPrev?1:0]);
      digitFlags.push(false);
      i++;
      continue;
    }

    if(PF[c]){
      const pr=neighbor(a,i,-1),nx=neighbor(a,i,1);
      const jp=!!(pr&&canL(pr)&&canR(c));
      const jn=!!(nx&&canL(c)&&canR(nx));
      const [iso,fin,ini,med]=PF[c];
      out.push(jp&&jn&&med?med:jp&&fin?fin:jn&&ini?ini:iso);
      digitFlags.push(false);
    }else if(/[0-9\u0660-\u0669]/.test(c)){
      out.push(c);digitFlags.push(true);
    }else if(MIRROR[c]){
      out.push(MIRROR[c]);digitFlags.push(false);
    }else{
      out.push(c);digitFlags.push(false);
    }
  }

  // لأن السطر العربي يُعكس للعرض داخل PDF، نعكس سلاسل الأرقام أولًا حتى تبقى أرقامها بالترتيب الصحيح.
  for(let i=0;i<out.length;){
    if(digitFlags[i]){
      let j=i+1;
      while(j<out.length&&digitFlags[j])j++;
      const r=out.slice(i,j).reverse();
      out.splice(i,j-i,...r);
      i=j;
    }else i++;
  }
  return out;
}
function vis(text){
  return String(text??'').trim().split('\n').map(line=>shapeChars(line).reverse().join('')).join('\n');
}
function b64bytes(s){const b=atob(s),u=new Uint8Array(b.length);for(let i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u}
const MM=72/25.4,A4W=210*MM,A4H=297*MM;
const C={blue:[49,90,145],teal1:[19,138,139],teal2:[35,165,118],red:[166,25,25],gray:[231,231,231],dark:[20,20,20],border:[190,190,190]};
const rgbc=a=>PDFLib.rgb(a[0]/255,a[1]/255,a[2]/255), mm=n=>n*MM;
let PDF_EN_FONT=null,PDF_EN_BOLD=null;
const hasArabic=t=>/[\u0600-\u06FF]/.test(String(t||''));
const hasLatin=t=>/[A-Za-z]/.test(String(t||''));
function mixedRuns(text){
  text=String(text??'');
  if(!hasArabic(text)||!hasLatin(text)) return [{type:hasArabic(text)?'ar':'en',text}];
  const out=[];let cur='',type=null;
  const ctype=ch=>/[\u0600-\u06FF]/.test(ch)?'ar':/[A-Za-z]/.test(ch)?'en':null;
  for(const ch of [...text]){
    const t=ctype(ch);
    if(t===null){cur+=ch;continue}
    if(type===null){type=t;cur+=ch;continue}
    if(t===type){cur+=ch;continue}
    if(cur)out.push({type,text:cur});
    type=t;cur=ch;
  }
  if(cur)out.push({type:type||'en',text:cur});
  return out;
}
function runVisual(run){return run.type==='ar'?vis(run.text):run.text}
function runFont(arFont,run){return run.type==='ar'?arFont:(PDF_EN_FONT||arFont)}
function textWidth(font,text,size){return mixedRuns(text).reduce((n,r)=>n+runFont(font,r).widthOfTextAtSize(runVisual(r),size),0)}
function drawMixed(page,arFont,x,y,w,text,size,color,align='right'){
  text=String(text??''); if(!text)return;
  const runs=mixedRuns(text), widths=runs.map(r=>runFont(arFont,r).widthOfTextAtSize(runVisual(r),size)), total=widths.reduce((a,b)=>a+b,0);
  const boxX=mm(x), boxW=mm(w), yy=A4H-mm(y)-size, rtl=hasArabic(text);
  if(!rtl){
    let xx=align==='right'?boxX+boxW-total:align==='center'?boxX+(boxW-total)/2:boxX;
    for(let i=0;i<runs.length;i++){const r=runs[i],t=runVisual(r),f=runFont(arFont,r);page.drawText(t,{x:xx,y:yy,font:f,size,color:rgbc(color)});xx+=widths[i]}
    return;
  }
  let cursor=align==='left'?boxX+total:align==='center'?boxX+(boxW+total)/2:boxX+boxW;
  for(let i=0;i<runs.length;i++){const r=runs[i],t=runVisual(r),f=runFont(arFont,r),rw=widths[i];page.drawText(t,{x:cursor-rw,y:yy,font:f,size,color:rgbc(color)});cursor-=rw}
}
function wrapText(font,text,maxW,size,maxLines=8){text=String(text??'').trim();if(!text)return[];const result=[];for(const para of text.split('\n')){const words=para.split(/\s+/).filter(Boolean);if(!words.length){result.push('');continue}let line='';for(const word of words){const cand=line?line+' '+word:word;if(textWidth(font,cand,size)<=maxW){line=cand;continue}if(line){result.push(line);line='';if(result.length>=maxLines)break}if(textWidth(font,word,size)>maxW){let chunk='';for(const ch of [...word]){const test=chunk+ch;if(chunk&&textWidth(font,test,size)>maxW){result.push(chunk);chunk=ch;if(result.length>=maxLines)break}else chunk=test}if(result.length>=maxLines)break;line=chunk}else line=word}if(result.length>=maxLines)break;if(line)result.push(line);if(result.length>=maxLines)break}return result.slice(0,maxLines)}
function rectTop(page,x,y,w,h,fill=null,border=C.dark,bw=.35){page.drawRectangle({x:mm(x),y:A4H-mm(y+h),width:mm(w),height:mm(h),borderColor:rgbc(border),borderWidth:mm(bw),color:fill?rgbc(fill):undefined})}
function lineTop(page,x1,y1,x2,y2,color=C.dark,bw=.35){page.drawLine({start:{x:mm(x1),y:A4H-mm(y1)},end:{x:mm(x2),y:A4H-mm(y2)},color:rgbc(color),thickness:mm(bw)})}
function drawTextTop(page,font,x,y,w,text,size=12.5,color=C.dark,align='right'){drawMixed(page,font,x,y,w,text,size,color,align)}
function cell(page,font,x,y,w,h,text='',fill=null,color=C.dark,size=13,align='right',pad=2,top=false){rectTop(page,x,y,w,h,fill);text=String(text??'').trim();if(!text)return;const usable=mm(w-2*pad),lh=Math.max(mm(5.2),size*1.36),max=Math.max(1,Math.floor((mm(h-2*pad))/lh)),lines=wrapText(font,text,usable,size,max);if(!lines.length)return;let topPt=mm(y+pad);if(!top)topPt=mm(y)+(mm(h)-lines.length*lh)/2;for(let i=0;i<lines.length;i++){const yyTop=(topPt+i*lh)/MM;drawMixed(page,font,x+pad,yyTop,w-2*pad,lines[i],size,color,align)}}
function bar(page,y){const start=[19,138,139],end=[35,165,118],steps=84,seg=210/steps;for(let i=0;i<steps;i++){const t=i/(steps-1),c=[Math.round(start[0]+(end[0]-start[0])*t),Math.round(start[1]+(end[1]-start[1])*t),Math.round(start[2]+(end[2]-start[2])*t)];page.drawRectangle({x:mm(i*seg),y:A4H-mm(y+7),width:mm(seg+.08),height:mm(7),color:rgbc(c)})}}
function header(page,font,logo){bar(page,0);const lw=mm(38),lh=lw*(logo.height/logo.width);page.drawImage(logo,{x:mm(12),y:A4H-mm(11)-lh,width:lw,height:lh});lineTop(page,10,39,200,39);let y=11;for(const s of ['المملكة العربية السعودية','وزارة التعليم','الإدارة العامة للتعليم بمنطقة المدينة المنورة','متوسطة جميلة بنت عمر بن الخطاب']){drawTextTop(page,font,102,y,96,s,12.5,C.dark,'right');y+=5.4}}
function drawReport(page,font,logo,d){header(page,font,logo);drawTextTop(page,font,30,43,150,'تقرير تنفيذ '+(d.program||'........................'),20,C.blue,'center');let y=55,h=14;cell(page,font,165,y,35,h,'اسم البرنامج',C.gray,C.blue,12.5,'center');cell(page,font,105,y,60,h,d.program,null,C.dark,12.5);cell(page,font,70,y,35,h,'تاريخ التنفيذ',C.gray,C.blue,12.5,'center');cell(page,font,10,y,60,h,d.date,null,C.dark,12.5,'center');y+=h;cell(page,font,165,y,35,h,'الفئة المستهدفة',C.gray,C.blue,12.5,'center');cell(page,font,105,y,60,h,d.target,null,C.dark,12.5);cell(page,font,70,y,35,h,'عدد المستفيدات',C.gray,C.blue,12.5,'center');cell(page,font,10,y,60,h,d.count,null,C.dark,12.5,'center');y+=h;for(const [lab,txt,rh] of [['الهدف من البرنامج',d.goal,30],['إجراءات التنفيذ',d.steps,34],['النتائج والمخرجات',d.results,34]]){cell(page,font,165,y,35,rh,lab,C.gray,C.blue,12.5,'center');cell(page,font,10,y,155,rh,txt,null,C.dark,12.5,'right',2,rh>=30);y+=rh}drawTextTop(page,font,10,213,190,'معدة التقرير',13.5,C.red,'right');drawTextTop(page,font,10,220,190,d.preparer||'—',13.5,C.dark,'right');drawTextTop(page,font,105,237,95,'وكيلة الشؤون التعليمية',13.5,C.red,'right');drawTextTop(page,font,10,237,95,'مديرة المدرسة',13.5,C.red,'right');drawTextTop(page,font,105,245,95,'تهاني شبكشي',13.5,C.dark,'right');drawTextTop(page,font,10,245,95,'حنان الغامدي',13.5,C.dark,'right');bar(page,290)}
async function embedDataImage(doc,data){if(!data)return null;const m=data.match(/^data:image\/(jpeg|jpg|png);base64,(.+)$/i);if(!m)return null;const u=b64bytes(m[2]);return m[1].toLowerCase()==='png'?doc.embedPng(u):doc.embedJpg(u)}
function fitImg(page,img,x,y,w,h){if(!img)return;const r=Math.min(mm(w)/img.width,mm(h)/img.height),rw=img.width*r,rh=img.height*r;page.drawImage(img,{x:mm(x)+(mm(w)-rw)/2,y:A4H-mm(y+h)+(mm(h)-rh)/2,width:rw,height:rh})}
async function drawEvidence(page,font,logo,doc,d){header(page,font,logo);drawTextTop(page,font,30,44,150,'شواهد تنفيذ البرنامج',21,C.blue,'center');drawTextTop(page,font,25,53,160,(d.program||'........................')+'   '+d.date,12.5,[85,85,85],'center');const pos=[[107,63],[12,63],[107,146],[12,146]];for(let i=0;i<4;i++){const [x,y]=pos[i];rectTop(page,x,y,91,79,null,C.border,.35);if(d.images[i]){try{fitImg(page,await embedDataImage(doc,d.images[i]),x+2,y+2,87,75)}catch(e){}}}lineTop(page,10,232,200,232,[205,205,205],.3);for(const [x,w,l,v] of [[136.7,63.3,'معدة التقرير',d.preparer||'—'],[73.4,63.3,'وكيلة الشؤون التعليمية','تهاني شبكشي'],[10,63.4,'مديرة المدرسة','حنان الغامدي']]){drawTextTop(page,font,x,237,w,l,12.5,C.red,'center');drawTextTop(page,font,x,246,w,v,12.5,C.dark,'center')}bar(page,290)}
async function makePdfClient(d){if(!window.PDFLib||!window.fontkit)throw Error('تعذر تحميل محرك PDF. تحققي من الاتصال بالإنترنت ثم أعيدي المحاولة.');const doc=await PDFLib.PDFDocument.create();doc.registerFontkit(window.fontkit);const fr=await fetch(PDF_FONT_URL,{mode:'cors',cache:'force-cache'});if(!fr.ok)throw Error('تعذر تحميل الخط العربي. أعيدي المحاولة.');const font=await doc.embedFont(new Uint8Array(await fr.arrayBuffer()),{subset:false});PDF_EN_FONT=await doc.embedFont(PDFLib.StandardFonts.Helvetica);PDF_EN_BOLD=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);const logo=await doc.embedJpg(b64bytes(PDF_LOGO_B64));const p1=doc.addPage([A4W,A4H]);drawReport(p1,font,logo,d);const imgs=(d.images||[]).slice(0,12),pages=Math.max(1,Math.ceil(imgs.length/4));for(let i=0;i<pages;i++){const p=doc.addPage([A4W,A4H]);await drawEvidence(p,font,logo,doc,{...d,images:imgs.slice(i*4,i*4+4),evidencePage:i+1,evidencePages:pages})}doc.setTitle('تقرير تنفيذ');doc.setCreator('مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب');return await doc.save()}
$('pdfBtn').onclick=async()=>{const b=$('pdfBtn'),old=b.textContent;b.disabled=true;b.textContent='جارٍ إنشاء PDF...';show('جارٍ إنشاء ملف PDF...');try{const selectedEvidence=evidenceImages.map((img,i)=>({img,title:(typeof evidenceTitles!=='undefined'?evidenceTitles[i]:'')||''})).filter(x=>x.img).slice(0,12);const payload={program:$('program').value.trim(),date:hijriText(),target:$('target').value.trim(),count:$('count').value.trim(),goal:$('goal').value,steps:$('steps').value,results:$('results').value,preparer:$('preparer').value.trim(),images:selectedEvidence.map(x=>x.img),evidenceTitles:selectedEvidence.map(x=>x.title)};const bytes=await makePdfClient(payload);if(!bytes||bytes.length<1000)throw Error('لم يتم إنشاء ملف PDF بشكل صحيح.');await incrementCounter();const blob=new Blob([bytes],{type:'application/pdf'}),name=($('program').value.trim()||'تقرير').replace(/[\\/:*?"<>|]+/g,'-').slice(0,50),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`تقرير-${name}.pdf`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);show('تم إنشاء ملف PDF بنجاح. يدعم النص العربي والإنجليزي بدون رؤوس أو تذييلات من Safari.')}catch(e){console.error(e);show(e.message||'تعذر إنشاء ملف PDF.')}finally{b.disabled=false;b.textContent=old}};
