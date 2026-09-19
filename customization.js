(function(){
  const byId=id=>document.getElementById(id);
  const deputyMap={
    educational:{label:'وكيلة الشؤون التعليمية',name:'تهاني شبكشي'},
    student:{label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
    none:null
  };
  const purple=[218,167,201]; // #DAA7C9
  function selectedReportType(){
    const el=byId('reportType');
    return (el&&el.value)||'برنامج';
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
        saved.deputyChoice=byId('deputyChoice').value;
        saved.tableColor=byId('tableColor').value;
        localStorage.setItem('schoolReport',JSON.stringify(saved));
      }catch(e){}
    };
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
    for(const [lab,txt,rh] of [['الهدف من '+reportType,d.goal,30],['إجراءات التنفيذ',d.steps,34],['المخرجات وقياس الأثر',d.results,34],['الشواهد','مرفقة في الصفحة الثانية من التقرير',18]]){
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
    const allImages=(typeof evidenceImages!=='undefined'?evidenceImages:(d.images||[])).slice(0,10);
    const slotCount=Math.max(4,allImages.length);
    const rows=slotCount<=4?2:Math.ceil(slotCount/2);
    const yStart=63,gridHeight=164,gap=3,rowH=(gridHeight-gap*(rows-1))/rows;
    for(let i=0;i<slotCount;i++){
      const col=i%2,row=Math.floor(i/2),x=col===0?107:12,y=yStart+row*(rowH+gap);
      rectTop(page,x,y,91,rowH,null,C.border,.35);
      if(allImages[i]){
        try{fitImg(page,await embedDataImage(doc,allImages[i]),x+1.5,y+1.5,88,rowH-3)}catch(e){}
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
})();