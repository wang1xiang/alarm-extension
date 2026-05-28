// Popup UI logic

let alarms = [];
let timers = [];
let editingAlarmId = null;
let selectedDays = [];

// DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const panels = document.querySelectorAll('.panel');
const addAlarmBtn = document.getElementById('add-alarm-btn');
const alarmList = document.getElementById('alarm-list');
const addAlarmForm = document.getElementById('add-alarm-form');
const cancelAlarmBtn = document.getElementById('cancel-alarm-btn');
const saveAlarmBtn = document.getElementById('save-alarm-btn');
const alarmTimeInput = document.getElementById('alarm-time');
const alarmLabelInput = document.getElementById('alarm-label');
const dayBtns = document.querySelectorAll('.day-btn');
const activeTimersList = document.getElementById('active-timers-list');
const presetBtns = document.querySelectorAll('.preset-btn');
const startCustomTimerBtn = document.getElementById('start-custom-timer-btn');
const timerMinutesInput = document.getElementById('timer-minutes');
const timerSecondsInput = document.getElementById('timer-seconds');
const testNotificationBtn = document.getElementById('test-notification-btn');

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabId = btn.dataset.tab;

    tabBtns.forEach(b => b.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(`${tabId}-panel`).classList.add('active');
  });
});

// Message passing helper
async function sendMessage(message) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, resolve);
  });
}

// Load initial state
async function loadState() {
  try {
    const state = await sendMessage({ type: 'GET_STATE' });
    alarms = state.alarms || [];
    timers = state.timers || [];
    renderAlarms();
    renderTimers();
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

// Render alarms
function renderAlarms() {
  if (alarms.length === 0) {
    alarmList.innerHTML = `
      <div class="empty-state">
        <p>暂无闹钟</p>
        <p class="text-secondary" style="font-size: 12px;">点击 + 添加闹钟</p>
      </div>
    `;
    return;
  }

  alarmList.innerHTML = alarms.map(alarm => `
    <div class="alarm-item" data-id="${alarm.id}">
      <div>
        <div class="alarm-time">${alarm.time}</div>
        <div class="alarm-label">${alarm.label || '闹钟'}</div>
        <div class="alarm-repeat" style="font-size: 12px;">${formatRepeat(alarm.repeat)}</div>
      </div>
      <div class="alarm-actions">
        <label class="toggle-switch">
          <input type="checkbox" ${alarm.enabled ? 'checked' : ''}
                 onchange="window.toggleAlarm('${alarm.id}', this.checked)">
          <span class="toggle-slider"></span>
        </label>
        <button class="delete-btn" onclick="window.deleteAlarm('${alarm.id}')">✕</button>
      </div>
    </div>
  `).join('');
}

function formatRepeat(days) {
  if (days.length === 0) return '仅一次';
  if (days.length === 7) return '每天';
  if (days.length === 5 && !days.includes(0) && !days.includes(6)) return '工作日';
  if (days.length === 2 && days.includes(0) && days.includes(6)) return '周末';

  const dayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return days.map(d => dayNames[d]).join(', ');
}

// Alarm actions
window.toggleAlarm = async function(id, enabled) {
  const alarm = alarms.find(a => a.id === id);
  if (alarm) {
    alarm.enabled = enabled;
    await sendMessage({ type: 'UPDATE_ALARM', alarm });
    alarms = alarms.map(a => a.id === id ? alarm : a);
  }
};

window.deleteAlarm = async function(id) {
  await sendMessage({ type: 'REMOVE_ALARM', id });
  alarms = alarms.filter(a => a.id !== id);
  renderAlarms();
};

// Add alarm form
addAlarmBtn.addEventListener('click', () => {
  editingAlarmId = null;
  alarmTimeInput.value = '';
  alarmLabelInput.value = '';
  selectedDays = [];
  dayBtns.forEach(btn => btn.classList.remove('selected'));
  addAlarmForm.classList.remove('hidden');
});

cancelAlarmBtn.addEventListener('click', () => {
  addAlarmForm.classList.add('hidden');
});

dayBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const day = parseInt(btn.dataset.day);
    if (selectedDays.includes(day)) {
      selectedDays = selectedDays.filter(d => d !== day);
      btn.classList.remove('selected');
    } else {
      selectedDays.push(day);
      btn.classList.add('selected');
    }
  });
});

saveAlarmBtn.addEventListener('click', async () => {
  const time = alarmTimeInput.value;
  const label = alarmLabelInput.value;

  if (!time) {
    alert('请选择时间');
    return;
  }

  const alarm = {
    id: editingAlarmId || `alarm_${Date.now()}`,
    time,
    label,
    enabled: true,
    repeat: selectedDays.length > 0 ? selectedDays : [new Date().getDay()],
    sound: 'default.mp3',
    createdAt: Date.now()
  };

  if (editingAlarmId) {
    await sendMessage({ type: 'UPDATE_ALARM', alarm });
    alarms = alarms.map(a => a.id === alarm.id ? alarm : a);
  } else {
    const result = await sendMessage({ type: 'ADD_ALARM', alarm });
    alarms = result.alarms;
  }

  renderAlarms();
  addAlarmForm.classList.add('hidden');
});

// Timer presets
presetBtns.forEach(btn => {
  btn.addEventListener('click', async () => {
    const minutes = parseInt(btn.dataset.minutes);
    await startTimer(minutes * 60 * 1000, `${minutes} min`);
  });
});

// Custom timer
startCustomTimerBtn.addEventListener('click', async () => {
  const minutes = parseInt(timerMinutesInput.value) || 0;
  const seconds = parseInt(timerSecondsInput.value) || 0;
  const totalMs = (minutes * 60 + seconds) * 1000;

  if (totalMs <= 0) {
    alert('请输入有效的时间');
    return;
  }

  await startTimer(totalMs, `${minutes}m ${seconds}s`);
  timerMinutesInput.value = '';
  timerSecondsInput.value = '';
});

async function startTimer(duration, label) {
  const result = await sendMessage({ type: 'START_TIMER', duration, label });
  timers = result.timers;
  renderTimers();
}

// Render timers
function renderTimers() {
  if (timers.length === 0) {
    activeTimersList.innerHTML = `
      <div class="empty-state">
        <p>暂无倒计时</p>
      </div>
    `;
    return;
  }

  activeTimersList.innerHTML = timers.map(timer => `
    <div class="timer-item" data-id="${timer.id}">
      <div>
        <div class="timer-display" id="display-${timer.id}">${formatDuration(timer.remaining)}</div>
        <div class="timer-label">${timer.label || '倒计时'}</div>
      </div>
      <div class="timer-controls">
        <button class="timer-control-btn" onclick="window.toggleTimer('${timer.id}', ${!timer.paused})">
          ${timer.paused ? '▶' : '⏸'}
        </button>
        <button class="timer-control-btn" onclick="window.deleteTimer('${timer.id}')">✕</button>
      </div>
    </div>
  `).join('');
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Timer actions
window.toggleTimer = async function(id, paused) {
  await sendMessage({ type: 'PAUSE_TIMER', id, paused });
  const result = await sendMessage({ type: 'GET_STATE' });
  timers = result.timers;
  renderTimers();
};

window.deleteTimer = async function(id) {
  await sendMessage({ type: 'DELETE_TIMER', id });
  timers = timers.filter(t => t.id !== id);
  renderTimers();
};

// Test notification
testNotificationBtn.addEventListener('click', async () => {
  await sendMessage({ type: 'TEST_NOTIFICATION' });
});

// Initialize
loadState();

// Update timer displays every second
setInterval(async () => {
  const state = await sendMessage({ type: 'GET_STATE' });
  timers = state.timers;
  renderTimers();
}, 1000);
