const SPREADSHEET_ID = '146lh3T0usBX_TpX_Z9H4sQClOzilCbdwRyka1Qhbi0k';
const SHEET_NAME = '售後';

const PEOPLE = {
  '賢': { type: 'B', firstRow: 5, secondRow: 14, allowed: ['A班', 'B班', '休假', '特休', '病假', '喪假', '事假', '公假', 'A特下半'] },
  '杰': { type: 'B', firstRow: 6, secondRow: 15, allowed: ['A班', 'B班', '休假', '特休', '病假', '喪假', '事假', '公假', 'A特下半'] },
  '宇': { type: 'B', firstRow: 7, secondRow: 16, allowed: ['A班', 'B班', '休假', '特休', '病假', '喪假', '事假', '公假', 'A特下半'] },
  '强': { type: 'B', firstRow: 8, secondRow: 17, allowed: ['A班', 'B班', '休假', '特休', '病假', '喪假', '事假', '公假', 'A特下半'] },
  '璍': { type: 'B', firstRow: 9, secondRow: 18, allowed: ['夜班', '休假', '特休', '病假', '喪假', '事假', '公假'] }
};

const PASSWORD_PROPERTIES = {
  '賢': 'SCHEDULE_PASSWORD_1',
  '杰': 'SCHEDULE_PASSWORD_2',
  '宇': 'SCHEDULE_PASSWORD_3',
  '强': 'SCHEDULE_PASSWORD_4',
  '璍': 'SCHEDULE_PASSWORD_5',
  '管理員': 'SCHEDULE_ADMIN_PASSWORD'
};

const DEFAULT_PASSWORDS = {
  '賢': '1111',
  '杰': '2222',
  '宇': '3333',
  '强': '4444',
  '璍': '5555'
};

const SCHEDULE_OPEN_PROPERTY = 'SCHEDULE_OPEN';
const SCHEDULE_OPEN_STATUS_CELL = 'AR2';
const PRESENCE_PREFIX = 'SCHEDULE_PRESENCE_';
const PRESENCE_ONLINE_MS = 75000;

const DISPLAY_TO_VALUE = {
  'A': 'A班',
  'B': 'B班',
  '休': '休假',
  '特': '特休',
  '夜': '夜班',
  '病': '病假',
  '喪': '喪假',
  '事': '事假',
  '公': '公假'
};

const VALUE_TO_DISPLAY = {
  'A班': 'A',
  'B班': 'B',
  '休假': '休',
  '特休': '特',
  '夜班': '夜',
  '病假': '病',
  '喪假': '喪',
  '事假': '事',
  '公假': '公',
  '特': '特',
  'A特下半': 'A特下半',
  'A': 'A',
  'B': 'B'
};

function doGet() {
  return HtmlService
    .createHtmlOutputFromFile('ScheduleApp')
    .setTitle('線上排班表')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function authorizeScheduleApp() {
  const sheet = getSheet_();
  const title = getScheduleTitle_();
  const properties = PropertiesService.getScriptProperties().getProperties();

  return {
    ok: true,
    spreadsheetId: SPREADSHEET_ID,
    sheetName: sheet.getName(),
    title: title,
    scheduleOpen: isScheduleOpen_(),
    passwordKeys: Object.keys(PASSWORD_PROPERTIES),
    propertyCount: Object.keys(properties).length
  };
}

function getBootstrap() {
  return {
    people: Object.keys(PEOPLE).map(name => ({
      name: name,
      type: PEOPLE[name].type,
      passwordKey: PASSWORD_PROPERTIES[name]
    }))
  };
}

function loginPerson(personName, password) {
  const name = String(personName || '').trim();
  if (name === '管理員') {
    const propertyKey = PASSWORD_PROPERTIES[name];
    const savedPassword = PropertiesService.getScriptProperties().getProperty(propertyKey);
    if (savedPassword && String(password || '') !== savedPassword) {
      throw new Error('密碼不正確');
    }
    return {
      name: name,
      type: 'ADMIN',
      passwordKey: propertyKey,
      scheduleOpen: isScheduleOpen_(),
      schedules: getAllSchedules()
    };
  }

  const person = getPerson_(personName);
  const propertyKey = PASSWORD_PROPERTIES[name];
  const savedPassword = PropertiesService.getScriptProperties().getProperty(propertyKey);
  const defaultPassword = DEFAULT_PASSWORDS[name];
  const expectedPassword = savedPassword || defaultPassword;

  if (expectedPassword && String(password || '') !== expectedPassword) {
    throw new Error('密碼不正確');
  }

  updatePresence(name);

  return {
    name: name,
    type: person.type,
    passwordKey: propertyKey,
    requirePasswordChange: String(password || '') === defaultPassword,
    scheduleOpen: isScheduleOpen_(),
    schedules: getAllSchedules()
  };
}

function changePasswordAndLogin(personName, currentPassword, newPassword) {
  const name = String(personName || '').trim();
  const person = getPerson_(name);
  const propertyKey = PASSWORD_PROPERTIES[name];
  const savedPassword = PropertiesService.getScriptProperties().getProperty(propertyKey);
  const defaultPassword = DEFAULT_PASSWORDS[name];
  const expectedPassword = savedPassword || defaultPassword;
  const nextPassword = String(newPassword || '').trim();

  if (String(currentPassword || '') !== expectedPassword) {
    throw new Error('原密碼不正確，請重新登入');
  }

  if (!/^\d{4,8}$/.test(nextPassword)) {
    throw new Error('新密碼需為 4 到 8 位數字');
  }

  PropertiesService.getScriptProperties().setProperty(propertyKey, nextPassword);
  updatePresence(name);

  return {
    name: name,
    type: person.type,
    passwordKey: propertyKey,
    requirePasswordChange: nextPassword === defaultPassword,
    scheduleOpen: isScheduleOpen_(),
    schedules: getAllSchedules()
  };
}

function getScheduleOpen() {
  return isScheduleOpen_();
}

function setScheduleOpen(openValue) {
  const open = openValue === true || String(openValue).toLowerCase() === 'true';
  PropertiesService.getScriptProperties().setProperty(SCHEDULE_OPEN_PROPERTY, open ? 'true' : 'false');
  updateScheduleOpenStatusCell_(open);
  return {
    scheduleOpen: open,
    schedules: getAllSchedules()
  };
}

function toggleScheduleOpenFromSheet() {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet_();
    const currentOpen = isScheduleOpen_();
    const nextOpen = !currentOpen;

    sheet.getRange(SCHEDULE_OPEN_STATUS_CELL).setValue('排班切換中...');
    SpreadsheetApp.flush();
    Utilities.sleep(700);

    PropertiesService.getScriptProperties().setProperty(SCHEDULE_OPEN_PROPERTY, nextOpen ? 'true' : 'false');
    updateScheduleOpenStatusCell_(nextOpen);
    SpreadsheetApp.openById(SPREADSHEET_ID).toast(nextOpen ? '排班已開放' : '排班已關閉', '排班開關', 3);

    return nextOpen;
  } finally {
    lock.releaseLock();
  }
}

function getSchedule(personName) {
  const person = getPerson_(personName);
  const sheet = getSheet_();
  const firstHalf = sheet.getRange(person.firstRow, 22, 1, 16).getDisplayValues()[0];
  const secondHalf = sheet.getRange(person.secondRow, 22, 1, 15).getDisplayValues()[0];
  const days = {};

  firstHalf.forEach((value, index) => {
    const shift = normalizeShift_(value, person);
    if (shift) days[String(index + 1)] = shift;
  });

  secondHalf.forEach((value, index) => {
    const shift = normalizeShift_(value, person);
    if (shift) days[String(index + 17)] = shift;
  });

  return {
    person: personName,
    type: person.type,
    year: 2026,
    month: getScheduleMonth_(),
    days: days,
    updatedAt: new Date().toISOString()
  };
}

function getAllSchedules() {
  const result = {};
  Object.keys(PEOPLE).forEach(name => {
    result[name] = getSchedule(name);
  });
  return {
    year: 2026,
    month: getScheduleMonth_(),
    title: getScheduleTitle_(),
    scheduleOpen: isScheduleOpen_(),
    presence: getPresence(),
    people: result,
    updatedAt: new Date().toISOString()
  };
}

function updatePresence(personName) {
  const name = String(personName || '').trim();
  if (!PEOPLE[name]) {
    return getPresence();
  }
  PropertiesService.getScriptProperties().setProperty(PRESENCE_PREFIX + name, String(Date.now()));
  return getPresence();
}

function clearPresence(personName) {
  const name = String(personName || '').trim();
  if (PEOPLE[name]) {
    PropertiesService.getScriptProperties().deleteProperty(PRESENCE_PREFIX + name);
  }
  return getPresence();
}

function getPresence() {
  const properties = PropertiesService.getScriptProperties().getProperties();
  const now = Date.now();
  const result = {};
  Object.keys(PEOPLE).forEach(name => {
    const raw = properties[PRESENCE_PREFIX + name];
    const lastSeen = raw ? Number(raw) : 0;
    const online = !!lastSeen && now - lastSeen <= PRESENCE_ONLINE_MS;
    result[name] = {
      online: online,
      lastSeen: lastSeen || null
    };
  });
  return result;
}

function isScheduleOpen_() {
  const value = PropertiesService.getScriptProperties().getProperty(SCHEDULE_OPEN_PROPERTY);
  return value !== 'false';
}

function updateScheduleOpenStatusCell_(open) {
  getSheet_().getRange(SCHEDULE_OPEN_STATUS_CELL).setValue(open ? '排班開放中' : '排班已關閉');
}

function saveSchedule(personName, payload) {
  const person = getPerson_(personName);
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet_();
    const days = normalizeDays_(payload, person);
    validateScheduleChange_(String(personName || '').trim(), days);
    const firstHalf = [];
    const secondHalf = [];

    for (let day = 1; day <= 16; day += 1) {
      firstHalf.push(toSheetValue_(days[String(day)] || ''));
    }

    for (let day = 17; day <= 31; day += 1) {
      secondHalf.push(toSheetValue_(days[String(day)] || ''));
    }

    sheet.getRange(person.firstRow, 22, 1, 16).setValues([firstHalf]);
    sheet.getRange(person.secondRow, 22, 1, 15).setValues([secondHalf]);

    return getSchedule(personName);
  } finally {
    lock.releaseLock();
  }
}

function saveDay(personName, dayValue, shiftValue) {
  const person = getPerson_(personName);
  const day = Number(dayValue);
  const scheduleMonth = getScheduleMonth_();
  if (!scheduleMonth) {
    throw new Error('無法辨識班表月份，請檢查售後 A1:R1 標題');
  }
  const maxDay = new Date(2026, scheduleMonth, 0).getDate();
  if (!Number.isInteger(day) || day < 1 || day > maxDay) {
    throw new Error('日期不正確：' + dayValue);
  }

  const shift = normalizeShift_(shiftValue, person);
  if (String(shiftValue || '').trim() && !shift) {
    throw new Error('班別不正確：' + shiftValue);
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    const sheet = getSheet_();
    const candidateDays = getSchedule(personName).days;
    if (shift) {
      candidateDays[String(day)] = shift;
    } else {
      delete candidateDays[String(day)];
    }
    validateScheduleChange_(String(personName || '').trim(), candidateDays, day);

    const row = day <= 16 ? person.firstRow : person.secondRow;
    const column = day <= 16 ? 21 + day : 5 + day;
    assertScheduleCell_(sheet, person, day, row, column);

    try {
      sheet.getRange(row, column).setValue(toSheetValue_(shift));
    } catch (error) {
      throw new Error('無法寫入指定格，可能是格子被保護、權限不足或範圍不存在：' + error.message);
    }

    return {
      person: String(personName || '').trim(),
      day: day,
      shift: shift,
      schedules: getAllSchedules(),
      updatedAt: new Date().toISOString()
    };
  } finally {
    lock.releaseLock();
  }
}

function assertScheduleCell_(sheet, person, day, row, column) {
  const inFirstHalf = day >= 1 && day <= 16 && row === person.firstRow && column >= 22 && column <= 37;
  const inSecondHalf = day >= 17 && day <= 31 && row === person.secondRow && column >= 22 && column <= 36;
  if (!inFirstHalf && !inSecondHalf) {
    throw new Error('寫入位置超出排班範圍');
  }

  if (row > sheet.getMaxRows() || column > sheet.getMaxColumns()) {
    throw new Error('寫入位置不存在，請確認試算表大小');
  }
}

function getSheet_() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('找不到工作表：' + SHEET_NAME);
  }
  return sheet;
}

function getScheduleTitle_() {
  const sheet = getSheet_();
  const values = sheet.getRange('A1:R1').getDisplayValues()[0];
  const title = values.find(value => String(value || '').trim());
  return String(title || '').trim();
}

function getScheduleMonth_() {
  const title = getScheduleTitle_();
  const numeric = title.match(/(?:^|[^\d])(\d{1,2})\s*(?:月|月份)/);
  if (numeric) {
    const month = Number(numeric[1]);
    if (month >= 1 && month <= 12) return month;
  }

  const chineseMonths = {
    '一': 1,
    '二': 2,
    '三': 3,
    '四': 4,
    '五': 5,
    '六': 6,
    '七': 7,
    '八': 8,
    '九': 9,
    '十': 10,
    '十一': 11,
    '十二': 12
  };
  const chinese = title.match(/(十一|十二|十|一|二|三|四|五|六|七|八|九)\s*(?:月|月份)/);
  return chinese ? chineseMonths[chinese[1]] : null;
}

function getScheduleRules_() {
  const title = getScheduleTitle_();
  const totalMatch = title.match(/共\s*(\d+)\s*天休假/);
  const weekendMatch = title.match(/假日\s*(\d+)\s*天/);
  const weekdayMatch = title.match(/平日\s*(\d+)\s*天/);
  return {
    totalRest: totalMatch ? Number(totalMatch[1]) : null,
    weekendRest: weekendMatch ? Number(weekendMatch[1]) : null,
    weekdayRest: weekdayMatch ? Number(weekdayMatch[1]) : null,
    huaRest: 10
  };
}

function validateScheduleChange_(personName, days, targetDay) {
  if (targetDay && isSpecialLeaveShift_(days[String(targetDay)] || '')) {
    return;
  }

  validateDailyTeamRule_(personName, days, targetDay);

  if (hasSevenContinuousWork_(days)) {
    throw new Error('不可連續上班 7 天');
  }

  const rules = getScheduleRules_();
  const rest = countRest_(days);

  if (personName === '璍') {
    if (rest.total > rules.huaRest) {
      throw new Error('璍休假不可超過 ' + rules.huaRest + ' 天');
    }
    return;
  }

  if (['賢', '杰', '宇', '强'].indexOf(personName) >= 0) {
    if (rules.totalRest !== null && rest.total > rules.totalRest) {
      throw new Error('休假不可超過 ' + rules.totalRest + ' 天');
    }
    if (rules.weekendRest !== null && rest.weekend > rules.weekendRest) {
      throw new Error('假日休不可超過 ' + rules.weekendRest + ' 天');
    }
  }
}

function validateDailyTeamRule_(personName, days, targetDay) {
  const team = ['賢', '杰', '宇', '强'];
  if (team.indexOf(personName) < 0) return;

  const teamSchedules = {};
  team.forEach(name => {
    teamSchedules[name] = name === personName ? days : getSchedule(name).days;
  });

  const startDay = targetDay ? Number(targetDay) : 1;
  const endDay = targetDay ? Number(targetDay) : 31;

  for (let day = startDay; day <= endDay; day += 1) {
    const counts = { a: 0, b: 0, off: 0, blank: 0 };

    team.forEach(name => {
      const shift = teamSchedules[name][String(day)] || '';
      if (!shift) counts.blank += 1;
      if (isATypeShift_(shift)) counts.a += 1;
      if (isBTypeShift_(shift)) counts.b += 1;
      if (isOffTypeShift_(shift)) counts.off += 1;
    });

    if (counts.a > 3 || counts.b > 3 || counts.off > 2 || (counts.a === 0 && counts.blank === 0) || (counts.b === 0 && counts.blank === 0)) {
      throw new Error('每日 A/B/休特 人數規則不符');
    }
  }
}

function isATypeShift_(shift) {
  return ['A班', 'A', 'A特下半'].indexOf(shift) >= 0;
}

function isBTypeShift_(shift) {
  return ['B班', 'B'].indexOf(shift) >= 0;
}

function isOffTypeShift_(shift) {
  return ['休假', '特休', '病假', '喪假', '事假', '公假'].indexOf(shift) >= 0;
}

function isSpecialLeaveShift_(shift) {
  return ['病假', '喪假', '事假', '公假'].indexOf(shift) >= 0;
}

function countRest_(days) {
  const rest = { total: 0, weekend: 0, weekday: 0 };
  for (let day = 1; day <= 31; day += 1) {
    if (days[String(day)] === '休假') {
      rest.total += 1;
      if (isWeekend_(day)) {
        rest.weekend += 1;
      } else {
        rest.weekday += 1;
      }
    }
  }
  return rest;
}

function isWeekend_(day) {
  const weekday = new Date(2026, 6, Number(day)).getDay();
  return weekday === 0 || weekday === 6;
}

function hasSevenContinuousWork_(days) {
  let streak = 0;
  for (let day = 1; day <= 31; day += 1) {
    if (isWorkShift_(days[String(day)] || '')) {
      streak += 1;
      if (streak >= 7) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

function isWorkShift_(shift) {
  return ['A班', 'B班', '夜班', 'A特下半', 'A', 'B'].indexOf(shift) >= 0;
}

function getPerson_(personName) {
  const name = String(personName || '').trim();
  const person = PEOPLE[name];
  if (!person) {
    throw new Error('找不到人員：' + name);
  }
  return person;
}

function normalizeDays_(payload, person) {
  const source = payload && payload.days ? payload.days : payload;
  const days = {};

  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return days;
  }

  Object.keys(source).forEach(key => {
    const day = String(parseInt(key, 10));
    const shift = normalizeShift_(source[key], person);
    if (Number(day) >= 1 && Number(day) <= 31 && shift) {
      days[day] = shift;
    }
  });

  return days;
}

function normalizeShift_(rawValue, person) {
  const value = String(rawValue || '').trim();
  const aValueMap = {
    'A班': 'A',
    'B班': 'B',
    '休': '休假',
    '特': '特休',
    '夜': '夜班',
    '病': '病假',
    '喪': '喪假',
    '事': '事假',
    '公': '公假'
  };
  const fullValue = person.type === 'B' ? (DISPLAY_TO_VALUE[value] || value) : (aValueMap[value] || value);

  if (!fullValue) return '';
  return person.allowed.indexOf(fullValue) >= 0 ? fullValue : '';
}

function toSheetValue_(shift) {
  return VALUE_TO_DISPLAY[shift] || shift || '';
}
