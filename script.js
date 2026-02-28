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

let state = {
    u: "Jina", lv: 1, points: 0,
    stats: { fert: 0, water: 0, nutr: 0 },
    potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 },
    tempTags: "", tempDiary: ""
};

function startGame() {
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'flex';
}

function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderStep(1);
}

function renderStep(step) {
    const body = document.getElementById('modal-body');
    const nav = document.getElementById('modal-nav');

    if(step === 1) { // 1단계: 단어 고르기 (PDF Page 3)
        const words = ['뿌듯한','설레는','평온한','신나는','서운한','울적한','짜증나는','당황스러운'];
        body.innerHTML = `<h2>[1단계] 감정 단어 고르기</h2><div class="grid">${words.map(w => `<button onclick="state.tempTags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        nav.innerHTML = "";
    } 
    else if(step === 2) { // 2단계: 이모지 고르기 (PDF Page 3)
        body.innerHTML = `<h2>[2단계] 감정 이모지 조합</h2><p>오늘의 마음을 섞어보세요!</p><div style="font-size:40px; text-align:center;">🧪 + ✨ = ❓</div>`;
        nav.innerHTML = `<button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(step === 3) { // 3-4단계: 물약 및 태그 (PDF Page 4)
        body.innerHTML = `<h2>[3단계] 감정 물약 만들기</h2>${Object.keys(state.potions).map(p => `<div>${p} <input type="range" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                          <h2>[4단계] 태그 쓰기</h2><input id="tag-in" value="${state.tempTags}">`;
        nav.innerHTML = `<button onclick="renderStep(5)">분석 결과 보러가기</button>`;
    }
    else if(step === 5) { // 5-6단계: 일기 및 AI 결과 (PDF Page 5)
        body.innerHTML = `<h2>[5단계] 일기 쓰기</h2><textarea id="diary-in" placeholder="내용을 입력하세요"></textarea>
                          <h2>[6단계] 분석 결과</h2><canvas id="chart"></canvas>`;
        nav.innerHTML = `<button onclick="finish()">감정 기록 종료</button>`;
        setTimeout(initChart, 100);
    }
}

function finish() {
    state.tempDiary = document.getElementById('diary-in').value;
    document.getElementById('card-tags').innerText = state.tempTags;
    document.getElementById('card-diary').innerText = state.tempDiary;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('btn-q').disabled = false;
    document.getElementById('btn-q').classList.remove('disabled');
    db.ref('students/Jina').set(state);
}

function initChart() {
    new Chart(document.getElementById('chart'), {
        type: 'radar',
        data: { labels: Object.keys(state.potions), datasets: [{ data: Object.values(state.potions), backgroundColor: 'rgba(247, 208, 49, 0.5)' }] },
        options: { plugins: { legend: { display: false } } }
    });
}
