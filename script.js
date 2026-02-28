// Firebase 초기화 (선생님 정보를 여기에 넣으세요)
const firebaseConfig = {
    apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8",
    databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com",
    projectId: "secret-quest-class",
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let state = { emoji: [], tags: "", diary: "", potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 } };

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

function openModal(t) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(t === 'emotion') renderStep(1);
}

function renderStep(s) {
    const body = document.getElementById('modal-body');
    const foot = document.getElementById('modal-footer');
    
    if(s === 1) { // 1단계: 단어 고르기
        const ws = ['뿌듯한','신나는','설레는','평온한','서운한','울적한','화가난','겁나는'];
        body.innerHTML = `<h3 class="pixel-font">[1단계] 감정 단어</h3><div class="emoji-kitchen">${ws.map(w => `<button class="pixel-btn" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        foot.innerHTML = "";
    } else if(s === 2) { // 2단계: 이모지 키친
        const es = ['😊','😢','😡','🥳','🤔','😱','😴','😍','🙄','😎'];
        body.innerHTML = `<h3 class="pixel-font">[2단계] 이모지 키친</h3>
            <div style="font-size:30px; text-align:center; margin:10px;">${state.emoji[0]||'❓'} + ${state.emoji[1]||'❓'}</div>
            <div class="emoji-kitchen">${es.map(e => `<button class="pixel-btn" style="font-size:20px" onclick="mix('${e}')">${e}</button>`).join('')}</div>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderStep(3)">조합 완료</button>`;
    } else if(s === 3) { // 3-4단계: 물약/태그
        body.innerHTML = `<h3 class="pixel-font">[3단계] 감정 물약</h3>${Object.keys(state.potions).map(p => `<div>${p} <input type="range" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                          <h3 class="pixel-font">[4단계] 태그</h3><input id="t-in" value="${state.tags}" style="width:100%">`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderStep(5)">결과 보기</button>`;
    } else if(s === 5) { // 5-6단계: 일기/분석
        body.innerHTML = `<h3 class="pixel-font">[5단계] 일기</h3><textarea id="d-in" style="width:100%; height:60px;"></textarea><canvas id="myChart"></canvas>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="save()">기록 저장</button>`;
        setTimeout(initChart, 100);
    }
}

function mix(e) { if(state.emoji.length < 2) state.emoji.push(e); else state.emoji = [e]; renderStep(2); }
function initChart() { new Chart(document.getElementById('myChart'), { type:'radar', data:{ labels:Object.keys(state.potions), datasets:[{data:Object.values(state.potions), backgroundColor:'rgba(247, 208, 49, 0.5)'}] } }); }

function save() {
    state.diary = document.getElementById('d-in').value;
    document.getElementById('card-emoji').innerText = state.emoji.join('') || '🌱';
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-diary').innerText = state.diary;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('q-btn').disabled = false;
    document.getElementById('q-btn').classList.remove('disabled');
    db.ref('students/Jina').set(state);
}
