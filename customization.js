(function(){
  const byId=id=>document.getElementById(id);
  const deputyMap={
    educational:{label:'وكيلة الشؤون التعليمية',name:'تهاني شبكشي'},
    student:{label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
    none:null
  };
  const purple=[218,167,201]; // #DAA7C9
  function toggleOtherReportType(){
    const type=byId('reportType');
    const wrap=byId('otherReportTypeWrap');
    if(!type||!wrap)return;
    wrap.style.display=type.value==='other'?'block':'none';
  }
  function selectedReportType(){
    const el=byId('reportType');
    if(!el)return 'برنامج';
    if(el.value==='other'){
      const custom=String((byId('otherReportType')&&byId('otherReportType').value)||'').trim();
      return custom||'أخرى';
    }
    return el.value||'برنامج';
  }
  function isPurpleSelected(){
    const el=byId('tableColor');
    return !!(el&&el.value==='purple');
  }
  function selectedDeputy(){
    const el=byId('deputyChoice');
    return deputyMap[(el&&el.value)||'educational']||null;
  }
  function selectedTableFill(){
    return isPurpleSelected()?purple:C.gray;
  }
  function tableLabelColor(){
    return isPurpleSelected()?C.dark:C.blue;
  }
  function tableLabelSize(){
    // خط المهند المستخدم في PDF هو AL-Mohanad Bold أصلًا؛ نزيد الحجم قليلًا عند اختيار البنفسجي لإبراز الـ Bold بصريًا.
    return isPurpleSelected()?13.2:12.5;
  }

  // حفظ خيارات التخصيص مع بقية بيانات التقرير واستعادتها على الجهاز نفسه.
  try{
    const saved=JSON.parse(localStorage.getItem('schoolReport')||'{}');
    if(byId('reportType')&&saved.reportType)byId('reportType').value=saved.reportType;
    if(byId('otherReportType')&&saved.otherReportType)byId('otherReportType').value=saved.otherReportType;
    toggleOtherReportType();
    if(byId('deputyChoice')&&saved.deputyChoice)byId('deputyChoice').value=saved.deputyChoice;
    if(byId('tableColor')&&saved.tableColor)byId('tableColor').value=saved.tableColor;
  }catch(e){}
  const saveBtn=byId('saveBtn');
  if(saveBtn){
    const oldSave=saveBtn.onclick;
    saveBtn.onclick=function(){
      if(oldSave)oldSave.call(this);
      try{
        const saved=JSON.parse(localStorage.getItem('schoolReport')||'{}');
        saved.reportType=byId('reportType').value;
        saved.otherReportType=byId('otherReportType')?byId('otherReportType').value:'';
        saved.deputyChoice=byId('deputyChoice').value;
        saved.tableColor=byId('tableColor').value;
        localStorage.setItem('schoolReport',JSON.stringify(saved));
      }catch(e){}
    };
  }
  if(byId('reportType')){
    byId('reportType').addEventListener('change',toggleOtherReportType);
    toggleOtherReportType();
  }
  const clearBtn=byId('clearBtn');
  if(clearBtn){
    const oldClear=clearBtn.onclick;
    clearBtn.onclick=function(){
      if(oldClear)oldClear.call(this);
      try{
        const baseIds=['program','target','count','goal','steps','results','preparer'];
        const cleared=baseIds.every(id=>!String(byId(id).value||'').trim())&&!localStorage.getItem('schoolReport');
        if(cleared){
          byId('reportType').value='برنامج';
          if(byId('otherReportType'))byId('otherReportType').value='';
          toggleOtherReportType();
          byId('deputyChoice').value='educational';
          byId('tableColor').value='current';
        }
      }catch(e){}
    };
  }

  // نستبدل فقط رسم التقرير والشواهد، مع إبقاء محرك PDF وبقية الخصائص كما هي.
  drawReport=function(page,font,logo,d){
    const tableFill=selectedTableFill();
    const labelColor=tableLabelColor();
    const labelSize=tableLabelSize();
    const titleColor=isPurpleSelected()?C.dark:C.blue;
    const reportType=selectedReportType();
    const deputy=selectedDeputy();
    header(page,font,logo);
    drawTextTop(page,font,30,43,150,'تقرير تنفيذ '+reportType+' '+(d.program||'........................'),20,titleColor,'center');
    let y=55,h=14;
    cell(page,font,165,y,35,h,'اسم '+reportType,tableFill,labelColor,labelSize,'center');
    cell(page,font,105,y,60,h,d.program,null,C.dark,12.5);
    cell(page,font,70,y,35,h,'تاريخ التنفيذ',tableFill,labelColor,labelSize,'center');
    cell(page,font,10,y,60,h,d.date,null,C.dark,12.5,'center');
    y+=h;
    cell(page,font,165,y,35,h,'الفئة المستهدفة',tableFill,labelColor,labelSize,'center');
    cell(page,font,105,y,60,h,d.target,null,C.dark,12.5);
    cell(page,font,70,y,35,h,'عدد المستفيدات',tableFill,labelColor,labelSize,'center');
    cell(page,font,10,y,60,h,d.count,null,C.dark,12.5,'center');
    y+=h;
    for(const [lab,txt,rh] of [['الهدف من '+reportType,d.goal,30],['إجراءات التنفيذ',d.steps,34],['المخرجات وقياس الأثر',d.results,34]]){
      cell(page,font,165,y,35,rh,lab,tableFill,labelColor,labelSize,'center');
      cell(page,font,10,y,155,rh,txt,null,C.dark,12.5,'right',2,rh>=30);
      y+=rh;
    }
    drawTextTop(page,font,10,213,190,'معدة التقرير',13.5,C.red,'right');
    drawTextTop(page,font,10,220,190,d.preparer||'—',13.5,C.dark,'right');
    if(deputy){
      drawTextTop(page,font,105,237,95,deputy.label,13.5,C.red,'right');
      drawTextTop(page,font,105,245,95,deputy.name,13.5,C.dark,'right');
    }
    drawTextTop(page,font,10,237,95,'مديرة المدرسة',13.5,C.red,'right');
    drawTextTop(page,font,10,245,95,'حنان الغامدي',13.5,C.dark,'right');
    bar(page,290);
  };

  drawEvidence=async function(page,font,logo,doc,d){
    const deputy=selectedDeputy();
    const reportType=selectedReportType();
    const titleColor=isPurpleSelected()?C.dark:C.blue;
    header(page,font,logo);
    drawTextTop(page,font,30,44,150,'شواهد تنفيذ '+reportType,21,titleColor,'center');
    drawTextTop(page,font,25,53,160,(d.program||'........................')+'   '+d.date,12.5,[85,85,85],'center');
    const allImages=(d.images||[]).slice(0,4);
    const allTitles=(d.evidenceTitles||[]).slice(0,4);
    const pos=[[107,63],[12,63],[107,146],[12,146]];
    for(let i=0;i<4;i++){
      const [x,y]=pos[i],caption=String(allTitles[i]||'').trim();
      rectTop(page,x,y,91,79,null,C.border,.35);
      if(allImages[i]){
        try{
          const imageH=caption?63:75;
          fitImg(page,await embedDataImage(doc,allImages[i]),x+2,y+2,87,imageH);
        }catch(e){}
      }
      if(caption){
        lineTop(page,x+2,y+67,x+89,y+67,[220,220,220],.25);
        const lines=wrapText(font,caption,mm(87),11.5,2);
        for(let j=0;j<lines.length;j++)drawMixed(page,font,x+2,y+68+j*4.7,87,lines[j],11.5,C.dark,'center');
      }
    }
    lineTop(page,10,232,200,232,[205,205,205],.3);
    const blocks=[
      [136.7,63.3,'معدة التقرير',d.preparer||'—'],
      [10,63.4,'مديرة المدرسة','حنان الغامدي']
    ];
    if(deputy)blocks.splice(1,0,[73.4,63.3,deputy.label,deputy.name]);
    for(const [x,w,l,v] of blocks){
      drawTextTop(page,font,x,237,w,l,12.5,C.red,'center');
      drawTextTop(page,font,x,246,w,v,12.5,C.dark,'center');
    }
    bar(page,290);
  };

  // معالجة النصوص الطويلة: لا يتم قصها، بل تتمدد تلقائيًا إلى صفحات تقرير إضافية.
  function reportLineHeight(size){return Math.max(4.9,(size*1.22)/MM)}
  function wrapAllReportText(font,text,widthMm,size){
    const t=String(text??'').trim();
    if(!t)return [''];
    return wrapText(font,t,mm(widthMm),size,100000);
  }
  function drawReportTextCell(page,font,x,y,w,h,lines,size=12.5,pad=2){
    rectTop(page,x,y,w,h,null,C.dark,.35);
    const lh=reportLineHeight(size);
    for(let i=0;i<lines.length;i++){
      drawMixed(page,font,x+pad,y+pad+i*lh,w-2*pad,lines[i],size,C.dark,'right');
    }
  }
  function reportValueHeight(font,text,widthMm,size=12.5,minH=14){
    const lines=wrapAllReportText(font,text,widthMm-4,size);
    return Math.max(minH,lines.length*reportLineHeight(size)+4);
  }
  function drawReportPageFrame(page,font,logo,title,titleColor,continuation=false){
    header(page,font,logo);
    const t=continuation?'متابعة '+title:title;
    const titleLines=wrapText(font,t,mm(150),20,3);
    const first=titleLines[0]||t;
    drawTextTop(page,font,30,43,150,first,20,titleColor,'center');
    if(titleLines[1])drawTextTop(page,font,30,49,150,titleLines[1],16,titleColor,'center');
    bar(page,290);
  }
  function drawReportSignatures(page,font,d,deputy){
    drawTextTop(page,font,10,213,190,'معدة التقرير',13.5,C.red,'right');
    drawTextTop(page,font,10,220,190,d.preparer||'—',13.5,C.dark,'right');
    if(deputy){
      drawTextTop(page,font,105,237,95,deputy.label,13.5,C.red,'right');
      drawTextTop(page,font,105,245,95,deputy.name,13.5,C.dark,'right');
    }
    drawTextTop(page,font,10,237,95,'مديرة المدرسة',13.5,C.red,'right');
    drawTextTop(page,font,10,245,95,'حنان الغامدي',13.5,C.dark,'right');
  }
  function drawPairRow(page,font,y,h,leftLabel,leftText,rightLabel,rightText,tableFill,labelColor,labelSize){
    cell(page,font,165,y,35,h,leftLabel,tableFill,labelColor,labelSize,'center');
    drawReportTextCell(page,font,105,y,60,h,wrapAllReportText(font,leftText,56,12.5),12.5,2);
    cell(page,font,70,y,35,h,rightLabel,tableFill,labelColor,labelSize,'center');
    drawReportTextCell(page,font,10,y,60,h,wrapAllReportText(font,rightText,56,12.5),12.5,2);
  }
  function drawLongSection(page,font,y,h,label,lines,tableFill,labelColor,labelSize){
    cell(page,font,165,y,35,h,label,tableFill,labelColor,labelSize,'center');
    drawReportTextCell(page,font,10,y,155,h,lines,12.5,2);
  }
  function drawReportPages(doc,font,logo,d){
    const tableFill=selectedTableFill();
    const labelColor=tableLabelColor();
    const labelSize=tableLabelSize();
    const titleColor=isPurpleSelected()?C.dark:C.blue;
    const reportType=selectedReportType();
    const deputy=selectedDeputy();
    const title='تقرير تنفيذ '+reportType+' '+(d.program||'........................');
    const bottom=205;
    let page=doc.addPage([A4W,A4H]);
    let continuation=false;
    drawReportPageFrame(page,font,logo,title,titleColor,false);
    let y=55;

    const row1H=Math.max(
      reportValueHeight(font,d.program,60,12.5,14),
      reportValueHeight(font,d.date,60,12.5,14)
    );
    drawPairRow(page,font,y,row1H,'اسم '+reportType,d.program,'تاريخ التنفيذ',d.date,tableFill,labelColor,labelSize);
    y+=row1H;

    const row2H=Math.max(
      reportValueHeight(font,d.target,60,12.5,14),
      reportValueHeight(font,d.count,60,12.5,14)
    );
    if(y+row2H>bottom){
      page=doc.addPage([A4W,A4H]); continuation=true;
      drawReportPageFrame(page,font,logo,title,titleColor,true); y=55;
    }
    drawPairRow(page,font,y,row2H,'الفئة المستهدفة',d.target,'عدد المستفيدات',d.count,tableFill,labelColor,labelSize);
    y+=row2H;

    const sections=[
      {label:'الهدف من '+reportType,text:d.goal,minH:30},
      {label:'إجراءات التنفيذ',text:d.steps,minH:34},
      {label:'المخرجات وقياس الأثر',text:d.results,minH:34}
    ];
    const lh=reportLineHeight(12.5);

    for(const sec of sections){
      let lines=wrapAllReportText(font,sec.text,151,12.5);
      let offset=0,part=0;
      while(offset<lines.length){
        let remaining=lines.length-offset;
        let need=Math.max(sec.minH,remaining*lh+4);
        let avail=bottom-y;

        if(need<=avail){
          drawLongSection(page,font,y,need,part?sec.label+' - تابع':sec.label,lines.slice(offset),tableFill,labelColor,labelSize);
          y+=need; offset=lines.length; break;
        }

        if(avail<Math.max(18,lh+4)){
          page=doc.addPage([A4W,A4H]); continuation=true;
          drawReportPageFrame(page,font,logo,title,titleColor,true); y=55;
          continue;
        }

        const maxLines=Math.max(1,Math.floor((avail-4)/lh));
        const take=Math.min(remaining,maxLines);
        const chunk=lines.slice(offset,offset+take);
        const h=Math.min(avail,chunk.length*lh+4);
        drawLongSection(page,font,y,h,part?sec.label+' - تابع':sec.label,chunk,tableFill,labelColor,labelSize);
        offset+=take; part++;

        if(offset<lines.length){
          page=doc.addPage([A4W,A4H]); continuation=true;
          drawReportPageFrame(page,font,logo,title,titleColor,true); y=55;
        }else{
          y+=h;
        }
      }
    }
    drawReportSignatures(page,font,d,deputy);
  }

  // استبدال إنشاء الـ PDF ليدعم عددًا غير محدود عمليًا من أسطر النص،
  // مع إبقاء الشواهد 4 صور في كل صفحة وحتى 12 شاهدًا.
  makePdfClient=async function(d){
    if(!window.PDFLib||!window.fontkit)throw Error('تعذر تحميل محرك PDF. تحققي من الاتصال بالإنترنت ثم أعيدي المحاولة.');
    const doc=await PDFLib.PDFDocument.create();
    doc.registerFontkit(window.fontkit);
    const fr=await fetch(PDF_FONT_URL,{mode:'cors',cache:'force-cache'});
    if(!fr.ok)throw Error('تعذر تحميل خط المهند. أعيدي المحاولة.');
    const font=await doc.embedFont(new Uint8Array(await fr.arrayBuffer()),{subset:false});
    PDF_EN_FONT=await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    PDF_EN_BOLD=await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    const logo=await doc.embedJpg(b64bytes(PDF_LOGO_B64));

    drawReportPages(doc,font,logo,d);

    const imgs=(d.images||[]).slice(0,12);
    const titles=(typeof evidenceTitles!=='undefined'?evidenceTitles:(d.evidenceTitles||[])).slice(0,12);
    const evidencePages=Math.max(1,Math.ceil(imgs.length/4));
    for(let i=0;i<evidencePages;i++){
      const p=doc.addPage([A4W,A4H]);
      await drawEvidence(p,font,logo,doc,{...d,images:imgs.slice(i*4,i*4+4),evidenceTitles:titles.slice(i*4,i*4+4),evidencePage:i+1,evidencePages});
    }
    doc.setTitle('تقرير تنفيذ '+selectedReportType());
    doc.setCreator('مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب');
    return await doc.save();
  };

})();