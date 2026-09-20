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
  const MAX_TABLE_BOTTOM = 815;

  const $id = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  })[ch]);

  function selectedReportTypeImage(){
    const el = $id('reportType');
    if(!el) return 'برنامج';
    if(el.value === 'other'){
      return String(($id('otherReportType') && $id('otherReportType').value) || '').trim() || 'أخرى';
    }
    return el.value || 'برنامج';
  }

  function selectedDeputyImage(){
    const v = ($id('deputyChoice') && $id('deputyChoice').value) || 'educational';
    if(v === 'student') return {label:'وكيلة الشؤون الطلابية', name:'زكية الرفاعي'};
    if(v === 'none') return null;
    return {label:'وكيلة الشؤون التعليمية', name:'تهاني شبكشي'};
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
      }
      .ipr-top,.ipr-bottom{position:absolute;left:0;right:0;height:27px;background:linear-gradient(90deg,#138a8b,#23a576)}
      .ipr-top{top:0}.ipr-bottom{bottom:0}
      .ipr-logo{position:absolute;left:48px;top:43px;width:145px;height:auto;object-fit:contain}
      .ipr-head{position:absolute;right:48px;top:41px;width:400px;text-align:right;font-size:15px;line-height:1.55;font-weight:500;color:#151515}
      .ipr-line{position:absolute;left:40px;right:40px;top:160px;border-top:2px solid #222}
      .ipr-title{position:absolute;left:58px;right:58px;top:185px;min-height:48px;text-align:center;font-size:23px;line-height:1.35;font-weight:700;color:${title}}
      .ipr-table{position:absolute;top:250px;left:40px;right:40px}
      .ipr-table table{width:100%;border-collapse:collapse;table-layout:fixed;direction:rtl;font-size:14px}
      .ipr-table th,.ipr-table td{border:1px solid #222;padding:8px 11px;vertical-align:middle;line-height:1.55}
      .ipr-table th{background:${fill};color:${label};font-weight:600;text-align:center}
      .ipr-table td{background:#fff;color:#111;text-align:right;font-weight:400;white-space:normal;overflow-wrap:anywhere;word-break:normal}
      .ipr-table .ipr-meta th,.ipr-table .ipr-meta td{height:62px}
      .ipr-table .ipr-long th{width:18%}
      .ipr-sign{position:absolute;left:42px;right:42px;bottom:70px;display:grid;gap:14px;text-align:center;direction:rtl}
      .ipr-sign.ipr-three{grid-template-columns:repeat(3,1fr)}
      .ipr-sign.ipr-two{grid-template-columns:repeat(2,1fr)}
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
      <img class="ipr-logo" alt="وزارة التعليم" src="data:image/jpeg;base64,${PDF_LOGO_B64}">
      <div class="ipr-head">
        المملكة العربية السعودية<br>
        وزارة التعليم<br>
        الإدارة العامة للتعليم بمنطقة المدينة المنورة<br>
        متوسطة جميلة بنت عمر بن الخطاب
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

  function addLongRow(page,label,text){
    const tr=document.createElement('tr');
    tr.className='ipr-long';
    tr.innerHTML=`<th>${esc(label)}</th><td colspan="3">${esc(text).replace(/\n/g,'<br>')}</td>`;
    page.querySelector('tbody').appendChild(tr);
    return tr;
  }

  function addSignatures(page,d){
    const deputy=selectedDeputyImage();
    const wrap=document.createElement('div');
    wrap.className='ipr-sign '+(deputy?'ipr-three':'ipr-two');
    let html=`<div><div class="ipr-sign-label">معدة التقرير</div><div class="ipr-sign-name">${esc(d.preparer||'—')}</div></div>`;
    if(deputy) html+=`<div><div class="ipr-sign-label">${esc(deputy.label)}</div><div class="ipr-sign-name">${esc(deputy.name)}</div></div>`;
    html+=`<div><div class="ipr-sign-label">مديرة المدرسة</div><div class="ipr-sign-name">حنان الغامدي</div></div>`;
    wrap.innerHTML=html;
    page.appendChild(wrap);
  }

  function tableBottom(page){
    const table=page.querySelector('.ipr-table table');
    return table.getBoundingClientRect().bottom - page.getBoundingClientRect().top;
  }

  function splitWordsToFit(page,label,text,isContinuation){
    const words=String(text||'').trim().split(/\s+/).filter(Boolean);
    if(!words.length) return {chunk:'',rest:''};

    let lo=1,hi=words.length,best=0,row=null;
    while(lo<=hi){
      const mid=Math.floor((lo+hi)/2);
      if(row) row.remove();
      row=addLongRow(page,isContinuation?label+' - تابع':label,words.slice(0,mid).join(' '));
      if(tableBottom(page)<=MAX_TABLE_BOTTOM){best=mid;lo=mid+1}else hi=mid-1;
    }
    if(row) row.remove();

    if(best===0) best=1;
    return {chunk:words.slice(0,best).join(' '),rest:words.slice(best).join(' ')};
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
        const row=addLongRow(page,section.label,'');
        if(tableBottom(page)>MAX_TABLE_BOTTOM){
          row.remove();
          page=pageShell('متابعة '+baseTitle);
          root.appendChild(page);pages.push(page);
          addLongRow(page,section.label,'');
        }
        continue;
      }

      while(rest){
        const test=addLongRow(page,continued?section.label+' - تابع':section.label,rest);
        if(tableBottom(page)<=MAX_TABLE_BOTTOM){
          rest='';
          break;
        }
        test.remove();

        const {chunk,rest:remaining}=splitWordsToFit(page,section.label,rest,continued);
        if(chunk){
          const fitted=addLongRow(page,continued?section.label+' - تابع':section.label,chunk);
          if(tableBottom(page)>MAX_TABLE_BOTTOM){
            fitted.remove();
            page=pageShell('متابعة '+baseTitle);
            root.appendChild(page);pages.push(page);
            continued=true;
            continue;
          }
        }
        rest=remaining;
        if(rest){
          page=pageShell('متابعة '+baseTitle);
          root.appendChild(page);pages.push(page);
          continued=true;
        }
      }
    }

    addSignatures(pages[pages.length-1],d);
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
        <img class="ipr-logo" alt="وزارة التعليم" src="data:image/jpeg;base64,${PDF_LOGO_B64}">
        <div class="ipr-head">
          المملكة العربية السعودية<br>
          وزارة التعليم<br>
          الإدارة العامة للتعليم بمنطقة المدينة المنورة<br>
          متوسطة جميلة بنت عمر بن الخطاب
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
      const deputy=selectedDeputyImage();
      const wrap=document.createElement('div');
      wrap.className='ipr-sign '+(deputy?'ipr-three':'ipr-two');
      wrap.style.position='static';
      let sign=`<div><div class="ipr-sign-label">معدة التقرير</div><div class="ipr-sign-name">${esc(d.preparer||'—')}</div></div>`;
      if(deputy) sign+=`<div><div class="ipr-sign-label">${esc(deputy.label)}</div><div class="ipr-sign-name">${esc(deputy.name)}</div></div>`;
      sign+=`<div><div class="ipr-sign-label">مديرة المدرسة</div><div class="ipr-sign-name">حنان الغامدي</div></div>`;
      wrap.innerHTML=sign;
      line.appendChild(wrap);
      pages.push(page);
    }
    return pages;
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

    const root=document.createElement('div');
    root.setAttribute('aria-hidden','true');
    root.style.cssText='position:fixed;left:-100000px;top:0;width:'+CSS_W+'px;background:#fff;z-index:-2147483647;';
    document.body.appendChild(root);

    try{
      const reportPages=buildReportPages(root,d);
      const evidencePages=buildEvidencePages(root,d);
      const pages=[...reportPages,...evidencePages];
      await waitForImages(root);
      if(document.fonts){
        try{
          await Promise.all([
            document.fonts.load('400 16px Tajawal'),
            document.fonts.load('500 16px Tajawal'),
            document.fonts.load('700 16px Tajawal')
          ]);
        }catch(e){}
        if(document.fonts.ready) await document.fonts.ready;
      }

      const doc=await PDFLib.PDFDocument.create();
      for(let i=0;i<pages.length;i++){
        if(typeof show==='function') show('جارٍ تجهيز صفحة '+(i+1)+' من '+pages.length+' بدقة 300 DPI...');
        const jpgBytes=await renderPageToJpeg(pages[i]);
        const img=await doc.embedJpg(jpgBytes);
        const p=doc.addPage([PDF_W,PDF_H]);
        p.drawImage(img,{x:0,y:0,width:PDF_W,height:PDF_H});
      }

      doc.setTitle('تقرير تنفيذ '+selectedReportTypeImage());
      doc.setCreator('مركز مصادر التعلم - متوسطة جميلة بنت عمر بن الخطاب');
      doc.setProducer('Browser image renderer - 300 DPI');
      return await doc.save();
    } finally {
      root.remove();
    }
  }

  // نستبدل فقط مرحلة إنشاء الملف النهائية. بقية الموقع والحفظ والشواهد تبقى كما هي.
  makePdfClient = makeImagePdfClient;
})();