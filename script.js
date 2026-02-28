// Firebase 초기화 (선생님 설정 그대로 유지)
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
    const body = document.getElementById('modal-body');
    const foot = document.getElementById('modal-footer');
    
    if(s === 1) { // 1단계: 단어 (PDF 3p)
        const ws = ['뿌듯한','설레는','평온한','신나는','든든한','서운한','외로운','울적한','화가 나는','조마조마한'];
        body.innerHTML = `<h2 class="pixel-font">[1단계] 감정 단어</h2><div class="emoji-grid">${ws.map(w => `<button class="pixel-btn" style="font-size:12px" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        foot.innerHTML = "";
    }
    else if(s === 2) { // 2단계: 이모지 키친 (핵심)
        const emojis = ['😊','😢','😡','🥰','🥳','🤔','😱','😴','🙄','🤡'];
        body.innerHTML = `<h2 class="pixel-font">[2단계] 이모지 키친</h2>
            <div style="font-size:40px; text-align:center; margin:20px 0;">
                ${state.emoji[0] || '❓'} + ${state.emoji[1] || '❓'} = ✨
            </div>
            <div class="emoji-grid">${emojis.map(e => `<button class="emoji-btn" onclick="selectEmoji('${e}')">${e}</button>`).join('')}</div>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(s === 3) { // 3-4단계: 물약/태그 (PDF 4p)
        body.innerHTML = `<h2 class="pixel-font">[3단계] 감정 물약</h2>${Object.keys(state.potions).map(p => `<div class="pixel-font">${p} <input type="range" min="0" max="10" onchange="state.potions['${p}']=this.value"></div>`).join('')}
                          <h2 class="pixel-font">[4단계] 태그 확인</h2><input type="text" id="t-in" value="${state.tags}" class="pixel-font" style="width:100%">`;
        foot.innerHTML = `<button class="pixel-btn" onclick="renderStep(5)">분석 결과 보기</button>`;
    }
    else if(s === 5) { // 5-6단계: 일기/결과 (PDF 5p)
        body.innerHTML = `<h2 class="pixel-font">[5단계] 일기 쓰기</h2><textarea id="d-in" class="pixel-font" style="width:100%; height:80px"></textarea>
                          <h2 class="pixel-font">[6단계] 분석 리포트</h2><canvas id="chart"></canvas>`;
        foot.innerHTML = `<button class="pixel-btn" onclick="finish()">기록 종료</button>`;
        setTimeout(initChart, 100);
    }
}

function selectEmoji(e) {
    if(state.emoji.length < 2) state.emoji.push(e);
    else state.emoji = [e];
    renderStep(2);
}

function initChart() {
    new Chart(document.getElementById('chart'), {
        type: 'radar',
        data: { labels: Object.keys(state.potions), datasets: [{ data: Object.values(state.potions), backgroundColor: 'rgba(247, 208, 49, 0.5)' }] },
        options: { plugins: { legend: { display: false } } }
    });
}

function finish() {
    state.diary = document.getElementById('d-in').value;
    document.getElementById('card-emoji').innerText = state.emoji.join('') || '🌱';
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-diary').innerText = state.diary;
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('q-btn').disabled = false;
    document.getElementById('q-btn').classList.remove('disabled');
    db.ref('students/Jina').set(state);
}
