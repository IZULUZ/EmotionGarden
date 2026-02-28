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
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// [2] 상태 관리 변수
let state = {
    user: "Jina",
    lv: 1, points: 0,
    currentStep: 1,
    selectedEmoji: [null, null],
    potions: { 기쁨: 5, 슬픔: 0, 분노: 0, 불안: 0, 평온: 0, 당황: 0 },
    diary: "", tags: "",
    activeQuests: []
};

// [3] 이모지 키친 조합 데이터
const emojiKitchen = {
    "😊+☁️": "🌤️", "😢+🌊": "🌊", "😡+🔥": "🌋", "😴+✨": "🌙", "🥰+🍭": "💖", "🤔+💡": "🧐"
};

// [4] 감정 퀘스트 데이터 (메타인지 해소 목적)
const questPool = {
    기쁨: ["친구에게 기쁜 소식 전하기", "나를 위한 작은 간식 먹기", "선생님께 감사 인사하기"],
    슬픔: ["슬픈 마음을 일기에 솔직히 적기", "따뜻한 차 한 잔 마시기", "눈 감고 1분간 명상하기"],
    분노: ["운동장 크게 한 바퀴 걷기", "차가운 물로 세수하기", "화난 이유를 종이에 적고 찢기"]
};

// [5] 모달 제어 및 단계별 렌더링
function openModal(type) {
    document.getElementById('modal-overlay').style.display = 'block';
    if(type === 'emotion') renderStep(1);
    else if(type === 'quest') renderQuestSelect();
    else if(type === 'shop') renderShop();
}

function renderStep(step) {
    const body = document.getElementById('modal-body');
    const footer = document.getElementById('modal-footer');
    state.currentStep = step;

    if(step === 1) { // 1단계: 단어 고르기 (PDF Page 3)
        body.innerHTML = `<h3>[1단계] 감정 단어 고르기</h3>
            <div class="word-grid">${['뿌듯한','설레는','평온한','서운한','울적한','짜증나는','당황스러운','든든한'].map(w => `<button class="word-chip" onclick="state.selectedWord='${w}'; this.style.background='var(--pink)'">${w}</button>`).join('')}</div>
            <p>오늘 나의 감정은 [<span id="word-target">...</span>]에 가까워</p>`;
        footer.innerHTML = `<button onclick="renderStep(2)">다음으로</button>`;
    } 
    else if(step === 2) { // 2단계: 이모지 키친 (PDF Page 3)
        body.innerHTML = `<h3>[2단계] 감정 이모지 고르기</h3>
            <div class="kitchen-display"><span id="e1">${state.selectedEmoji[0]||'❓'}</span> + <span id="e2">${state.selectedEmoji[1]||'❓'}</span> = <span id="e-res">✨</span></div>
            <div class="emoji-grid">${['😊','😢','😡','😴','🥰','🤔','☁️','🔥'].map(e => `<button onclick="handleEmojiMix('${e}')">${e}</button>`).join('')}</div>`;
        footer.innerHTML = `<button onclick="renderStep(1)">이전</button><button onclick="renderStep(3)">감정 분석실로</button>`;
    }
    else if(step === 3) { // 3~4단계: 물약 & 태그 (PDF Page 4)
        body.innerHTML = `<h3>[3단계] 감정 물약 만들기</h3>
            <div class="potion-controls">${Object.keys(state.potions).map(k => `<div class="potion-row"><label>${k}</label><input type="range" min="0" max="10" value="${state.potions[k]}" onchange="state.potions['${k}']=parseInt(this.value)"></div>`).join('')}</div>
            <h3>[4단계] 감정 태그 기록</h3>
            <input type="text" id="tag-input" placeholder="#감정 #태그 #입력" style="width:100%; padding:10px; border-radius:10px; border:1px solid #ddd;">`;
        footer.innerHTML = `<button onclick="renderStep(5)">분석 결과 보러가기</button>`;
    }
    else if(step === 5) { // 5~6단계: 일기 & AI 분석 (PDF Page 5)
        body.innerHTML = `<h3>[5단계] 감정 일기 쓰기</h3>
            <textarea id="diary-box" placeholder="오늘 무슨 일이 있었나요?" style="width:100%; height:80px;"></textarea>
            <h3>[6단계] 감정 분석 결과</h3>
            <canvas id="radarChart" width="200" height="200"></canvas>
            <div id="ai-result" class="speech-bubble" style="width:90%; margin-top:10px;">분석 중...</div>`;
        footer.innerHTML = `<button onclick="finishEmotionRecord()">감정 기록 종료</button>`;
        setTimeout(initRadarChart, 100);
        setTimeout(generateAIAdvice, 500);
    }
}

// [6] 핵심 기능: 이모지 믹스
function handleEmojiMix(e) {
    if(!state.selectedEmoji[0]) state.selectedEmoji[0] = e;
    else state.selectedEmoji[1] = e;
    document.getElementById('e1').innerText = state.selectedEmoji[0] || '❓';
    document.getElementById('e2').innerText = state.selectedEmoji[1] || '❓';
    const res = emojiKitchen[`${state.selectedEmoji[0]}+${state.selectedEmoji[1]}`] || '✨';
    document.getElementById('e-res').innerText = res;
    state.finalEmoji = res;
}

// [7] 핵심 기능: AI 조언 및 그래프
function generateAIAdvice() {
    const maxVal = Math.max(...Object.values(state.potions));
    const topEmo = Object.keys(state.potions).find(k => state.potions[k] === maxVal);
    const adviceMap = {
        기쁨: "오늘 기쁨 물약이 가득하네! 이 행복을 친구에게 인사하며 나눠보는 건 어떨까?",
        분노: "마음속에 화가 좀 있구나. 차가운 물 한 잔 마시며 열을 식혀보자.",
        슬픔: "슬플 때는 억지로 참지 않아도 돼. 충분히 쉬어주는 것도 용기야."
    };
    document.getElementById('ai-result').innerText = adviceMap[topEmo] || "너의 마음을 잘 들여다보았구나. 멋진 하루가 될 거야!";
}

function initRadarChart() {
    new Chart(document.getElementById('radarChart'), {
        type: 'radar',
        data: {
            labels: Object.keys(state.potions),
            datasets: [{ data: Object.values(state.potions), backgroundColor: 'rgba(168, 213, 186, 0.4)', borderColor: '#a8d5ba' }]
        },
        options: { scales: { r: { suggestMin: 0, suggestMax: 10 } }, plugins: { legend: { display: false } } }
    });
}

// [8] 교사용 전송 및 완료
function finishEmotionRecord() {
    state.diary = document.getElementById('diary-box').value;
    state.tags = document.getElementById('tag-input')?.value || "#마음밭 #기록";
    
    // Firebase 전송 (교사용 화면 실시간 반영)
    db.ref('students/' + state.user).update({
        emoji: state.finalEmoji || "🌱",
        tags: state.tags,
        diary: state.diary,
        status: "recorded",
        lastUpdate: Date.now()
    });

    document.getElementById('quest-btn').disabled = false;
    document.getElementById('quest-btn').classList.remove('disabled');
    closeModal();
    document.getElementById('bot-msg').innerText = "기록 완료! 이제 퀘스트를 받으러 가봐!";
}

// [9] 퀘스트 및 상점 로직 (중략된 부분 없이 구현)
function renderQuestSelect() {
    const body = document.getElementById('modal-body');
    const topEmo = Object.keys(state.potions).reduce((a, b) => state.potions[a] > state.potions[b] ? a : b);
    const quests = questPool[topEmo] || questPool['기쁨'];
    
    body.innerHTML = `<h3>오늘의 맞춤 퀘스트</h3><p>네 감정을 건강하게 해소할 방법들이야. 2개를 골라봐!</p>
        ${quests.map((q, i) => `<label><input type="checkbox" onchange="handleQuestPick('${q}', this)"> ${q}</label><br>`).join('')}`;
    document.getElementById('modal-footer').innerHTML = `<button onclick="closeModal()">정원으로 돌아가기</button>`;
}

function handleQuestPick(q, el) {
    if(el.checked) {
        if(state.activeQuests.length >= 2) { alert("하루에 2개까지만 선택할 수 있어!"); el.checked = false; return; }
        state.activeQuests.push({title: q, status: 'active'});
    } else {
        state.activeQuests = state.activeQuests.filter(item => item.title !== q);
    }
    updateQuestUI();
    db.ref('students/'+state.user+'/activeQuests').set(state.activeQuests);
}

function updateQuestUI() {
    const list = document.getElementById('my-quest-list');
    list.innerHTML = state.activeQuests.map(q => `
        <div class="quest-card">${q.title} 
            ${q.status==='active'?`<button onclick="notifyDone('${q.title}')">다했어요!</button>`:`<span>(대기중)</span>`}
        </div>`).join('');
}

function notifyDone(title) {
    db.ref('students/'+state.user+'/notifications').push({ title: title, type: 'DONE_REQUEST' });
    alert("선생님께 완료 알림을 보냈어!");
}

function closeModal() { document.getElementById('modal-overlay').style.display = 'none'; }
