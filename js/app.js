(function () {
'use strict';
const KEY = 'funkcii9-homework4-v1';
let state;
try { state = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
if (!state || !state.results || !state.positions) state = {results:{},positions:{practice:0,theory:0}};
const $ = s => document.querySelector(s);
const el = (tag, text, cls) => { const e=document.createElement(tag); if(text!==undefined)e.textContent=text; if(cls)e.className=cls; return e; };
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(_){$('#save-note').textContent='Сохранение недоступно. Скопируй отчёт перед выходом.';} counts();}
function result(key){return state.results[key] || (state.results[key]={attempts:0,draft:null,confidence:'',hint:false,solution:false,history:[]});}
function counts(){['practice','theory'].forEach(group=>{$('#count-'+group).textContent=HW[group].filter((_,i)=>state.results[group+i]?.solved).length+'/'+HW[group].length;});}
function graph(kind,a){
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 240 200');svg.setAttribute('role','img');svg.setAttribute('aria-label',kind==='slider'?'График y = ax² и точка A(2; −2)':'График для сопоставления; масштаб по осям одинаковый');
 const path=(d,color,width)=>{const p=document.createElementNS(svg.namespaceURI,'path');p.setAttribute('d',d);p.setAttribute('stroke',color);p.setAttribute('stroke-width',width);p.setAttribute('fill','none');svg.append(p);};
 for(let x=20;x<240;x+=20)path(`M${x} 0V200`,'#e7e9e5',1);
 for(let y=0;y<=200;y+=20)path(`M0 ${y}H240`,'#e7e9e5',1);
 path('M0 100H240M120 0V200','#8c9891',1.5);
 const text=(x,y,s)=>{const t=document.createElementNS(svg.namespaceURI,'text');t.setAttribute('x',x);t.setAttribute('y',y);t.setAttribute('font-size','11');t.textContent=s;svg.append(t);};
 text(228,95,'x');text(126,12,'y');text(124,113,'0');text(160,113,'2');text(124,63,'2');text(124,144,'−2');
 let d='',pen=false;
 for(let i=0;i<=480;i++){const x=-6+i/40;const y=kind==='line'?-2*x+1:kind==='square'?x*x:kind==='hyperbola'?(Math.abs(x)<.01?NaN:-4/x):kind==='abs'?Math.abs(x):a*x*x;
 if(!Number.isFinite(y)||Math.abs(y)>5.5){pen=false;continue;}d+=(pen?'L':'M')+(120+x*20).toFixed(2)+' '+(100-y*20).toFixed(2);pen=true;}
 path(d,'#24775c',2.8);
 if(kind==='slider'){const dot=document.createElementNS(svg.namespaceURI,'circle');dot.setAttribute('cx','160');dot.setAttribute('cy','140');dot.setAttribute('r','4');dot.setAttribute('fill','#d46b42');svg.append(dot);text(168,155,'A(2; −2)');}
 return svg;
}
function number(s){if(!String(s).trim())return NaN;try {const r=Formula.tryCompile(String(s));if(r.error||/[xх]/i.test(s))return NaN;return r.f(0);} catch(_){return NaN;}}
function correct(task,value){if(task.type==='fields')return task.answer.every((x,i)=>Math.abs(number(value[i])-x)<1e-8);
 if(task.type==='slider')return Math.abs(Number(value[0])-task.answer[0])<1e-8 && value[1]===task.answer[1];
 if(task.type==='multi')return JSON.stringify([...value].sort())===JSON.stringify([...task.answer].sort());
 return JSON.stringify(value)===JSON.stringify(task.answer);}
window.HomeworkCheck={correct,number};
function route(){const group=location.hash.slice(1)||'practice';document.querySelectorAll('.tabs a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+group?'page':'false'));$('#content').replaceChildren();if(group==='report')renderReport();else renderTask(group==='theory'?'theory':'practice');counts();}
function renderTask(group){
 const tasks=HW[group],i=Math.max(0,Math.min(tasks.length-1,state.positions[group]||0)),t=tasks[i],key=group+i,r=result(key),root=$('#content');
 const intro=el('div',undefined,'section-intro');intro.append(el('h2',group==='practice'?'Закрепи восемь семейств функций':'Проверь основы перед новой темой'),el('p',group==='practice'?'Решай на бумаге, а ответы вводи здесь. Десятичные дроби пиши с точкой или запятой; обычные дроби — через /.':'Сначала ответь по памяти. Перед проверкой отметь уверенность. Если не помнишь правило, открой подсказку: это тоже полезно для разбора с учителем.'));root.append(intro);
 const dots=el('nav',undefined,'task-nav');dots.setAttribute('aria-label','Переход к заданию');tasks.forEach((x,j)=>{const rr=state.results[group+j],b=el('button',String(j+1),j===i?'current':rr?.solved?'done':'');b.title=x.title;b.setAttribute('aria-label',`Задание ${j+1}: ${x.title}${rr?.solved?', решено':''}`);if(j===i)b.setAttribute('aria-current','step');b.onclick=()=>{state.positions[group]=j;save();route();};dots.append(b);});root.append(dots);
 const card=el('article',undefined,'card');root.append(card);
 const top=el('div',undefined,'card-top');top.append(el('span',`ЗАДАНИЕ ${String(i+1).padStart(2,'0')} / ${tasks.length}`),el('span',t.topic));card.append(top,el('h2',t.title),el('p',t.q,'question'));
 const form=el('form'),controls=el('div',undefined,'controls');form.append(controls);card.append(form);
 let read,order;
 function keep(){r.draft=read();save();}
 function select(options,value,label){const s=el('select');s.setAttribute('aria-label',label);const initial=el('option','Выбери ответ');initial.value='';s.append(initial);options.forEach((x,j)=>{const op=el('option',x);op.value=String(j);s.append(op);});s.value=value??'';s.onchange=keep;return s;}
 if(t.graphs){const grid=el('div',undefined,'graph-grid');['square','abs','line','hyperbola'].forEach((kind,j)=>{const box=el('figure');box.append(el('figcaption',['А','Б','В','Г'][j]),graph(kind));grid.append(box);});controls.append(grid);}
 if(t.type==='choice'||t.type==='multi'){
 const options=el('fieldset');options.append(el('legend',t.type==='multi'?'Выбери все верные ответы':'Выбери один ответ','sr-only'));const inputs=[];
 t.options.forEach((x,j)=>{const label=el('label',undefined,'option'),inp=el('input');inp.type=t.type==='multi'?'checkbox':'radio';inp.name=key;inp.value=String(j);inp.checked=t.type==='multi'?!!r.draft?.includes(String(j)):r.draft===String(j);inp.onchange=keep;inputs.push(inp);label.append(inp,el('span',x));options.append(label);});controls.append(options);read=()=>t.type==='multi'?inputs.filter(x=>x.checked).map(x=>x.value):inputs.find(x=>x.checked)?.value??'';
 }else if(t.type==='fields'){
 const inputs=t.labels.map((x,j)=>{const label=el('label',x,'field'),inp=el('input');inp.type='text';inp.inputMode='text';inp.autocomplete='off';inp.spellcheck=false;inp.value=r.draft?.[j]??'';inp.oninput=keep;label.append(inp);controls.append(label);return inp;});read=()=>inputs.map(x=>x.value);
 }else if(t.type==='match'){
 const inputs=t.rows.map((x,j)=>{const row=el('label',undefined,'match-row'),s=select(t.options,r.draft?.[j],x);row.append(el('span',x),s);controls.append(row);return s;});read=()=>inputs.map(x=>x.value);
 }else if(t.type==='order'){
 order=r.draft?.slice()||t.steps.map((_,j)=>String(j));const list=el('div');controls.append(list);function draw(){list.replaceChildren();order.forEach((id,j)=>{const row=el('div',undefined,'order-row');row.append(el('span',`${j+1}. ${t.steps[Number(id)]}`));[-1,1].forEach(dir=>{const b=el('button',dir<0?'↑':'↓');b.type='button';b.setAttribute('aria-label',(dir<0?'Поднять: ':'Опустить: ')+t.steps[id]);b.disabled=j+dir<0||j+dir>=order.length;b.onclick=()=>{[order[j],order[j+dir]]=[order[j+dir],order[j]];draw();keep();};row.append(b);});list.append(row);});}read=()=>order.slice();draw();
 }else if(t.type==='slider'){
 const wrap=el('div',undefined,'slider-graph');controls.append(wrap);const label=el('label',undefined,'range-label'),range=el('input'),out=el('output');range.type='range';range.min='-2';range.max='2';range.step='.25';range.value=r.draft?.[0]??'1';label.append(el('span','Коэффициент a'),range,out);controls.append(label);const direction=select(t.options,r.draft?.[1],'Направление ветвей');const directionLabel=el('label','Ветви направлены:','field');directionLabel.append(direction);controls.append(directionLabel);read=()=>[range.value,direction.value];function draw(){out.textContent='a = '+range.value.replace('.',',');wrap.replaceChildren(graph('slider',Number(range.value)));}range.oninput=()=>{draw();keep();};draw();
 }
 const confidence=el('fieldset',undefined,'confidence');confidence.append(el('legend','Насколько ты уверен в ответе?'));
 ['Уверен','Сомневаюсь','Пока не помню правило'].forEach(x=>{const label=el('label'),input=el('input');input.type='radio';input.name='confidence';input.value=x;input.checked=r.confidence===x;input.onchange=()=>{r.confidence=x;save();};label.append(input,document.createTextNode(x));confidence.append(label);});form.append(confidence);
 const feedback=el('div',undefined,'feedback');feedback.setAttribute('aria-live','polite');
 const actions=el('div',undefined,'actions'),check=el('button',r.solved?'Ответ уже верный':'Проверить ответ','primary'),hint=el('button','Нужна подсказка','secondary'),solution=el('button','Разобрать решение','secondary');hint.type=solution.type='button';check.type='submit';check.disabled=!!r.solved;solution.hidden=!r.solved&&r.attempts<2&&!r.solution;
 const help=el('div',undefined,'help');hint.onclick=()=>{r.hint=true;save();showHelp();};solution.onclick=()=>{r.solution=true;save();showHelp();};function showHelp(){help.replaceChildren();if(r.hint)help.append(el('p','Подсказка: '+t.hint));if(r.solution)help.append(el('p','Решение: '+t.solution));}showHelp();actions.append(check,hint,solution);form.append(actions,feedback,help);
 function showSolved(){feedback.className='feedback success';feedback.textContent='Верно. '+t.solution;}
 function lockAnswer(){controls.querySelectorAll('input,select,button').forEach(e=>e.disabled=true);confidence.querySelectorAll('input').forEach(e=>e.disabled=true);}
 if(r.solved){showSolved();lockAnswer();}
 form.onsubmit=e=>{e.preventDefault();if(r.solved)return;const value=read(),values=Array.isArray(value)?value:[value];if(!values.length||values.some(x=>!String(x).trim())){feedback.className='feedback error';feedback.textContent='Заполни все поля ответа.';return;}if(!r.confidence){feedback.className='feedback error';feedback.textContent='Перед проверкой отметь, насколько ты уверен.';return;}
 if(t.type==='fields'&&value.some(x=>!Number.isFinite(number(x)))){feedback.className='feedback error';feedback.textContent='Введи числа, например −2, 0,5 или 1/2. Буквы и знак равенства вводить не нужно.';return;}
 const ok=correct(t,value);r.draft=value;r.attempts++;r.history.push({value,ok,confidence:r.confidence,hint:r.hint,solution:r.solution});if(r.attempts===1){r.firstCorrect=ok;r.firstConfidence=r.confidence;r.firstHint=r.hint;r.firstSolution=r.solution;}
 if(ok){r.solved=true;check.disabled=true;check.textContent='Ответ уже верный';showSolved();lockAnswer();}else{feedback.className='feedback error';feedback.textContent='Пока неверно. Проверь каждый пункт и попробуй ещё раз. После двух попыток доступен разбор решения.';}
 solution.hidden=!r.solved&&r.attempts<2;save();};
 const pager=el('div',undefined,'pager');const prev=el('button','← Назад','secondary'),next=el('button',i===tasks.length-1?'К результатам →':'Следующее задание →','primary');prev.disabled=i===0;prev.onclick=()=>{state.positions[group]=i-1;save();route();};next.onclick=()=>{if(i===tasks.length-1)location.hash='report';else{state.positions[group]=i+1;save();route();}};pager.append(prev,next);root.append(pager);
}
function status(r){return !r?.attempts?'Ещё не проверено':r.solved?(r.firstCorrect&&!r.firstHint&&!r.firstSolution?'С первой попытки без помощи':'Решено после ошибки или с помощью'):'Нужно вернуться';}
function formatAnswer(t,value){
 if(value===null||value===undefined)return 'нет ответа';
 if(t.type==='choice')return t.options[Number(value)];
 if(t.type==='multi')return value.map(i=>t.options[Number(i)]).join('; ');
 if(t.type==='match')return value.map((v,i)=>t.rows[i]+': '+t.options[Number(v)]).join('; ');
 if(t.type==='order')return value.map(i=>t.steps[Number(i)]).join(' → ');
 if(t.type==='slider')return 'a = '+value[0]+'; ветви: '+t.options[Number(value[1])];
 return value.map((v,i)=>t.labels[i]+' '+v).join('; ');
}
function reportText(){const lines=['Домашняя работа · Раздел 4 и основы 7–8 класса',new Date().toLocaleDateString('ru-RU'),''];for(const group of ['practice','theory']){lines.push(group==='practice'?'ФУНКЦИИ':'ОСНОВЫ 7–8 КЛАССА');HW[group].forEach((t,i)=>{const r=state.results[group+i];lines.push(`${i+1}. ${t.title} [${t.topic}] — ${status(r)}. Попыток: ${r?.attempts||0}.`);if(r?.attempts){lines.push(`   Первый ответ: ${formatAnswer(t,r.history[0].value)}; ${r.firstCorrect?'верно':'неверно'}; уверенность: ${r.firstConfidence}.`);lines.push(`   Последний ответ: ${formatAnswer(t,r.draft)}. Подсказка: ${r.hint?'да':'нет'}; разбор: ${r.solution?'да':'нет'}.`);}});lines.push('');}lines.push('Сводка отражает ответы в этом браузере; самостоятельность вне сайта не проверяется.');return lines.join('\n');}
function renderReport(){const root=$('#content');root.append(el('h2','Посмотри, что уже получается'),el('p','Это диагностика, а не отметка. Обсуди с учителем темы, где ошибся уверенно или воспользовался помощью.'));
 const metrics=el('div',undefined,'metrics');for(const group of ['practice','theory']){const rs=HW[group].map((_,i)=>state.results[group+i]);const box=el('div');box.append(el('strong',`${rs.filter(r=>r?.solved).length} / ${rs.length}`),el('span',group==='practice'?'решено по функциям':'решено по основам'),el('small',`С первой попытки без помощи: ${rs.filter(r=>r?.firstCorrect&&!r.firstHint&&!r.firstSolution).length}`));metrics.append(box);}root.append(metrics);
 for(const group of ['practice','theory']){root.append(el('h3',group==='practice'?'Функции':'Основы алгебры'));const list=el('div',undefined,'report-list');const topics=[...new Set(HW[group].map(t=>t.topic))];topics.forEach(topic=>{const indices=HW[group].map((t,i)=>t.topic===topic?i:-1).filter(i=>i>=0);const rs=indices.map(i=>state.results[group+i]);const clean=rs.filter(r=>r?.firstCorrect&&!r.firstHint&&!r.firstSolution).length;const tested=rs.filter(r=>r?.attempts).length;const row=el('div',undefined,'report-row');row.append(el('strong',topic),el('span',!tested?'Ещё не проверено':tested<indices.length?`Проверено ${tested} из ${indices.length}`:clean===indices.length?'Верно с первой попытки без помощи':'Повтори правило и реши похожий пример'));list.append(row);});root.append(list);
 HW[group].forEach((t,i)=>{const r=state.results[group+i],link=el('a',`${i+1}. ${t.title} · ${status(r)}${r?.attempts&&!r.firstCorrect&&r.firstConfidence==='Уверен'?' · Была уверенная ошибка':''}`,'result-link');link.href='#'+group;link.onclick=()=>{state.positions[group]=i;save();};root.append(link);});}
 const actions=el('div',undefined,'actions'),copy=el('button','Скопировать отчёт','primary'),download=el('button','Скачать отчёт .txt','secondary'),notice=el('p');notice.setAttribute('aria-live','polite');const preview=el('textarea');preview.value=reportText();preview.readOnly=true;preview.setAttribute('aria-label','Отчёт для учителя');preview.rows=10;
 copy.onclick=async()=>{try{await navigator.clipboard.writeText(reportText());notice.textContent='Отчёт скопирован. Отправь его учителю.';}catch(_){preview.focus();preview.select();notice.textContent='Выделили отчёт. Скопируй его вручную или скачай файл.';}};
 download.onclick=()=>{const url=URL.createObjectURL(new Blob([reportText()],{type:'text/plain;charset=utf-8'})),a=el('a');a.href=url;a.download='otchet-dz4.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};actions.append(copy,download);root.append(actions,notice,preview);
 const reset=el('button','Начать заново','reset');reset.onclick=()=>{if(confirm('Все ответы и результаты этой домашки будут удалены из этого браузера. Продолжить?')){state={results:{},positions:{practice:0,theory:0}};save();route();}};root.append(reset);
}
window.addEventListener('hashchange',route);route();
})();
