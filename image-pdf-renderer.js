(function(){
  'use strict';

  const REFERENCE_W = 1447;
  const REFERENCE_H = 2048;
  const CSS_W = 794;
  const CSS_H = CSS_W * (REFERENCE_H / REFERENCE_W);
  // Keep the final raster close to A4/300-DPI while preserving the reference aspect ratio.
  const TARGET_RASTER_W = 2480;
  const TARGET_RASTER_H = Math.round(TARGET_RASTER_W * (REFERENCE_H / REFERENCE_W));
  const SCALE_300_DPI = TARGET_RASTER_W / CSS_W;
  const PDF_W = 595.28;
  const PDF_H = 841.89;
  const CONTINUATION_TABLE_BOTTOM = Math.round(CSS_H - 58);

  const $id = id => document.getElementById(id);
  let HQ_LOGO_SRC = 'moe-logo.svg?v=20260920-1';
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);

  async function prepareHqLogoSource(){
    try{
      const r=await fetch('moe-logo.svg?v=20260920-1',{cache:'force-cache'});
      if(!r.ok) throw new Error('logo fetch failed');
      const svgText=await r.text();
      const blob=new Blob([svgText],{type:'image/svg+xml;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      try{
        const img=await new Promise((resolve,reject)=>{
          const im=new Image();
          im.onload=()=>resolve(im);
          im.onerror=()=>reject(new Error('logo decode failed'));
          im.src=url;
        });
        const targetW=1600;
        const ratio=(img.naturalHeight&&img.naturalWidth)?(img.naturalHeight/img.naturalWidth):(411.1/540.9);
        const targetH=Math.max(1,Math.round(targetW*ratio));
        const canvas=document.createElement('canvas');
        canvas.width=targetW;
        canvas.height=targetH;
        const ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,targetW,targetH);
        ctx.drawImage(img,0,0,targetW,targetH);
        HQ_LOGO_SRC=canvas.toDataURL('image/png');
      } finally {
        URL.revokeObjectURL(url);
      }
    }catch(e){
      HQ_LOGO_SRC='data:image/jpeg;base64,'+PDF_LOGO_B64;
    }
  }

  function selectedReportTypeImage(){
    const el = $id('reportType');
    if(!el) return 'برنامج';
    if(el.value === 'other'){
      return String(($id('otherReportType') && $id('otherReportType').value) || '').trim() || 'أخرى';
    }
    return el.value || 'برنامج';
  }

  function selectedApprovalEntitiesImage(){
    const v = ($id('deputyChoice') && $id('deputyChoice').value) || 'educational';
    const manager={label:'مديرة المدرسة',name:'حنان الغامدي'};
    if(v === 'activity'){
      return [
        {label:'رائدة النشاط',name:'سميرة السناني'},
        {label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
        manager
      ];
    }
    if(v === 'student'){
      return [
        {label:'وكيلة الشؤون الطلابية',name:'زكية الرفاعي'},
        manager
      ];
    }
    if(v === 'school'){
      return [
        {label:'وكيلة الشؤون المدرسية',name:'فاطمة مصطفى'},
        manager
      ];
    }
    if(v === 'none'){
      return [manager];
    }
    if(v === 'other'){
      const custom=String(($id('otherDeputyName')&&$id('otherDeputyName').value)||'').trim();
      return [
        {label:'',name:custom||'—'},
        manager
      ];
    }
    return [
      {label:'وكيلة الشؤون التعليمية',name:'تهاني شبكشي'},
      manager
    ];
  }

  function approvalTailHtml(d){
    const approvals=selectedApprovalEntitiesImage();
    const cols=approvals.length===3?'ipr-approval-three':approvals.length===2?'ipr-approval-two':'ipr-approval-empty';
    const approvalHtml=approvals.map(item=>item.label?`
      <div>
        <div class="ipr-sign-label">${esc(item.label)}</div>
        <div class="ipr-sign-name">${esc(item.name)}</div>
      </div>`:`
      <div class="ipr-custom-approval">
        <div class="ipr-sign-name">${esc(item.name)}</div>
      </div>`).join('');
    return `
      <div class="ipr-preparer-row">
        <span class="ipr-sign-label">معدة التقرير:</span>
        <span class="ipr-sign-name">${esc(d.preparer||'—')}</span>
      </div>
      <div class="ipr-approval-row ${cols}">${approvalHtml}</div>
    `;
  }

  function purpleImage(){
    return !!($id('tableColor') && $id('tableColor').value === 'purple');
  }

  function ensureHtml2Canvas(){
    if(window.html2canvas) return Promise.resolve(window.html2canvas);
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
      s.async=true;
      s.onload=()=>window.html2canvas?resolve(window.html2canvas):reject(new Error('تعذر تشغيل محرك تحويل الصفحات إلى صور.'));
      s.onerror=()=>{
        const f=document.createElement('script');
        f.src='https://unpkg.com/html2canvas@1.4.1/dist/html2canvas.min.js';
        f.async=true;
        f.onload=()=>window.html2canvas?resolve(window.html2canvas):reject(new Error('تعذر تشغيل محرك تحويل الصفحات إلى صور.'));
        f.onerror=()=>reject(new Error('تعذر تحميل محرك الصور. تحققي من الاتصال بالإنترنت ثم أعيدي المحاولة.'));
        document.head.appendChild(f);
      };
      document.head.appendChild(s);
    });
  }

  function rendererCss(){
    const fill = purpleImage() ? '#DAA7C9' : '#E7E7E7';
    const label = purpleImage() ? '#141414' : '#315A91';
    const title = purpleImage() ? '#141414' : '#315A91';
    return `
      .ipr-page,.ipr-page *{box-sizing:border-box}
      .ipr-page{
        width:${CSS_W}px;height:${CSS_H}px;position:relative;overflow:hidden;background:#fff;color:#141414;
        direction:rtl;font-family:"Tajawal",Tahoma,"Segoe UI",Arial,sans-serif;font-weight:400;
        -webkit-text-size-adjust:100%;text-size-adjust:100%;font-synthesis:none;
      }
      .ipr-top,.ipr-bottom{position:absolute;left:0;right:0;height:27px;background:linear-gradient(90deg,#138a8b,#23a576)}
      .ipr-top{top:0}.ipr-bottom{bottom:0}
      .ipr-logo{position:absolute;left:48px;top:43px;width:145px;height:auto;object-fit:contain}
      .ipr-head{position:absolute;right:48px;top:36px;width:420px;text-align:right;font-size:14px;line-height:1.45;font-weight:500;color:#151515}
      .ipr-line{position:absolute;left:40px;right:40px;top:160px;border-top:2px solid #222}
      .ipr-title{position:absolute;left:58px;right:58px;top:185px;min-height:48px;text-align:center;font-size:23px;line-height:1.35;font-weight:700;color:${title}}
      .ipr-table{position:absolute;top:250px;left:40px;right:40px}
      .ipr-table table{width:100%;border-collapse:collapse;table-layout:fixed;direction:rtl;font-size:14px}
      .ipr-table th,.ipr-table td{border:1px solid #222;padding:8px 11px;vertical-align:middle;line-height:1.55}
      .ipr-table th{background:${fill};color:${label};font-weight:600;text-align:center}
      .ipr-table td{background:#fff;color:#111;text-align:right;font-weight:400;white-space:normal;overflow-wrap:anywhere;word-break:normal}
      .ipr-table .ipr-meta th,.ipr-table .ipr-meta td{height:62px}
      .ipr-table .ipr-long th{width:18%}
      .ipr-table .ipr-long.ipr-tight th,.ipr-table .ipr-long.ipr-tight td{padding:6px 9px;line-height:1.42;font-size:13px}
      .ipr-table .ipr-long.ipr-squeeze th,.ipr-table .ipr-long.ipr-squeeze td{padding:4px 8px;line-height:1.34;font-size:12.5px}
      .ipr-sign{position:absolute;left:42px;right:42px;bottom:58px;display:grid;gap:14px;text-align:center;direction:rtl}
      .ipr-sign.ipr-three{grid-template-columns:repeat(3,1fr)}
      .ipr-sign.ipr-two{grid-template-columns:repeat(2,1fr)}
      .ipr-sign.ipr-report-sign{position:static;left:auto;right:auto;top:auto;bottom:auto;width:100%;margin-top:22px;display:block}
      .ipr-signature-only-page .ipr-table{top:650px}
      .ipr-preparer-row{text-align:right;padding:0 8px 12px 8px;white-space:nowrap}
      .ipr-preparer-row .ipr-sign-label{display:inline;margin:0 0 0 6px}
      .ipr-preparer-row .ipr-sign-name{display:inline}
      .ipr-approval-row{display:grid;gap:14px;text-align:center;direction:rtl}
      .ipr-approval-row.ipr-approval-two{grid-template-columns:repeat(2,1fr)}
      .ipr-approval-row.ipr-approval-three{grid-template-columns:repeat(3,1fr)}
      .ipr-custom-approval{display:flex;align-items:center;justify-content:center;min-height:42px}
      .ipr-approval-row.ipr-approval-empty{display:block;min-height:58px}
      .ipr-e-signline .ipr-sign{position:static;left:auto;right:auto;top:auto;bottom:auto;width:100%;display:block}
      .ipr-sign-label{font-size:15px;color:#a61919;font-weight:600;margin-bottom:7px}
      .ipr-sign-name{font-size:15px;color:#141414;font-weight:500}
      .ipr-e-title{position:absolute;left:55px;right:55px;top:184px;text-align:center;font-size:23px;font-weight:700;color:${title}}
      .ipr-e-sub{position:absolute;left:60px;right:60px;top:224px;text-align:center;font-size:14px;line-height:1.5;color:#555;font-weight:500}
      .ipr-grid{position:absolute;top:268px;left:45px;right:45px;display:grid;grid-template-columns:1fr 1fr;gap:22px}
      .ipr-card{height:300px;border:2px solid #bbb;padding:9px;background:#fff;display:flex;flex-direction:column;overflow:hidden}
      .ipr-card img{display:block;width:100%;height:250px;object-fit:contain;background:#fff}
      .ipr-card.ipr-cap img{height:220px}
      .ipr-caption{border-top:1px solid #ddd;margin-top:7px;padding-top:6px;text-align:center;font-size:13px;line-height:1.4;font-weight:500;color:#222}
      .ipr-e-signline{position:absolute;left:45px;right:45px;bottom:69px;border-top:1px solid #d0d0d0;padding-top:13px}
    `;
  }

  function pageShell(continuationTitle){
    const page=document.createElement('div');
    page.className='ipr-page';
    page.setAttribute('dir','rtl');
    page.innerHTML=`
      <style>${rendererCss()}</style>
      <div class="ipr-top"></div>
      <img class="ipr-logo" alt="وزارة التعليم" src="${HQ_LOGO_SRC}">
      <div class="ipr-head">
        المملكة العربية السعودية<br>
        وزارة التعليم<br>
        الإدارة العامة للتعليم بمنطقة المدينة المنورة<br>
        متوسطة جميلة بنت عمر بن الخطاب بينبع البحر<br>
        المتوسطة الأولى لتعليم الكبيرات
      </div>
      <div class="ipr-line"></div>
      <div class="ipr-title">${esc(continuationTitle)}</div>
      <div class="ipr-table"><table>
        <colgroup><col style="width:18%"><col style="width:32%"><col style="width:18%"><col style="width:32%"></colgroup>
        <tbody></tbody>
      </table></div>
      <div class="ipr-bottom"></div>
    `;
    return page;
  }

  function addMetaRows(page,d,type){
    const tbody=page.querySelector('tbody');
    const tr1=document.createElement('tr');
    tr1.className='ipr-meta';
    tr1.innerHTML=`<th>اسم ${esc(type)}</th><td>${esc(d.program||'')}</td><th>تاريخ التنفيذ</th><td style="text-align:center">${esc(d.date||'')}</td>`;
    tbody.appendChild(tr1);
    const tr2=document.createElement('tr');
    tr2.className='ipr-meta';
    tr2.innerHTML=`<th>الفئة المستهدفة</th><td>${esc(d.target||'')}</td><th>عدد المستفيدات</th><td style="text-align:center">${esc(d.count||'')}</td>`;
    tbody.appendChild(tr2);
  }

  function addLongRow(page,label,text,mode='normal'){
    const tr=document.createElement('tr');
    tr.className='ipr-long'+(mode==='tight'?' ipr-tight':mode==='squeeze'?' ipr-squeeze':'');
    tr.innerHTML=`<th>${esc(label)}</th><td colspan="3">${esc(text).replace(/\n/g,'<br>')}</td>`;
    page.querySelector('tbody').appendChild(tr);
    return tr;
  }

  function addSignatures(page,d){
    const wrap=document.createElement('div');
    wrap.className='ipr-sign ipr-report-sign';
    wrap.innerHTML=approvalTailHtml(d);
    const host=page.querySelector('.ipr-table');
    if(host)host.appendChild(wrap);else page.appendChild(wrap);
  }

  function positionSignaturesAfterTable(page){
    // التوقيعات داخل تدفق .ipr-table مباشرة؛ لا حاجة لأي قياس مرتبط بحجم شاشة الجهاز.
    return;
  }

  function tableBottom(page){
    const wrap=page.querySelector('.ipr-table');
    const table=wrap&&wrap.querySelector('table');
    if(!wrap||!table)return 0;
    return wrap.offsetTop+table.offsetHeight;
  }

  function tableLimit(page){
    const signature=page.querySelector('.ipr-report-sign');
    if(signature){
      const signHeight=Math.max(signature.offsetHeight,52);
      // الجدول + 22px فراغ + التوقيعات يجب أن تبقى فوق الشريط السفلي.
      return Math.floor(CSS_H-48-signHeight-22);
    }
    return CONTINUATION_TABLE_BOTTOM;
  }

  function splitWordsToFit(page,label,text,isContinuation){
    const words=String(text||'').trim().split(/\s+/).filter(Boolean);
    if(!words.length) return {chunk:'',rest:''};

    const limit=tableLimit(page);
    let lo=1,hi=words.length,best=0,row=null;
    while(lo<=hi){
      const mid=Math.floor((lo+hi)/2);
      if(row) row.remove();
      row=addLongRow(page,isContinuation?label+' - تابع':label,words.slice(0,mid).join(' '));
      if(tableBottom(page)<=limit){best=mid;lo=mid+1}else hi=mid-1;
    }
    if(row) row.remove();

    if(best===0) best=1;
    return {chunk:words.slice(0,best).join(' '),rest:words.slice(best).join(' ')};
  }

  function tryWholeRow(page,label,text){
    const limit=tableLimit(page);

    const normal=addLongRow(page,label,text);
    if(tableBottom(page)<=limit) return normal;
    const normalOverflow=tableBottom(page)-limit;
    normal.remove();

    // إذا كان التجاوز بسيطًا، نضغط الصف نفسه بدل ترحيل سطر أو سطرين.
    if(normalOverflow<=120){
      const tight=addLongRow(page,label,text,'tight');
      if(tableBottom(page)<=limit) return tight;
      const tightOverflow=tableBottom(page)-limit;
      tight.remove();

      if(tightOverflow<=60){
        const squeeze=addLongRow(page,label,text,'squeeze');
        if(tableBottom(page)<=limit) return squeeze;
        squeeze.remove();
      }
    }
    return null;
  }

  function buildReportPages(root,d){
    const type=selectedReportTypeImage();
    const baseTitle='تقرير تنفيذ '+type+' '+(d.program||'........................');
    const sections=[
      {label:'الهدف من '+type,text:String(d.goal||'')},
      {label:'إجراءات التنفيذ',text:String(d.steps||'')},
      {label:'المخرجات وقياس الأثر',text:String(d.results||'')}
    ];
    const pages=[];
    let page=pageShell(baseTitle);
    root.appendChild(page);
    addMetaRows(page,d,type);
    pages.push(page);

    for(const section of sections){
      let rest=section.text.trim();
      let continued=false;
      if(!rest){
        if(!tryWholeRow(page,section.label,'')){
          page=pageShell('متابعة '+baseTitle);
          root.appendChild(page);
          pages.push(page);
          addLongRow(page,section.label,'');
        }
        continue;
      }

      while(rest){
        const rowLabel=continued?section.label+' - تابع':section.label;

        // الأولوية دائمًا لبقاء النص كاملًا في الصفحة الحالية.
        if(tryWholeRow(page,rowLabel,rest)){
          rest='';
          break;
        }

        const {chunk,rest:remaining}=splitWordsToFit(page,section.label,rest,continued);
        if(chunk){
          const fitted=addLongRow(page,rowLabel,chunk);
          if(tableBottom(page)>tableLimit(page)){
            fitted.remove();
            page=pageShell('متابعة '+baseTitle);
            root.appendChild(page);
            pages.push(page);
            continued=true;
            continue;
          }
        }

        rest=remaining;
        if(rest){
          page=pageShell('متابعة '+baseTitle);
          root.appendChild(page);
          pages.push(page);
          continued=true;
        }
      }
    }

    let signaturePage=pages[pages.length-1];
    addSignatures(signaturePage,d);

    // إذا لم تتسع التوقيعات في آخر صفحة محتوى، أنشئ صفحة متابعة أخيرة
    // قبل الشواهد لتظهر فيها التوقيعات مرة واحدة فقط.
    if(tableBottom(signaturePage)>tableLimit(signaturePage)){
      const sign=signaturePage.querySelector('.ipr-report-sign');
      if(sign)sign.remove();

      signaturePage=pageShell('متابعة '+baseTitle);
      signaturePage.classList.add('ipr-signature-only-page');
      root.appendChild(signaturePage);
      addSignatures(signaturePage,d);
      pages.push(signaturePage);
    }

    return pages;
  }

  function buildEvidencePages(root,d){
    const type=selectedReportTypeImage();
    const imgs=(d.images||[]).slice(0,12);
    const titles=(d.evidenceTitles||[]).slice(0,12);
    const count=Math.max(1,Math.ceil(imgs.length/4));
    const pages=[];

    for(let p=0;p<count;p++){
      const page=document.createElement('div');
      page.className='ipr-page';
      page.setAttribute('dir','rtl');
      let cards='';
      for(let i=0;i<4;i++){
        const idx=p*4+i;
        const src=imgs[idx]||'';
        const cap=String(titles[idx]||'').trim();
        cards+=`<div class="ipr-card ${cap?'ipr-cap':''}">
          ${src?`<img alt="" src="${src}">`:'<div style="height:250px"></div>'}
          ${cap?`<div class="ipr-caption">${esc(cap)}</div>`:''}
        </div>`;
      }

      page.innerHTML=`
        <style>${rendererCss()}</style>
        <div class="ipr-top"></div>
        <img class="ipr-logo" alt="وزارة التعليم" src="${HQ_LOGO_SRC}">
        <div class="ipr-head">
          المملكة العربية السعودية<br>
          وزارة التعليم<br>
          الإدارة العامة للتعليم بمنطقة المدينة المنورة<br>
          متوسطة جميلة بنت عمر بن الخطاب بينبع البحر<br>
        المتوسطة الأولى لتعليم الكبيرات
        </div>
        <div class="ipr-line"></div>
        <div class="ipr-e-title">شواهد تنفيذ ${esc(type)}</div>
        <div class="ipr-e-sub">${esc(d.program||'........................')} &nbsp;&nbsp; ${esc(d.date||'')}</div>
        <div class="ipr-grid">${cards}</div>
        <div class="ipr-e-signline"></div>
        <div class="ipr-bottom"></div>
      `;
      root.appendChild(page);
      const line=page.querySelector('.ipr-e-signline');
      const wrap=document.createElement('div');
      wrap.className='ipr-sign';
      wrap.innerHTML=approvalTailHtml(d);
      line.appendChild(wrap);
      pages.push(page);
    }
    return pages;
  }

  async function ensureReportFontsReady(){
    if(document.fonts){
      try{
        await Promise.all([
          document.fonts.load('400 16px Tajawal','العربية'),
          document.fonts.load('500 16px Tajawal','العربية'),
          document.fonts.load('700 16px Tajawal','العربية')
        ]);
      }catch(e){}
      try{
        if(document.fonts.ready) await document.fonts.ready;
      }catch(e){}
    }
  }

  function nextAnimationFrame(){
    return new Promise(resolve=>requestAnimationFrame(()=>resolve()));
  }

  async function settleVirtualLayout(root,reportPages=[]){
    // Safari على الجوال قد يحتاج أكثر من دورة رسم حتى تثبت قياسات الخطوط والسطور.
    void root.offsetWidth;
    await nextAnimationFrame();
    void root.offsetHeight;
    await nextAnimationFrame();

    // قياس التوقيعات مرة أولى بعد استقرار النص.
    if(reportPages[0]) positionSignaturesAfterTable(reportPages[0]);

    void root.offsetWidth;
    await nextAnimationFrame();

    // ثم إعادة القياس مرة ثانية مباشرة قبل الالتقاط.
    if(reportPages[0]) positionSignaturesAfterTable(reportPages[0]);
  }

  async function waitForImages(root){
    const images=[...root.querySelectorAll('img')];
    await Promise.all(images.map(img=>{
      if(img.complete && img.naturalWidth>0) return Promise.resolve();
      if(typeof img.decode==='function') return img.decode().catch(()=>{});
      return new Promise(resolve=>{
        const done=()=>resolve();
        img.addEventListener('load',done,{once:true});
        img.addEventListener('error',done,{once:true});
      });
    }));
  }

  async function renderPageToJpeg(page){
    const canvas=await window.html2canvas(page,{
      backgroundColor:'#ffffff',
      scale:SCALE_300_DPI,
      useCORS:true,
      allowTaint:false,
      logging:false,
      width:Math.round(CSS_W),
      height:Math.round(CSS_H),
      windowWidth:Math.round(CSS_W),
      windowHeight:Math.round(CSS_H)
    });
    let outCanvas=canvas;
    if(canvas.width!==TARGET_RASTER_W || canvas.height!==TARGET_RASTER_H){
      outCanvas=document.createElement('canvas');
      outCanvas.width=TARGET_RASTER_W;
      outCanvas.height=TARGET_RASTER_H;
      const ctx=outCanvas.getContext('2d');
      ctx.fillStyle='#fff';
      ctx.fillRect(0,0,TARGET_RASTER_W,TARGET_RASTER_H);
      ctx.drawImage(canvas,0,0,TARGET_RASTER_W,TARGET_RASTER_H);
    }
    const dataUrl=outCanvas.toDataURL('image/jpeg',0.97);
    return b64bytes(dataUrl.split(',')[1]);
  }

  async function makeImagePdfClient(d){
    if(!window.PDFLib) throw new Error('تعذر تحميل محرك PDF. تحققي من الاتصال بالإنترنت ثم أعيدي المحاولة.');
    await ensureHtml2Canvas();
    await prepareHqLogoSource();

    // أهم خطوة لتوحيد الجوال والكمبيوتر: لا نبدأ أي قياس قبل اكتمال تحميل الخط.
    await ensureReportFontsReady();

    const root=document.createElement('div');
    root.setAttribute('aria-hidden','true');
    // مساحة افتراضية ثابتة 794px لا تتأثر بعرض شاشة الجوال أو تكبير Safari.
    root.style.cssText=[
      'position:absolute',
      'left:-1200px',
      'top:0',
      'width:'+CSS_W+'px',
      'min-width:'+CSS_W+'px',
      'max-width:'+CSS_W+'px',
      'background:#fff',
      'font-size:16px',
      '-webkit-text-size-adjust:100%',
      'text-size-adjust:100%',
      'pointer-events:none',
      'z-index:-2147483647',
      'contain:layout style'
    ].join(';');
    document.body.appendChild(root);

    try{
      // المرور الأول يهيئ Safari/Chrome Mobile لحسابات الخط والسطور الفعلية.
      const warmupPages=buildReportPages(root,d);
      await settleVirtualLayout(root,warmupPages);
      warmupPages.forEach(p=>p.remove());

      // المرور الثاني هو الذي نعتمد عليه في التقسيم النهائي.
      const reportPages=buildReportPages(root,d);
      const evidencePages=buildEvidencePages(root,d);
      const pages=[...reportPages,...evidencePages];

      await waitForImages(root);
      await ensureReportFontsReady();
      await settleVirtualLayout(root,reportPages);

      const doc=await PDFLib.PDFDocument.create();
      for(let i=0;i<pages.length;i++){
        if(typeof show==='function') show('جارٍ تجهيز صفحة '+(i+1)+' من '+pages.length+' بدقة 300 DPI...');
        void pages[i].offsetHeight;
        await nextAnimationFrame();
        if(i===0) positionSignaturesAfterTable(reportPages[0]);
        const jpgBytes=await renderPageToJpeg(pages[i]);
        const img=await doc.embedJpg(jpgBytes);
        const p=doc.addPage([PDF_W,PDF_H]);
        p.drawImage(img,{x:0,y:0,width:PDF_W,height:PDF_H});
      }

      doc.setTitle('تقرير تنفيذ '+selectedReportTypeImage());
      doc.setCreator('مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب بينبع البحر / المتوسطة الأولى لتعليم الكبيرات');
      doc.setProducer('Browser image renderer - 300 DPI');
      return await doc.save();
    } finally {
      root.remove();
    }
  }

  // نستبدل فقط مرحلة إنشاء الملف النهائية. بقية الموقع والحفظ والشواهد تبقى كما هي.
  makePdfClient = makeImagePdfClient;
})();