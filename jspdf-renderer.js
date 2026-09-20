(function(){
  const legacyMakePdfClient=typeof makePdfClient==='function'?makePdfClient:null;
  const byId=id=>document.getElementById(id);
  const deputyMap={
    educational:{label:'وكيلة الشؤون التعليمية',name:'تهاني شبكشي'},
    student:{label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
    none:null
  };
  function selectedReportType(){
    const el=byId('reportType');
    if(!el)return 'برنامج';
    if(el.value==='other'){
      const custom=String((byId('otherReportType')&&byId('otherReportType').value)||'').trim();
      return custom||'أخرى';
    }
    return el.value||'برنامج';
  }
  function selectedDeputy(){
    const el=byId('deputyChoice');
    return deputyMap[(el&&el.value)||'educational']||null;
  }
  const FONT_URL='https://cdn.jsdelivr.net/gh/notofonts/notofonts.github.io/fonts/NotoNaskhArabic/hinted/ttf/NotoNaskhArabic-Bold.ttf';
  const FONT_FILE='NotoNaskhArabic-Bold.ttf';
  const AR_FONT='NotoNaskhArabic';
  let cachedFontB64=null;

  const J={
    blue:[49,90,145], teal1:[19,138,139], teal2:[35,165,118],
    red:[166,25,25], gray:[231,231,231], dark:[20,20,20], border:[190,190,190],
    purple:[218,167,201]
  };
  const hasAr=t=>/[\u0600-\u06FF]/.test(String(t||''));
  const hasEn=t=>/[A-Za-z0-9\u0660-\u0669]/.test(String(t||''));

  function toB64(buf){
    const bytes=new Uint8Array(buf),chunk=0x8000;
    let out='';
    for(let i=0;i<bytes.length;i+=chunk){
      out+=String.fromCharCode.apply(null,bytes.subarray(i,Math.min(i+chunk,bytes.length)));
    }
    return btoa(out);
  }
  async function loadArabicFont(){
    if(cachedFontB64)return cachedFontB64;
    const r=await fetch(FONT_URL,{mode:'cors',cache:'force-cache'});
    if(!r.ok)throw Error('تعذر تحميل الخط العربي. أعيدي المحاولة.');
    cachedFontB64=toB64(await r.arrayBuffer());
    return cachedFontB64;
  }
  function setRgb(doc,method,c){doc[method](c[0],c[1],c[2])}
  function setFont(doc,type,size){
    if(type==='ar')doc.setFont(AR_FONT,'bold');
    else doc.setFont('helvetica','normal');
    doc.setFontSize(size);
  }
  function splitRuns(text){
    text=String(text??'');
    if(!text)return[];
    if(hasAr(text)&&!hasEn(text))return[{type:'ar',text}];
    if(!hasAr(text))return[{type:'en',text}];
    const out=[];let cur='',type=null;
    const ct=ch=>/[\u0600-\u06FF]/.test(ch)?'ar':/[A-Za-z0-9\u0660-\u0669]/.test(ch)?'en':null;
    for(const ch of [...text]){
      const t=ct(ch);
      if(t===null){cur+=ch;continue}
      if(type===null){type=t;cur+=ch;continue}
      if(t===type){cur+=ch;continue}
      if(cur)out.push({type,text:cur});
      type=t;cur=ch;
    }
    if(cur)out.push({type:type||'en',text:cur});
    return out;
  }
  function arForWidth(doc,text){
    const raw=String(text??'');
    return typeof doc.processArabic==='function'?doc.processArabic(raw):raw;
  }
  function runWidth(doc,run,size){
    setFont(doc,run.type,size);
    const t=run.type==='ar'?arForWidth(doc,run.text):run.text;
    return doc.getTextWidth(t);
  }
  function textWidthJ(doc,text,size){
    return splitRuns(text).reduce((n,r)=>n+runWidth(doc,r,size),0);
  }
  function drawJText(doc,x,top,w,text,size=12.5,color=J.dark,align='right'){
    text=String(text??'');if(!text)return;
    const runs=splitRuns(text);
    const widths=runs.map(r=>runWidth(doc,r,size));
    const total=widths.reduce((a,b)=>a+b,0);
    const rtl=hasAr(text);
    const baseline=top+(size*0.352778)+0.3;
    setRgb(doc,'setTextColor',color);

    if(!rtl){
      let cursor=align==='right'?x+w-total:align==='center'?x+(w-total)/2:x;
      for(let i=0;i<runs.length;i++){
        const r=runs[i];setFont(doc,'en',size);
        doc.text(r.text,cursor,baseline,{baseline:'alphabetic'});
        cursor+=widths[i];
      }
      return;
    }

    let cursor=align==='left'?x+total:align==='center'?x+(w+total)/2:x+w;
    for(let i=0;i<runs.length;i++){
      const r=runs[i],rw=widths[i];
      if(r.type==='ar'){
        setFont(doc,'ar',size);
        // نرسل النص العربي بصورته الأصلية. jsPDF يشكّله تلقائيًا عبر Arabic plugin،
        // ثم R2L يعكس اتجاه العرض مرة واحدة فقط. معالجة النص يدويًا هنا كانت تسبب قلبه كأنه في مرآة.
        doc.text(r.text,cursor,baseline,{align:'right',R2L:true,baseline:'alphabetic'});
      }else{
        setFont(doc,'en',size);
        doc.text(r.text,cursor-rw,baseline,{align:'left',baseline:'alphabetic'});
      }
      cursor-=rw;
    }
  }
  function wrapJ(doc,text,maxW,size,maxLines=100000){
    text=String(text??'').trim();if(!text)return[''];
    const result=[];
    for(const para of text.split('\n')){
      const words=para.split(/\s+/).filter(Boolean);
      if(!words.length){result.push('');continue}
      let line='';
      for(const word of words){
        const cand=line?line+' '+word:word;
        if(textWidthJ(doc,cand,size)<=maxW){line=cand;continue}
        if(line){result.push(line);line='';if(result.length>=maxLines)break}
        if(textWidthJ(doc,word,size)>maxW){
          let chunk='';
          for(const ch of [...word]){
            const test=chunk+ch;
            if(chunk&&textWidthJ(doc,test,size)>maxW){
              result.push(chunk);chunk=ch;
              if(result.length>=maxLines)break;
            }else chunk=test;
          }
          line=chunk;
        }else line=word;
        if(result.length>=maxLines)break;
      }
      if(result.length>=maxLines)break;
      if(line)result.push(line);
    }
    return result.slice(0,maxLines);
  }
  function rectJ(doc,x,y,w,h,fill=null,border=J.dark,bw=.35){
    setRgb(doc,'setDrawColor',border);doc.setLineWidth(bw);
    if(fill){setRgb(doc,'setFillColor',fill);doc.rect(x,y,w,h,'FD')}
    else doc.rect(x,y,w,h,'S');
  }
  function lineJ(doc,x1,y1,x2,y2,color=[205,205,205],bw=.3){
    setRgb(doc,'setDrawColor',color);doc.setLineWidth(bw);doc.line(x1,y1,x2,y2);
  }
  function barJ(doc,y){
    const steps=84,seg=210/steps;
    for(let i=0;i<steps;i++){
      const t=i/(steps-1),c=[
        Math.round(J.teal1[0]+(J.teal2[0]-J.teal1[0])*t),
        Math.round(J.teal1[1]+(J.teal2[1]-J.teal1[1])*t),
        Math.round(J.teal1[2]+(J.teal2[2]-J.teal1[2])*t)
      ];
      setRgb(doc,'setFillColor',c);doc.rect(i*seg,y,seg+.08,7,'F');
    }
  }
  function headerJ(doc){
    barJ(doc,0);
    try{doc.addImage('data:image/jpeg;base64,'+PDF_LOGO_B64,'JPEG',12,11,38,23.6)}catch(e){}
    lineJ(doc,10,39,200,39,[60,60,60],.3);
    let y=11;
    for(const s of ['المملكة العربية السعودية','وزارة التعليم','الإدارة العامة للتعليم بمنطقة المدينة المنورة','متوسطة جميلة بنت عمر بن الخطاب']){
      drawJText(doc,102,y,96,s,12,J.dark,'right');y+=5.4;
    }
  }
  function cellJ(doc,x,y,w,h,text='',fill=null,color=J.dark,size=12.5,align='right',pad=2,top=false){
    rectJ(doc,x,y,w,h,fill,J.dark,.35);
    text=String(text??'').trim();if(!text)return;
    const lh=Math.max(5.6,size*0.352778*1.28);
    const max=Math.max(1,Math.floor((h-2*pad)/lh));
    const lines=wrapJ(doc,text,w-2*pad,size,max);
    let yy=top?y+pad:y+(h-lines.length*lh)/2;
    for(const line of lines){drawJText(doc,x+pad,yy,w-2*pad,line,size,color,align);yy+=lh}
  }
  function reportLineHeightJ(size=12.5){return Math.max(5.8,size*0.352778*1.32)}
  function valueHeightJ(doc,text,w,size=12.5,minH=14){
    const lines=wrapJ(doc,text,w-4,size);
    return Math.max(minH,lines.length*reportLineHeightJ(size)+4);
  }
  function drawValueCellJ(doc,x,y,w,h,lines,size=12.5,pad=2){
    rectJ(doc,x,y,w,h,null,J.dark,.35);
    const lh=reportLineHeightJ(size);
    let yy=y+pad;
    for(const line of lines){drawJText(doc,x+pad,yy,w-2*pad,line,size,J.dark,'right');yy+=lh}
  }
  function drawPairRowJ(doc,y,h,leftLabel,leftText,rightLabel,rightText,fill,labelColor,labelSize){
    cellJ(doc,165,y,35,h,leftLabel,fill,labelColor,labelSize,'center');
    drawValueCellJ(doc,105,y,60,h,wrapJ(doc,leftText,56,12.5),12.5,2);
    cellJ(doc,70,y,35,h,rightLabel,fill,labelColor,labelSize,'center');
    drawValueCellJ(doc,10,y,60,h,wrapJ(doc,rightText,56,12.5),12.5,2);
  }
  function drawLongJ(doc,y,h,label,lines,fill,labelColor,labelSize){
    cellJ(doc,165,y,35,h,label,fill,labelColor,labelSize,'center');
    drawValueCellJ(doc,10,y,155,h,lines,12.5,2);
  }
  function frameJ(doc,title,titleColor,continuation=false){
    headerJ(doc);
    const t=(continuation?'متابعة ':'')+title;
    const lines=wrapJ(doc,t,150,20,3);
    drawJText(doc,30,43,150,lines[0]||t,20,titleColor,'center');
    if(lines[1])drawJText(doc,30,49.5,150,lines[1],16,titleColor,'center');
    barJ(doc,290);
  }
  function signaturesJ(doc,d,deputy){
    drawJText(doc,10,213,190,'معدة التقرير',13.5,J.red,'right');
    drawJText(doc,10,220,190,d.preparer||'—',13.5,J.dark,'right');
    if(deputy){
      drawJText(doc,105,237,95,deputy.label,13.5,J.red,'right');
      drawJText(doc,105,245,95,deputy.name,13.5,J.dark,'right');
    }
    drawJText(doc,10,237,95,'مديرة المدرسة',13.5,J.red,'right');
    drawJText(doc,10,245,95,'حنان الغامدي',13.5,J.dark,'right');
  }
  function addReportPagesJ(doc,d){
    const purpleSelected=byId('tableColor')&&byId('tableColor').value==='purple';
    const fill=purpleSelected?J.purple:J.gray;
    const labelColor=purpleSelected?J.dark:J.blue;
    const labelSize=purpleSelected?13.2:12.5;
    const titleColor=purpleSelected?J.dark:J.blue;
    const reportType=selectedReportType();
    const deputy=selectedDeputy();
    const title='تقرير تنفيذ '+reportType+' '+(d.program||'........................');
    const bottom=205;
    let y=55;
    frameJ(doc,title,titleColor,false);

    const row1H=Math.max(valueHeightJ(doc,d.program,60,12.5,14),valueHeightJ(doc,d.date,60,12.5,14));
    drawPairRowJ(doc,y,row1H,'اسم '+reportType,d.program,'تاريخ التنفيذ',d.date,fill,labelColor,labelSize);y+=row1H;

    const row2H=Math.max(valueHeightJ(doc,d.target,60,12.5,14),valueHeightJ(doc,d.count,60,12.5,14));
    if(y+row2H>bottom){doc.addPage();frameJ(doc,title,titleColor,true);y=55}
    drawPairRowJ(doc,y,row2H,'الفئة المستهدفة',d.target,'عدد المستفيدات',d.count,fill,labelColor,labelSize);y+=row2H;

    const sections=[
      {label:'الهدف من '+reportType,text:d.goal,minH:30},
      {label:'إجراءات التنفيذ',text:d.steps,minH:34},
      {label:'المخرجات وقياس الأثر',text:d.results,minH:34}
    ];
    const lh=reportLineHeightJ(12.5);
    for(const sec of sections){
      const lines=wrapJ(doc,sec.text,151,12.5),all=lines.length?lines:[''];
      let offset=0,part=0;
      while(offset<all.length){
        const remaining=all.length-offset;
        const need=Math.max(sec.minH,remaining*lh+4);
        const avail=bottom-y;
        if(need<=avail){
          drawLongJ(doc,y,need,part?sec.label+' - تابع':sec.label,all.slice(offset),fill,labelColor,labelSize);
          y+=need;offset=all.length;break;
        }
        if(avail<Math.max(18,lh+4)){doc.addPage();frameJ(doc,title,titleColor,true);y=55;continue}
        const take=Math.min(remaining,Math.max(1,Math.floor((avail-4)/lh)));
        const chunk=all.slice(offset,offset+take),h=Math.min(avail,chunk.length*lh+4);
        drawLongJ(doc,y,h,part?sec.label+' - تابع':sec.label,chunk,fill,labelColor,labelSize);
        offset+=take;part++;
        if(offset<all.length){doc.addPage();frameJ(doc,title,titleColor,true);y=55}else y+=h;
      }
    }
    signaturesJ(doc,d,deputy);
  }
  function fitImageJ(doc,data,x,y,w,h){
    const p=doc.getImageProperties(data),r=Math.min(w/p.width,h/p.height),rw=p.width*r,rh=p.height*r;
    doc.addImage(data,'JPEG',x+(w-rw)/2,y+(h-rh)/2,rw,rh,undefined,'FAST');
  }
  function addEvidencePageJ(doc,d,images,titles){
    doc.addPage();
    const purpleSelected=byId('tableColor')&&byId('tableColor').value==='purple';
    const titleColor=purpleSelected?J.dark:J.blue;
    const reportType=selectedReportType(),deputy=selectedDeputy();
    headerJ(doc);
    drawJText(doc,30,44,150,'شواهد تنفيذ '+reportType,21,titleColor,'center');
    drawJText(doc,25,53,160,(d.program||'........................')+'   '+d.date,12.5,[85,85,85],'center');

    const pos=[[107,63],[12,63],[107,146],[12,146]];
    for(let i=0;i<4;i++){
      const [x,y]=pos[i],caption=String(titles[i]||'').trim();
      rectJ(doc,x,y,91,79,null,J.border,.35);
      if(images[i]){
        try{fitImageJ(doc,images[i],x+2,y+2,87,caption?63:75)}catch(e){}
      }
      if(caption){
        lineJ(doc,x+2,y+67,x+89,y+67,[220,220,220],.25);
        const lines=wrapJ(doc,caption,87,11.5,2);
        let yy=y+68;
        for(const line of lines){drawJText(doc,x+2,yy,87,line,11.5,J.dark,'center');yy+=4.7}
      }
    }
    lineJ(doc,10,232,200,232,[205,205,205],.3);
    const blocks=[[136.7,63.3,'معدة التقرير',d.preparer||'—'],[10,63.4,'مديرة المدرسة','حنان الغامدي']];
    if(deputy)blocks.splice(1,0,[73.4,63.3,deputy.label,deputy.name]);
    for(const [x,w,l,v] of blocks){
      drawJText(doc,x,237,w,l,12.5,J.red,'center');
      drawJText(doc,x,246,w,v,12.5,J.dark,'center');
    }
    barJ(doc,290);
  }

  makePdfClient=async function(d){
    if(!window.jspdf||!window.jspdf.jsPDF){
      if(legacyMakePdfClient)return legacyMakePdfClient(d);
      throw Error('تعذر تحميل محرك PDF العربي. تحققي من الاتصال ثم أعيدي المحاولة.');
    }
    const {jsPDF}=window.jspdf;
    const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true,putOnlyUsedFonts:true});
    const fontB64=await loadArabicFont();
    doc.addFileToVFS(FONT_FILE,fontB64);
    doc.addFont(FONT_FILE,AR_FONT,'bold','Identity-H');
    if(typeof doc.setLanguage==='function')doc.setLanguage('ar-SA');
    if(typeof doc.viewerPreferences==='function')doc.viewerPreferences({Direction:'R2L',DisplayDocTitle:true});

    addReportPagesJ(doc,d);

    const imgs=(d.images||[]).slice(0,12);
    const titles=(d.evidenceTitles||[]).slice(0,12);
    const pages=Math.max(1,Math.ceil(imgs.length/4));
    for(let i=0;i<pages;i++)addEvidencePageJ(doc,d,imgs.slice(i*4,i*4+4),titles.slice(i*4,i*4+4));

    doc.setProperties({
      title:'تقرير تنفيذ '+selectedReportType(),
      creator:'مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب'
    });
    return new Uint8Array(doc.output('arraybuffer'));
  };
})();