// Firebase 초기화 (위와 동일 설정 사용)
const db = firebase.database();
let currentStudentId = "student_01"; // 예시 ID
let selectedEmojiParts = [];
let myQuests = {};

// 1. 감정별 퀘스트 데이터베이스
const questDB = {
    '기쁨': [
        "친구에게 따뜻한 인사 건네기",
        "나의 행복한 순간 사진 찍기",
        "우유 급식 때 친구 도와주기",
        "선생님께 감사 인사 드리기"
    ],
    '슬픔': [
        "슬픈 마음을 종이에 쓰고 찢기",
        "좋아하는 노래 1곡 듣기",
        "따뜻한 물 한 잔 마시기",
        "나를 위한 응원 문구 적기"
    ],
    '분노': [
        "심호흡 5번 크게 하기",
        "운동장 한 바퀴 뛰고 오기",
        "자리에 앉아 10초간 눈 감기",
        "화난 이유 차분하게 기록하기"
    ]
    // ... 다른 감정들 추가
};

// 2. 이모지 키친 로직
function selectEmojiKitchen(emoji) {
    if(selectedEmojiParts.length < 2) {
        selectedEmojiParts.push(emoji);
    } else {
        selectedEmojiParts = [emoji];
    }
    renderEmojiPreview();
}

function renderEmojiPreview() {
    const e1 = selectedEmojiParts[0] || '❓';
    const e2 = selectedEmojiParts[1] || '❓';
    let result = '❓';
    if(selectedEmojiParts.length === 2) {
        result = "✨"; // 실제 합성 이미지 로직 대입부
    }
    // UI 업데이트 로직...
}

// 3. 감정 분석 및 퀘스트 생성
function finalizeEmotionAnalysis() {
    const diaryText = document.getElementById('diary-input').value;
    const potionData = getPotionValues(); // 육각형 그래프 값 추출
    
    // 주된 감정 추출 (가장 높은 수치)
    const mainEmotion = Object.keys(potionData).reduce((a, b) => potionData[a] > potionData[b] ? a : b);
    
    // AI 추천 퀘스트 (해당 감정 카테고리에서 랜덤 3개)
    const candidates = questDB[mainEmotion] || questDB['기쁨'];
    const recommended = candidates.sort(() => 0.5 - Math.random()).slice(0, 3);
    
    // Firebase 업로드
    db.ref('students/' + currentStudentId).update({
        lastEmotion: mainEmotion,
        recommendQuests: recommended,
        isRecording: false,
        tags: "#" + mainEmotion + " #성장중"
    });
    
    // 버튼 활성화
    document.getElementById('btn-quest').disabled = false;
    document.getElementById('btn-quest').classList.remove('disabled');
    showHelper("분석 완료! '감정 퀘스트 받기'에서 오늘 할 일을 골라봐.");
}

// 4. 퀘스트 수락 (최대 3개)
function acceptQuest(title) {
    const currentCount = Object.keys(myQuests).length;
    if(currentCount >= 3) {
        alert("퀘스트는 하루에 3개까지만 받을 수 있어!");
        return;
    }
    
    const qKey = Date.now();
    db.ref(`students/${currentStudentId}/quests/${qKey}`).set({
        title: title,
        status: 'active'
    });
}

// 5. 퀘스트 완료 알림 (학생이 '다했어요' 클릭 시)
function sendDoneNotification(qKey) {
    db.ref(`students/${currentStudentId}/quests/${qKey}`).update({
        status: 'pending' // 선생님 승인 대기 상태
    });
    showHelper("선생님께 알림을 보냈어! 잠시만 기다려줘.");
}
