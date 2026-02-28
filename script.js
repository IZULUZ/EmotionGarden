const firebaseConfig = { /* 선생님의 Firebase 설정을 그대로 넣으세요 */ };
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let state = { u: "Jina", lv: 1, points: 0, potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 }, emoji: [], tags: "", diary: "" };

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

function openModal(t) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(t === 'emotion') renderStep(1);
}

function renderStep(s) {
    const b = document.getElementById('modal-body');
    const f = document.getElementById('modal-footer');
    if(s === 1) { // 1단계: 단어 고르기 (PDF 3p)
        const ws = ['뿌듯한','설레는','평온한','신나는','든든한','서운한','외로운','울적한'];
        b.innerHTML = `<h3 class="pixel-font">[1단계] 감정 단어</h3><div class="emoji-grid">${ws.map(w => `<button class="pixel-btn" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        f.innerHTML = "";
    } else if(s === 2) { // 2단계: 이모지 키친 (조합 기능)
        const es = ['😊','😢','😡','🥰','🥳','🤔','😱','😴'];
        b.innerHTML = `<h3 class="pixel-font">[2단계] 이모지 키친</h3><div style="font-size:30px; text-align:center;">${state.emoji[0]||'❓'}+${state.emoji[1]||'❓'}</div>
                       <div class="emoji-grid">${es.map(e => `<button class="pixel-btn" onclick="addE('${e}')">${e}</button>`).join('')}</div>`;
        f.innerHTML = `<button class="pixel-btn" onclick="renderStep(3)">감정 분석실로</button>`;
    } else if(s === 3) { // 3-4단계: 물약/태그 (PDF 4p)
        b.innerHTML = `<h3 class="pixel-font">[3단계] 감정 물약</h3>${Object.keys(state.potions).map(p => `<div>${p} <input type="range" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                       <h3 class="pixel-font">[4단계] 태그</h3><input id="tin" value="${state.tags}" style="width:100%">`;
        f.innerHTML = `<button class="pixel-btn" onclick="renderStep(5)">분석 결과 보기</button>`;
    } else if(s === 5) { // 5-6단계: 일기/분석 (PDF 5p)
        b.innerHTML = `<h3 class="pixel-font">[5단계] 일기</h3><textarea id="din" style="width:100%;height:50px"></textarea><canvas id="ch"></canvas>`;
        f.innerHTML = `<button class="pixel-btn" onclick="save()">기록 완료</button>`;
        setTimeout(draw, 100);
    }
}

function addE(e) { if(state.emoji.length<2) state.emoji.push(e); else state.emoji=[e]; renderStep(2); }
function draw() { new Chart(document.getElementById('ch'), { type:'radar', data:{ labels:Object.keys(state.potions), datasets:[{data:Object.values(state.potions), backgroundColor:'rgba(247,208,49,0.5)'}] } }); }

function save() {
    state.diary = document.getElementById('din').value;
    document.getElementById('card-emoji').innerText = state.emoji.join('') || '🌱';
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-diary').innerText = state.diary;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('q-btn').disabled = false;
    document.getElementById('q-btn').classList.remove('disabled');
    db.ref('students/Jina').set(state);
}
