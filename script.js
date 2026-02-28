const firebaseConfig = {
    apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8",
    authDomain: "secret-quest-class.firebaseapp.com",
    databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com",
    projectId: "secret-quest-class",
    storageBucket: "secret-quest-class.firebasestorage.app",
    messagingSenderId: "397245266210",
    appId: "1:397245266210:web:fde35d6a4dfd6ca7070d7b"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let state = { u: "Jina", lv: 1, points: 0, stats: { fert: 0, water: 0, nutr: 0 }, potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 }, emoji: [], tags: "", diary: "" };

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
    const f = document.getElementById('modal-foot');
    
    if(s === 1) { // 1단계: 단어 (PDF 3페이지)
        const ws = ['뿌듯한','설레는','평온한','신나는','든든한','서운한','외로운','울적한','화가 나는','조마조마한'];
        b.innerHTML = `<h2>[1단계] 감정 단어 고르기</h2><div class="word-grid">${ws.map(w => `<button class="word-btn" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        f.innerHTML = "";
    }
    else if(s === 2) { // 2단계: 이모지 (PDF 3페이지)
        b.innerHTML = `<h2>[2단계] 이모지 믹스</h2><p>오늘의 마음 이모지를 골라주세요.</p><div style="font-size:50px; text-align:center;">🧪 + ✨ = ?</div>`;
        f.innerHTML = `<button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(s === 3) { // 3-4단계: 물약/태그 (PDF 4페이지)
        b.innerHTML = `<h2>[3단계] 감정 물약 만들기</h2>${Object.keys(state.potions).map(p => `<div style="margin:5px 0;">${p} <input type="range" min="0" max="10" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                       <h2>[4단계] 감정 태그</h2><input type="text" id="tag-in" value="${state.tags}" style="width:100%; padding:10px;">`;
        f.innerHTML = `<button onclick="renderStep(5)">분석 결과 보러가기</button>`;
    }
    else if(s === 5) { // 5-6단계: 일기/분석 (PDF 5페이지)
        b.innerHTML = `<h2>[5단계] 일기 쓰기</h2><textarea id="diary-in" style="width:100%; height:80px;"></textarea>
                       <h2>[6단계] 분석 리포트</h2><canvas id="radarChart" width="200" height="200"></canvas>`;
        f.innerHTML = `<button onclick="saveAll()">감정 기록 종료</button>`;
        setTimeout(initRadar, 100);
    }
}

function initRadar() {
    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: { labels: Object.keys(state.potions), datasets: [{ data: Object.values(state.potions), backgroundColor: 'rgba(247, 208, 49, 0.5)' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

function saveAll() {
    state.diary = document.getElementById('diary-in').value;
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-diary').innerText = state.diary;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('q-btn').disabled = false;
    document.getElementById('q-btn').classList.remove('disabled');
    db.ref('students/Jina').set(state);
}
