let currentUser = null;
let soldiers = [];
let attendance = {};

// بيانات تسجيل دخول القيادة
const LEADERSHIP_USER = 'af1';
const LEADERSHIP_PASS = 'af2';

// وظائف LocalStorage
function loadData() {
  const soldiersData = localStorage.getItem('soldiers');
  const attendanceData = localStorage.getItem('attendance');

  if (soldiersData) {
    soldiers = JSON.parse(soldiersData);
  }
  if (attendanceData) {
    attendance = JSON.parse(attendanceData);
  }
}

function saveSoldiers() {
  localStorage.setItem('soldiers', JSON.stringify(soldiers));
}

function saveAttendance() {
  localStorage.setItem('attendance', JSON.stringify(attendance));
}

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
  loadData();
  showPage('loginPage');

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('addSoldierForm').addEventListener('submit', handleAddSoldier);
  document.getElementById('deleteSoldierForm').addEventListener('submit', handleDeleteSoldier);
  document.getElementById('pointsForm').addEventListener('submit', handlePointsChange);
  document.getElementById('strikeForm').addEventListener('submit', handleStrikeAdd);
});

function handleLogin(e) {
  e.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();

  // تحقق من تسجيل دخول القيادة
  if (username === LEADERSHIP_USER && password === LEADERSHIP_PASS) {
    currentUser = {
      type: 'leadership',
      username: username,
      name: 'القيادة'
    };
    showLeadershipDashboard();
    return;
  }

  // تحقق من تسجيل دخول العسكري
  const soldier = soldiers.find(s => s.username === username && s.password === password);

  if (soldier) {
    currentUser = {
      type: 'soldier',
      username: username,
      number: soldier.number,
      name: soldier.name
    };
    showSoldierDashboard();
    return;
  }

  alert('اسم المستخدم أو كلمة المرور غير صحيحة');
}

function handleAddSoldier(e) {
  e.preventDefault();

  const name = document.getElementById('soldierName').value.trim();
  const unit = document.getElementById('soldierUnit').value.trim();
  const rank = document.getElementById('soldierRank').value.trim();
  const number = document.getElementById('soldierNumber').value.trim();
  const username = document.getElementById('soldierUsername').value.trim();
  const password = document.getElementById('soldierPassword').value.trim();

  // التحقق من عدم تكرار اسم المستخدم
  if (soldiers.find(s => s.username === username)) {
    alert('اسم المستخدم موجود بالفعل');
    return;
  }

  // التحقق من عدم تكرار الرقم
  if (soldiers.find(s => s.number === number)) {
    alert('هذا الرقم موجود بالفعل في النظام');
    return;
  }

  const soldier = {
    name: name,
    unit: unit,
    rank: rank,
    number: number,
    username: username,
    password: password,
    points: 0,
    strikes: []
  };

  soldiers.push(soldier);
  saveSoldiers();

  alert(`تم إضافة العسكري ${name} بنجاح`);
  document.getElementById('addSoldierForm').reset();
  displaySoldiersList('soldiersListLeadership');
}

function handleDeleteSoldier(e) {
  e.preventDefault();

  const number = document.getElementById('deleteSoldierNumber').value.trim();
  const soldierIndex = soldiers.findIndex(s => s.number === number);

  if (soldierIndex === -1) {
    alert('العسكري غير موجود في النظام');
    return;
  }

  const soldier = soldiers[soldierIndex];
  if (confirm(`هل أنت متأكد من حذف العسكري ${soldier.name}؟`)) {
    soldiers.splice(soldierIndex, 1);
    delete attendance[number];
    saveSoldiers();
    saveAttendance();

    alert('تم حذف العسكري بنجاح');
    document.getElementById('deleteSoldierForm').reset();
    displaySoldiersList('soldiersListLeadership');
  }
}

function handlePointsChange(e) {
  e.preventDefault();

  const number = document.getElementById('pointsSoldierNumber').value.trim();
  const pointsChange = parseInt(document.getElementById('pointsAmount').value);

  const soldier = soldiers.find(s => s.number === number);

  if (!soldier) {
    alert('العسكري غير موجود في النظام');
    return;
  }

  soldier.points = (soldier.points || 0) + pointsChange;
  saveSoldiers();

  const action = pointsChange > 0 ? 'إضافة' : 'إزالة';
  alert(`تم ${action} ${Math.abs(pointsChange)} نقطة ${pointsChange > 0 ? 'إلى' : 'من'} ${soldier.name}`);
  document.getElementById('pointsForm').reset();
  displaySoldiersList('soldiersListLeadership');
}

function handleStrikeAdd(e) {
  e.preventDefault();

  const number = document.getElementById('strikeSoldierNumber').value.trim();
  const reason = document.getElementById('strikeReason').value.trim();

  const soldier = soldiers.find(s => s.number === number);

  if (!soldier) {
    alert('العسكري غير موجود في النظام');
    return;
  }

  if (!soldier.strikes) {
    soldier.strikes = [];
  }

  soldier.strikes.push({
    reason: reason,
    date: new Date().toLocaleDateString('ar-SA')
  });

  saveSoldiers();

  alert(`تم إضافة سترايك لـ ${soldier.name}`);
  document.getElementById('strikeForm').reset();
  displaySoldiersList('soldiersListLeadership');
  displayStrikesList();
}

function checkIn() {
  if (!currentUser || currentUser.type !== 'soldier') return;

  attendance[currentUser.number] = 'online';
  saveAttendance();
  alert('تم تسجيل الدخول بنجاح');
  displaySoldiersList('soldiersListSoldier');
}

function checkOut() {
  if (!currentUser || currentUser.type !== 'soldier') return;

  attendance[currentUser.number] = 'offline';
  saveAttendance();
  alert('تم تسجيل الخروج بنجاح');
  displaySoldiersList('soldiersListSoldier');
}

function displaySoldiersList(containerId) {
  const container = document.getElementById(containerId);

  if (soldiers.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">لا توجد عساكر مضافين حالياً</p>';
    return;
  }

  let html = '<div class="soldier-row header">';
  html += '<div>اسم الشخص</div>';
  html += '<div>الوحدة</div>';
  html += '<div>الرتبة</div>';
  html += '<div>رقمه داخل النظام</div>';
  html += '<div>النقاط</div>';
  html += '<div>السترايكات</div>';
  html += '<div>الحالة</div>';
  html += '</div>';

  soldiers.forEach(soldier => {
    const status = attendance[soldier.number] || 'neutral';
    const statusText = status === 'online' ? 'مسجل دخول' : status === 'offline' ? 'مسجل خروج' : 'لم يسجل';
    const points = soldier.points || 0;
    const strikes = soldier.strikes ? soldier.strikes.length : 0;

    html += '<div class="soldier-row">';
    html += `<div>${soldier.name}</div>`;
    html += `<div>${soldier.unit}</div>`;
    html += `<div>${soldier.rank}</div>`;
    html += `<div>${soldier.number}</div>`;
    html += `<div><span class="points-badge">${points}</span></div>`;
    html += `<div><span class="strikes-badge">${strikes}</span></div>`;
    html += `<div><span class="status-indicator ${status}"></span> ${statusText}</div>`;
    html += '</div>';
  });

  container.innerHTML = html;
}

function displayStrikesList() {
  const container = document.getElementById('strikesList');

  const soldiersWithStrikes = soldiers.filter(s => s.strikes && s.strikes.length > 0);

  if (soldiersWithStrikes.length === 0) {
    container.innerHTML = '<p style="text-align: center; padding: 20px; color: #666;">لا توجد سترايكات مسجلة</p>';
    return;
  }

  let html = '';
  soldiersWithStrikes.forEach(soldier => {
    html += `<div class="strike-item">`;
    html += `<h4>${soldier.name} (${soldier.number})</h4>`;
    html += `<ul>`;
    soldier.strikes.forEach((strike, index) => {
      html += `<li><strong>سترايك ${index + 1}:</strong> ${strike.reason} - ${strike.date}</li>`;
    });
    html += `</ul>`;
    html += `</div>`;
  });

  container.innerHTML = html;
}

function showLeadershipDashboard() {
  showPage('leadershipPage');
  document.getElementById('leadershipWelcome').textContent = `مرحباً بك داخل النظام الأخ ${currentUser.name}`;
  displaySoldiersList('soldiersListLeadership');
  displayStrikesList();
}

function showSoldierDashboard() {
  showPage('soldierPage');
  document.getElementById('soldierWelcome').textContent = `مرحباً بك داخل النظام الأخ ${currentUser.name}`;
  displaySoldiersList('soldiersListSoldier');
}

function showPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  document.getElementById(pageId).classList.add('active');
}

function logout() {
  currentUser = null;
  document.getElementById('loginForm').reset();
  showPage('loginPage');
}

function showRules() {
  showPage('rulesPage');
}

function showStrikes() {
  showPage('strikesPage');
}

function backToDashboard() {
  if (currentUser && currentUser.type === 'leadership') {
    showLeadershipDashboard();
  } else if (currentUser && currentUser.type === 'soldier') {
    showSoldierDashboard();
  }
}