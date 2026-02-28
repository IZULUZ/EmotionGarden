// [1] Firebase 초기화
const firebaseConfig = {
    apiKey: "AIzaSyDw773x1yot2uncAMl_gTQ6z6Njhgh1Od8",
    authDomain: "secret-quest-class.firebaseapp.com",
    databaseURL: "https://secret-quest-class-default-rtdb.firebaseio.com",
    projectId: "secret-quest-class",
    storageBucket: "secret-quest-class.firebasestorage.app",
    messagingSenderId: "397245266210",
    appId: "1:397245266210:web:fde35d6a4dfd6ca7070d7b"
};
if (!firebase.apps.length) { firebase.initializeApp(firebaseConfig); }
const db = firebase.database();

// [2] 상태 관리
let state = {
    user: "Jina", lv: 1, points: 0,
    stats: { fert: 0, water: 0, nutr: 0 },
    potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 },
    emojiParts: [], finalEmoji: "🌱",
    diary: "", tags: "", quests: []
};

// [3] 모달 기능
function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderStep(1);
    else if(type === 'quest') renderQuestSelect();
    else if(type === 'shop') renderShop();
}

function renderStep(step) {
    const content = document.getElementById('modal-content');
    const footer = document.getElementById('modal-footer');
    
    if(step === 1) { // 1단계: 단어 고르기
        const words = ['뿌듯한','설레는','평온한','신나는','서운한','울적한','짜증나는','당황스러운'];
        content.innerHTML = `<h3>[1단계] 감정 단어 고르기</h3><div class="word-grid">${words.map(w => `<button class="word-btn" onclick="state.tags='#${w}'; renderStep(2)">${w}</button>`).join('')}</div>`;
        footer.innerHTML = "";
    }
    else if(step === 2) { // 2단계: 이모지 키친
        content.innerHTML = `<h3>[2단계] 이모지 키친</h3><div style="font-size:40px; text-align:center;">${state.emojiParts[0]||'❓'} + ${state.emojiParts[1]||'❓'} = ✨</div>
            <div style="text-align:center; margin-top:10px;">${['😊','😢','😡','☁️','🔥','💡'].map(e => `<button onclick="addEmoji('${e}')" style="font-size:25px; margin:5px;">${e}</button>`).join('')}</div>`;
        footer.innerHTML = `<button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(step === 3) { // 3단계: 물약
        content.innerHTML = `<h3>[3단계] 감정 물약 만들기</h3>${Object.keys(state.potions).map(k => `<div style="margin:10px 0;">${k} <input type="range" min="0" max="10" value="${state.potions[k]}" onchange="state.potions['${k}']=this.value"></div>`).join('')}`;
        footer.innerHTML = `<button onclick="renderStep(5)">일기 작성</button>`;
    }
    else if(step === 5) { // 5-6단계
        content.innerHTML = `<h3>[5단계] 일기 쓰기</h3><textarea id="diary-input" style="width:100%; height:80px;"></textarea><canvas id="radarChart"></canvas>`;
        footer.innerHTML = `<button onclick="finishRecord()">기록 완료</button>`;
        setTimeout(initRadar, 100);
    }
}

function addEmoji(e) {
    if(state.emojiParts.length < 2) state.emojiParts.push(e);
    else state.emojiParts = [e];
    renderStep(2);
}

function initRadar() {
    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: Object.keys(state.potions),
            datasets: [{ data: Object.values(state.potions), backgroundColor: 'rgba(168, 213, 186, 0.5)', borderColor: '#A8D5BA' }]
        },
        options: { plugins: { legend: { display: false } } }
    });
}

function finishRecord() {
    state.diary = document.getElementById('diary-input').value;
    state.finalEmoji = state.emojiParts.length === 2 ? "✨" : "🌱"; // 실제 합성 로직 대체
    
    // UI 반영
    document.getElementById('card-emoji').innerText = state.finalEmoji;
    document.getElementById('card-tags').innerText = state.tags;
    document.getElementById('card-diary').innerText = state.diary;
    
    // 퀘스트 버튼 활성화
    document.getElementById('btn-quest').disabled = false;
    document.getElementById('btn-quest').classList.remove('disabled');
    
    closeModal();
    saveData();
}

// [4] 상점 및 성장
function renderShop() {
    const content = document.getElementById('modal-content');
    content.innerHTML = `<h3>원예상점</h3>
        <button onclick="buy('fert')">💩 비료 (10P)</button>
        <button onclick="buy('water')">💧 물 (10P)</button>
        <button onclick="buy('nutr')">💊 영양제 (10P)</button>`;
    document.getElementById('modal-footer').innerHTML = `<button onclick="closeModal()">닫기</button>`;
}

function buy(type) {
    if(state.points < 10) return alert("포인트 부족!");
    state.points -= 10;
    state.stats[type] += 34;
    if(state.stats[type] > 100) state.stats[type] = 100;
    
    updateUI();
    if(state.stats.fert >= 100 && state.stats.water >= 100 && state.stats.nutr >= 100) {
        state.lv++;
        state.stats = { fert: 0, water: 0, nutr: 0 };
        alert("레벨업!");
    }
    saveData();
}

function updateUI() {
    document.getElementById('prog-fert').value = state.stats.fert;
    document.getElementById('prog-water').value = state.stats.water;
    document.getElementById('prog-nutr').value = state.stats.nutr;
    document.getElementById('ui-points').innerText = state.points;
    document.getElementById('ui-lv').innerText = state.lv;
    const plants = ['🌱','🌿','🪴','🌻','🌳'];
    document.getElementById('main-plant').innerText = plants[state.lv-1] || '🌳';
}

function saveData() { db.ref('students/' + state.user).set(state); }
function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }

// 초기 실행
updateUI();
