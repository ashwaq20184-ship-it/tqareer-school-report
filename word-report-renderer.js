(function(){
'use strict';

const $w=id=>document.getElementById(id);

function val(id){return String(($w(id)&&$w(id).value)||'').trim()}
function safeFileName(s){
  return String(s||'تقرير').replace(/[\\/:*?"<>|]+/g,'-').replace(/\s+/g,' ').trim().slice(0,60)||'تقرير';
}
function selectedType(){
  const el=$w('reportType');
  if(!el)return 'برنامج';
  if(el.value==='none')return '';
  if(el.value==='other')return val('otherReportType');
  return el.value||'برنامج';
}
function selectedTitleStyle(){
  return val('reportTitleStyle')||'execution';
}
function reportTitle(type,program){
  const title=program||'........................';
  const style=selectedTitleStyle();
  if(style==='titleOnly')return ('تقرير '+title).trim();
  if(style==='withoutExecution')return ('تقرير '+(type?type+' ':'')+title).trim();
  return ('تقرير تنفيذ '+(type?type+' ':'')+title).trim();
}
function schoolLines(){
  const v=val('schoolHeaderChoice')||'merged';
  const middle='متوسطة جميلة بنت عمر بن الخطاب بينبع البحر';
  const adult='المتوسطة الأولى للكبيرات';
  if(v==='middle')return [middle];
  if(v==='adult')return [adult];
  return [middle,adult];
}
function approvalEntities(){
  const v=val('deputyChoice')||'educational';
  const manager={label:'مديرة المدرسة',name:'حنان الغامدي'};
  if(v==='activity')return [
    {label:'رائدة النشاط',name:'سميرة السناني'},
    {label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
    manager
  ];
  if(v==='student')return [{label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},manager];
  if(v==='school')return [{label:'وكيلة الشؤون المدرسية',name:'فاطمة مصطفى'},manager];
  if(v==='counseling')return [{label:'الإرشاد الطلابي',name:'زينب الرفاعي - وضحى القحطاني'},manager];
  if(v==='none')return [manager];
  if(v==='other')return [{label:'',name:val('otherDeputyName')||'—'},manager];
  return [{label:'وكيلة الشؤون التعليمية',name:'تهاني شبكشي'},manager];
}
function currentExecutionLabel(){
  try{if(typeof executionDateLabel==='function')return executionDateLabel()}catch(e){}
  return 'تاريخ التنفيذ';
}
function currentExecutionValue(){
  try{if(typeof executionDateValue==='function')return executionDateValue()}catch(e){}
  return '';
}
function selectedEvidence(){
  let imgs=[],titles=[];
  try{if(Array.isArray(evidenceImages))imgs=evidenceImages}catch(e){}
  try{if(Array.isArray(evidenceTitles))titles=evidenceTitles}catch(e){}
  return imgs.map((img,i)=>({img,title:String(titles[i]||'').trim()})).filter(x=>x.img).slice(0,12);
}
function decodeDataUrl(dataUrl){
  const m=String(dataUrl||'').match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/i);
  if(!m)throw new Error('صيغة صورة الشاهد غير مدعومة في Word.');
  const bin=atob(m[2]),out=new Uint8Array(bin.length);
  for(let i=0;i<bin.length;i++)out[i]=bin.charCodeAt(i);
  return {type:m[1].toLowerCase()==='png'?'png':'jpg',data:out};
}
function measureDataImage(src){
  return new Promise(resolve=>{
    const im=new Image();
    im.onload=()=>resolve({w:im.naturalWidth||1,h:im.naturalHeight||1});
    im.onerror=()=>resolve({w:1,h:1});
    im.src=src;
  });
}
function fitSize(dim,maxW,maxH){
  const s=Math.min(maxW/Math.max(1,dim.w),maxH/Math.max(1,dim.h));
  return {width:Math.max(1,Math.round(dim.w*s)),height:Math.max(1,Math.round(dim.h*s))};
}
function isBarcodeLike(dim,title){
  const ratio=dim.w/Math.max(1,dim.h);
  const hinted=/بار\s*كود|qr|كيو\s*آر|كيو\s*ار/i.test(String(title||''));
  return hinted||(ratio>=0.78&&ratio<=1.28);
}
async function logoPngBytes(){
  try{
    const r=await fetch('moe-logo.svg?v=20260920-1',{cache:'force-cache'});
    if(!r.ok)throw new Error('logo');
    const svg=await r.text();
    const blob=new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    try{
      const im=await new Promise((resolve,reject)=>{
        const x=new Image();x.onload=()=>resolve(x);x.onerror=reject;x.src=url;
      });
      const canvas=document.createElement('canvas');
      canvas.width=700;
      canvas.height=Math.max(1,Math.round(700*(im.naturalHeight/im.naturalWidth)));
      const ctx=canvas.getContext('2d');
      ctx.clearRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(im,0,0,canvas.width,canvas.height);
      return decodeDataUrl(canvas.toDataURL('image/png')).data;
    }finally{URL.revokeObjectURL(url)}
  }catch(e){return null}
}

function wordText(DX,text,opt={}){
  return new DX.TextRun({
    text:String(text||''),
    bold:!!opt.bold,
    size:opt.size||24,
    color:opt.color||'111111',
    font:opt.font||'Tajawal',
    rightToLeft:true
  });
}
function para(DX,text,opt={}){
  return new DX.Paragraph({
    alignment:opt.align||DX.AlignmentType.RIGHT,
    bidirectional:true,
    spacing:{before:opt.before||0,after:opt.after===undefined?80:opt.after,line:opt.line||276},
    pageBreakBefore:!!opt.pageBreakBefore,
    children:[wordText(DX,text,opt)]
  });
}
function linesToParagraphs(DX,text,opt={}){
  const raw=String(text||'').replace(/\r/g,'').split('\n');
  return (raw.length?raw:['']).map(line=>para(DX,line,opt));
}
function borders(DX,color='333333',size=4){
  const b={style:DX.BorderStyle.SINGLE,size,color};
  return {top:b,bottom:b,left:b,right:b};
}
function cell(DX,text,opt={}){
  const children=Array.isArray(text)?text:linesToParagraphs(DX,text,{size:opt.size||23,bold:!!opt.bold,color:opt.color||'111111',align:opt.align||DX.AlignmentType.RIGHT,after:0});
  return new DX.TableCell({
    width:{size:opt.width||25,type:DX.WidthType.PERCENTAGE},
    verticalAlign:DX.VerticalAlign.CENTER,
    shading:opt.fill?{fill:opt.fill}:undefined,
    margins:{top:100,bottom:100,left:110,right:110},
    borders:borders(DX,opt.borderColor||'333333',4),
    children
  });
}
function labelCell(DX,text,width,fill,labelColor){
  return cell(DX,text,{width,fill,color:labelColor,bold:true,align:DX.AlignmentType.CENTER,size:22});
}
function dataCell(DX,text,width){
  return cell(DX,text,{width,size:22});
}
function infoTable(DX,d,fill,labelColor){
  return new DX.Table({
    width:{size:100,type:DX.WidthType.PERCENTAGE},
    layout:DX.TableLayoutType.FIXED,
    visuallyRightToLeft:true,
    rows:[
      new DX.TableRow({children:[
        labelCell(DX,d.type?'اسم '+d.type:'عنوان التقرير',18,fill,labelColor),
        dataCell(DX,d.program,32),
        labelCell(DX,d.dateLabel,18,fill,labelColor),
        dataCell(DX,d.date,32)
      ]}),
      new DX.TableRow({children:[
        labelCell(DX,'الفئة المستهدفة',18,fill,labelColor),
        dataCell(DX,d.target,32),
        labelCell(DX,'عدد المستفيدات',18,fill,labelColor),
        dataCell(DX,d.count,32)
      ]})
    ]
  });
}
function sectionTable(DX,label,text,fill,labelColor){
  return new DX.Table({
    width:{size:100,type:DX.WidthType.PERCENTAGE},
    layout:DX.TableLayoutType.FIXED,
    visuallyRightToLeft:true,
    rows:[new DX.TableRow({children:[
      labelCell(DX,label,18,fill,labelColor),
      cell(DX,linesToParagraphs(DX,text,{size:22,after:0}),{width:82})
    ]})]
  });
}
function headerTable(DX,logoData){
  const leftChildren=[];
  if(logoData){
    leftChildren.push(new DX.Paragraph({
      alignment:DX.AlignmentType.CENTER,
      spacing:{after:0},
      children:[new DX.ImageRun({type:'png',data:logoData,transformation:{width:105,height:80}})]
    }));
  }else leftChildren.push(para(DX,'وزارة التعليم',{align:DX.AlignmentType.CENTER,bold:true,after:0}));

  const rightChildren=[
    'المملكة العربية السعودية','وزارة التعليم','الإدارة العامة للتعليم بمنطقة المدينة المنورة',...schoolLines()
  ].map(s=>para(DX,s,{size:20,bold:true,after:0,line:240}));

  const noBorder={style:DX.BorderStyle.NONE,size:0,color:'FFFFFF'};
  const borderNone={top:noBorder,bottom:noBorder,left:noBorder,right:noBorder};
  return new DX.Table({
    width:{size:100,type:DX.WidthType.PERCENTAGE},
    layout:DX.TableLayoutType.FIXED,
    rows:[new DX.TableRow({children:[
      new DX.TableCell({width:{size:28,type:DX.WidthType.PERCENTAGE},borders:borderNone,verticalAlign:DX.VerticalAlign.CENTER,children:leftChildren}),
      new DX.TableCell({width:{size:72,type:DX.WidthType.PERCENTAGE},borders:borderNone,verticalAlign:DX.VerticalAlign.CENTER,children:rightChildren})
    ]})]
  });
}
function approvalsBlock(DX,d){
  const out=[para(DX,'معدة التقرير: '+(d.preparer||'—'),{bold:true,size:22,before:120,after:140})];
  const approvals=approvalEntities();
  const cells=approvals.map(a=>{
    const ps=[];
    if(a.label)ps.push(para(DX,a.label,{align:DX.AlignmentType.CENTER,bold:true,color:'A61919',size:21,after:40}));
    ps.push(para(DX,a.name,{align:DX.AlignmentType.CENTER,size:21,after:0}));
    return new DX.TableCell({
      width:{size:100/approvals.length,type:DX.WidthType.PERCENTAGE},
      verticalAlign:DX.VerticalAlign.CENTER,
      borders:{top:{style:DX.BorderStyle.NONE},bottom:{style:DX.BorderStyle.NONE},left:{style:DX.BorderStyle.NONE},right:{style:DX.BorderStyle.NONE}},
      children:ps
    });
  });
  out.push(new DX.Table({
    width:{size:100,type:DX.WidthType.PERCENTAGE},
    layout:DX.TableLayoutType.FIXED,
    visuallyRightToLeft:true,
    rows:[new DX.TableRow({children:cells})]
  }));
  return out;
}
async function imageParagraph(DX,item,maxW,maxH){
  const dim=await measureDataImage(item.img);
  const raw=decodeDataUrl(item.img);
  const sz=fitSize(dim,maxW,maxH);
  return {
    dim,
    paragraph:new DX.Paragraph({
      alignment:DX.AlignmentType.CENTER,
      bidirectional:true,
      spacing:{before:50,after:item.title?40:80},
      children:[new DX.ImageRun({type:raw.type,data:raw.data,transformation:sz})]
    })
  };
}
async function evidenceCell(DX,item){
  if(!item)return new DX.TableCell({
    width:{size:50,type:DX.WidthType.PERCENTAGE},
    borders:borders(DX,'BBBBBB',4),
    children:[para(DX,'',{after:0})]
  });
  const obj=await imageParagraph(DX,item,235,180);
  const children=[obj.paragraph];
  if(item.title)children.push(para(DX,item.title,{align:DX.AlignmentType.CENTER,size:20,after:30}));
  return new DX.TableCell({
    width:{size:50,type:DX.WidthType.PERCENTAGE},
    verticalAlign:DX.VerticalAlign.CENTER,
    borders:borders(DX,'BBBBBB',4),
    margins:{top:100,bottom:100,left:100,right:100},
    children
  });
}
async function evidencePageContent(DX,d,items,pageIndex){
  const children=[
    para(DX,'شواهد '+reportTitle(d.type,d.program).replace(/^تقرير\s+(تنفيذ\s+)?/,'').trim(),{
      align:DX.AlignmentType.CENTER,bold:true,size:30,color:d.titleColor,pageBreakBefore:true,after:70
    }),
    para(DX,d.date,{align:DX.AlignmentType.CENTER,size:20,color:'666666',after:130})
  ];
  const padded=items.slice();
  while(padded.length<4)padded.push(null);
  const cells=[];
  for(const item of padded)cells.push(await evidenceCell(DX,item));
  children.push(new DX.Table({
    width:{size:100,type:DX.WidthType.PERCENTAGE},
    layout:DX.TableLayoutType.FIXED,
    rows:[
      new DX.TableRow({children:[cells[0],cells[1]]}),
      new DX.TableRow({children:[cells[2],cells[3]]})
    ]
  }));
  return children;
}
function validateWord(){
  const type=$w('reportType');
  if(type&&type.value==='other'&&!val('otherReportType'))throw new Error('اكتبي نوع التقرير في خانة "أخرى" قبل إنشاء ملف Word.');
  try{
    if(typeof validateExecutionFields==='function'){
      const err=validateExecutionFields();
      if(err)throw new Error(err);
    }
  }catch(e){if(e&&e.message)throw e}
}
async function buildWord(){
  if(!window.docx)throw new Error('تعذر تحميل محرك Word. تحققي من الاتصال بالإنترنت ثم أعيدي المحاولة.');
  validateWord();
  const DX=window.docx;
  const type=selectedType();
  const d={
    type,
    program:val('program'),
    dateLabel:currentExecutionLabel(),
    date:currentExecutionValue(),
    target:val('target'),
    count:val('count'),
    goal:val('goal'),
    steps:val('steps'),
    results:val('results'),
    preparer:val('preparer')
  };
  const purple=val('tableColor')==='purple';
  d.fill=purple?'DAA7C9':'E7E7E7';
  d.labelColor=purple?'141414':'315A91';
  d.titleColor=purple?'141414':'315A91';

  const logo=await logoPngBytes();
  const evidence=selectedEvidence();
  const measured=evidence.length===1?await measureDataImage(evidence[0].img):null;
  const mergeBarcode=!!(evidence.length===1&&measured&&isBarcodeLike(measured,evidence[0].title));

  const children=[
    headerTable(DX,logo),
    new DX.Paragraph({border:{bottom:{style:DX.BorderStyle.SINGLE,size:12,color:'222222'}},spacing:{after:180}}),
    para(DX,reportTitle(type,d.program),{align:DX.AlignmentType.CENTER,bold:true,size:34,color:d.titleColor,after:180}),
    infoTable(DX,d,d.fill,d.labelColor),
    para(DX,'',{after:60}),
    sectionTable(DX,'الهدف',d.goal,d.fill,d.labelColor),
    para(DX,'',{after:45}),
    sectionTable(DX,'إجراءات التنفيذ',d.steps,d.fill,d.labelColor),
    para(DX,'',{after:45}),
    sectionTable(DX,'المخرجات وقياس الأثر',d.results,d.fill,d.labelColor)
  ];

  if(mergeBarcode){
    children.push(para(DX,'الشاهد',{align:DX.AlignmentType.CENTER,bold:true,size:22,color:d.titleColor,before:130,after:30}));
    const img=await imageParagraph(DX,evidence[0],145,145);
    children.push(img.paragraph);
    if(evidence[0].title)children.push(para(DX,evidence[0].title,{align:DX.AlignmentType.CENTER,size:19,after:70}));
  }

  children.push(...approvalsBlock(DX,d));

  if(!mergeBarcode&&evidence.length){
    for(let i=0;i<evidence.length;i+=4){
      children.push(...await evidencePageContent(DX,d,evidence.slice(i,i+4),i/4));
    }
  }

  const footer=new DX.Footer({
    children:[new DX.Paragraph({
      alignment:DX.AlignmentType.CENTER,
      bidirectional:true,
      border:{top:{style:DX.BorderStyle.SINGLE,size:8,color:'138A8B'}},
      spacing:{before:80},
      children:[wordText(DX,'مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب',{size:18,color:'555555'})]
    })]
  });

  const doc=new DX.Document({
    creator:'مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب',
    title:reportTitle(type,d.program),
    description:'نسخة Word قابلة للتعديل من صانع التقارير',
    styles:{
      default:{
        document:{run:{font:'Tajawal',size:22},paragraph:{spacing:{after:80}}}
      }
    },
    sections:[{
      properties:{
        page:{
          size:{width:11906,height:16838},
          margin:{top:650,right:720,bottom:650,left:720,header:300,footer:300}
        }
      },
      footers:{default:footer},
      children
    }]
  });

  return await DX.Packer.toBlob(doc);
}
function downloadBlob(blob,name){
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;a.download=name;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),60000);
}
async function exportWord(){
  const b=$w('wordBtn');
  if(!b)return;
  const old=b.textContent;
  b.disabled=true;
  b.textContent='جارٍ إنشاء Word...';
  if(typeof show==='function')show('جارٍ إنشاء ملف Word قابل للتعديل...');
  try{
    const blob=await buildWord();
    if(!blob||blob.size<1000)throw new Error('لم يتم إنشاء ملف Word بشكل صحيح.');
    downloadBlob(blob,'تقرير-'+safeFileName(val('program'))+'.docx');
    if(typeof show==='function')show('تم إنشاء ملف Word قابل للتعديل بنجاح، مع بقاء تصدير PDF كما هو.');
  }catch(e){
    console.error(e);
    if(typeof show==='function')show(e.message||'تعذر إنشاء ملف Word.');
  }finally{
    b.disabled=false;
    b.textContent=old;
  }
}
const btn=$w('wordBtn');
if(btn)btn.addEventListener('click',exportWord);
})();