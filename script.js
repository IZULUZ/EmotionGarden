const firebaseConfig = {
    apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8",
    authDomain: "secret-quest-class.firebaseapp.com",
    databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com",
    projectId: "secret-quest-class",
    storageBucket: "secret-quest-class.firebasestorage.app",
    messagingSenderId: "397245266210",
    appId: "1:397245266210:web:fde35d6a4dfd6ca7070d7b"
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

let state = { u: "Jina", lv: 1, points: 0, stats: { fert: 0, water: 0, nutr: 0 }, potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 }, tags: "", diary: "" };

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

function openModal(t) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(t === 'emotion') renderStep(1);
}

function renderStep(s) {
    const content = document.getElementById('modal-content');
    const footer = document.getElementById('modal-footer');
    
    if(s === 1) { // 1단계: 단어 고르기 (PDF Page 3)
        const words = ['뿌듯한','설레는','평온한','신나는','든든한','서운한','외로운','울적한','짜증나는','무서운'];
        content.innerHTML = `<h2>[1단계] 감정 단어 고르기</h2><div class="word-grid">${words.map(w => `<button class="word-btn" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        footer.innerHTML = "";
    }
    else if(s === 2) { // 2단계: 이모지 조합 (PDF Page 3)
        content.innerHTML = `<h2>[2단계] 이모지 조합하기</h2><p style="text-align:center; font-size:40px;">🧪 + ✨ = ?</p>`;
        footer.innerHTML = `<button onclick="renderStep(3)">분석실 이동</button>`;
    }
    else if(s === 3) { // 3-4단계: 물약/태그 (PDF Page 4)
        content.innerHTML = `<h2>[3단계] 감정 물약 만들기</h2>${Object.keys(state.potions).map(p => `<div style="margin:5px 0;">${p} <input type="range" min="0" max="10" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                             <h2>[4단계] 태그 확인</h2><input type="text" id="tag-in" value="${state.tags}" style="width:100%; padding:5px;">`;
        footer.innerHTML = `<button onclick="renderStep(5)">결과 보기</button>`;
    }
    else if(s === 5) { // 5-6단계: 일기/분석 (PDF Page 5)
        content.innerHTML = `<h2>[5단계] 감정 일기</h2><textarea id="diary-in" style="width:100%; height:60px;"></textarea>
                             <h2>[6단계] 감정 리포트</h2><canvas id="radarChart"></canvas>`;
        footer.innerHTML = `<button onclick="saveAll()">기록 완료</button>`;
        setTimeout(initChart, 100);
    }
}

function initChart() {
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
