// /static/scripts/incident-details.js
const API_URL = '/api/incidents';

// ──────────────────────────────────────────────────────────────
// Получение ID инцидента
// ──────────────────────────────────────────────────────────────
let id = null;
const pathParts = window.location.pathname.split('/').filter(Boolean);
if (pathParts.length >= 2 && !isNaN(pathParts[pathParts.length - 1])) {
  id = pathParts[pathParts.length - 1];
} else {
  const params = new URLSearchParams(window.location.search);
  const paramId = params.get('id');
  if (paramId && !isNaN(paramId)) id = paramId;
}

if (!id) {
  document.body.innerHTML = `
    <h2 style="color:#dc3545; text-align:center; margin-top:80px;">
      Ошибка: не указан или некорректен ID инцидента
    </h2>`;
  console.error('Incident ID not found or invalid');
  throw new Error('No valid incident ID');
}

console.log(
  '%c[Incident Details] Загружаем инцидент ID:',
  'color:#28a745; font-weight:bold',
  id
);

// ──────────────────────────────────────────────────────────────
// DOM-элементы
// ──────────────────────────────────────────────────────────────
const incidentNumberTitle = document.getElementById('incident-number');

const fields = {
  id: document.getElementById('id'),
  incidentNumber: document.getElementById('incidentNumber'),
  incidentDate: document.getElementById('incidentDate'),
  operationSurname: document.getElementById('operationSurname'),
  operationAddress: document.getElementById('operationAddress'),
  operationPhone: document.getElementById('operationPhone'),
  operationEmail: document.getElementById('operationEmail'),
  griibSurname: document.getElementById('griibSurname'),
  griibAddress: document.getElementById('griibAddress'),
  griibPhone: document.getElementById('griibPhone'),
  griibEmail: document.getElementById('griibEmail'),
  whatHappened: document.getElementById('whatHappened'),
  howHappened: document.getElementById('howHappened'),
  whyHappened: document.getElementById('whyHappened'),
  affectedComponents: document.getElementById('affectedComponents'),
  businessImpact: document.getElementById('businessImpact'),
  identifiedVulnerabilities: document.getElementById('identifiedVulnerabilities'),
  startDateTime: document.getElementById('startDateTime'),
  detectDateTime: document.getElementById('detectDateTime'),
  reportDateTime: document.getElementById('reportDateTime'),
  // Новые поля классификации
  typeOption1: document.getElementById('typeOption1'),
  typeOption2: document.getElementById('typeOption2'),
  incidentType: document.getElementById('incidentType'),
  information: document.getElementById('information'),
  hardware: document.getElementById('hardware'),
  software: document.getElementById('software'),
  communicationMeans: document.getElementById('communicationMeans'),
  documentation: document.getElementById('documentation'),
  negativeImpact: document.getElementById('negativeImpact'),
  // Блок негативных издержек
  negativeNumber: document.getElementById('negativeNumber'),
  negativePointer: document.getElementById('negativePointer'),
  negativeIssues: document.getElementById('negativeIssues'),
  // Разрешение
  isIncidentResolved: document.getElementById('isIncidentResolved'),
  investigationStartDate: document.getElementById('investigationStartDate'),
  investigators: document.getElementById('investigators'),
  incidentEndDate: document.getElementById('incidentEndDate'),
  impactEndDate: document.getElementById('impactEndDate'),
  investigationEndDate: document.getElementById('investigationEndDate'),
  investigationReportLocation: document.getElementById('investigationReportLocation'),
  // Нарушитель
  violatorType: document.getElementById('violatorType'),
  violatorDescription: document.getElementById('violatorDescription'),
  violatorMotivation: document.getElementById('violatorMotivation'),
  // Действия
  resolutionActions: document.getElementById('resolutionActions'),
  plannedResolutionActions: document.getElementById('plannedResolutionActions'),
  otherActions: document.getElementById('otherActions'),
};

// ──────────────────────────────────────────────────────────────
// ENUM-ы (полный актуальный список)
// ──────────────────────────────────────────────────────────────
const ENUMS = {
  typeOption1: ['Действительный', 'Попытка', 'Предполагаемый'],
  typeOption2: ['Намеренная', 'Случайная', 'Ошибка', 'Неизвестно'],
  incidentType: [
    'хищение', 'хакерство', 'мошенничество', 'неправильное_использование_ресурсов',
    'саботаж', 'иное_намеренное', 'отказ_аппаратуры', 'отказ_ПО',
    'другие_природные_события', 'отказ_системы_связи', 'потеря_значимых_сервисов',
    'пожар', 'недостаточное_кадровое_обеспечение', 'другие_случайные_случаи',
    'операционная_ошибка', 'ошибка_пользователя', 'ошибка_в_эксплуатации_аппаратных_средств',
    'ошибка_проектирования', 'ошибка_в_эксплуатации', 'другие_случаи_ошибок'
  ],
  negativeImpact: [
    'нарушение_конфиденциальности', 'нарушение_целостности', 'нарушение_доступности',
    'нарушение_неотказуемости', 'уничтожение', 'значимость_указатели'
  ],
  negativePointer: ['FD', 'CE', 'PI', 'LR', 'MO', 'LG'],
  violatorType: ['PE', 'OI', 'GR', 'AC', 'NP'],
  violatorMotivation: ['CG', 'PH', 'PT', 'RE', 'OM'],
};

// ──────────────────────────────────────────────────────────────
// Утилита форматирования дат по-русски
// ──────────────────────────────────────────────────────────────
function formatDateRu(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/,/, '');
  } catch {
    return dateStr || '—';
  }
}

// ──────────────────────────────────────────────────────────────
// Универсальный fetch с авторизацией
// ──────────────────────────────────────────────────────────────
async function authFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Вы не авторизованы! Перенаправляю на вход...');
    window.location.href = '/login';
    return null;
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    alert('Сессия истекла. Войдите заново.');
    localStorage.removeItem('token');
    window.location.href = '/login';
    return null;
  }

  return response;
}

// ──────────────────────────────────────────────────────────────
// Админ-контролы
// ──────────────────────────────────────────────────────────────
let editBtn, saveBtn, cancelBtn, deleteBtn;

function createAdminControls() {
  if (localStorage.getItem('role') !== 'admin') return;

  const controls = document.createElement('div');
  controls.className = 'admin-controls';
  controls.style.cssText = `
    margin:20px 0; 
    padding:15px; 
    background:#f8f9fa; 
    border-radius:8px; 
    display:flex; 
    gap:12px; 
    flex-wrap:wrap; 
    font-size:15px;
  `;

  editBtn = createBtn('Редактировать', enterEditMode, '#007bff');
  deleteBtn = createBtn('Удалить инцидент', confirmDelete, '#dc3545');

  controls.append(editBtn, deleteBtn);
  document.querySelector('h1').after(controls);
}

function createBtn(text, onClick, bgColor) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.type = 'button';
  btn.onclick = onClick;
  btn.style.cssText = `
    padding:10px 18px;
    border:none;
    border-radius:6px;
    cursor:pointer;
    color:white;
    background:${bgColor};
    font-weight:500;
    transition:opacity .2s;
  `;
  btn.onmouseover = () => (btn.style.opacity = '0.9');
  btn.onmouseout = () => (btn.style.opacity = '1');
  return btn;
}

// ──────────────────────────────────────────────────────────────
// Режим редактирования
// ──────────────────────────────────────────────────────────────
let currentIncident = null;
let isEditMode = false;

function enterEditMode() {
  isEditMode = true;
  Object.keys(fields).forEach(k => {
    if (fields[k]) fields[k].dataset.original = fields[k].innerHTML;
  });

  makeFieldsEditable();

  const controls = document.querySelector('.admin-controls');
  controls.innerHTML = '';
  saveBtn = createBtn('Сохранить', saveChanges, '#28a745');
  cancelBtn = createBtn('Отмена', exitEditMode, '#6c757d');
  controls.append(saveBtn, cancelBtn);
}

function exitEditMode() {
  isEditMode = false;
  Object.keys(fields).forEach(k => {
    const el = fields[k];
    if (!el) return;
    el.innerHTML = el.dataset.original || '—';
    el.contentEditable = false;
    el.style.cssText = '';
  });

  const controls = document.querySelector('.admin-controls');
  if (controls) {
    controls.innerHTML = '';
    controls.append(editBtn, deleteBtn);
  }
}

function makeFieldsEditable() {
  Object.keys(fields).forEach(key => {
    const el = fields[key];
    if (!el || key === 'id') return;

    const isEnumField = [
      'typeOption1', 'typeOption2', 'incidentType',
      'negativeImpact', 'negativePointer',
      'violatorType', 'violatorMotivation'
    ].includes(key);

    if (isEnumField) {
      const current = currentIncident?.[key] || '';
      const options = ENUMS[key]
        .map(val => `<option value="${val}" ${val === current ? 'selected' : ''}>${val}</option>`)
        .join('');
      el.innerHTML = `<select style="width:100%; padding:6px; border:1px solid #007bff; border-radius:4px;">${options}</select>`;
      return;
    }

    if (key === 'isIncidentResolved') {
      const select = document.createElement('select');
      select.innerHTML = `<option value="false">Нет</option><option value="true">Да</option>`;
      select.value = currentIncident?.isIncidentResolved ? 'true' : 'false';
      select.style.cssText = 'width:100%; padding:6px; border:1px solid #007bff; border-radius:4px;';
      el.textContent = '';
      el.appendChild(select);
      return;
    }

    // Обычные текстовые поля
    el.contentEditable = true;
    el.style.cssText = 'background:#fff; padding:4px 6px; border:1px solid #007bff; border-radius:4px; min-height:1.2em;';
  });
}

// ──────────────────────────────────────────────────────────────
// Сбор изменённых данных
// ──────────────────────────────────────────────────────────────
function collectFormData() {
  const data = {};

  Object.keys(fields).forEach(jsKey => {
    const el = fields[jsKey];
    if (!el) return;

    let newValue;

    // Булевы select
    if (jsKey === 'isIncidentResolved') {
      const select = el.querySelector('select');
      newValue = select ? select.value === 'true' : currentIncident[jsKey];
    }
    // Enum select
    else if ([
      'typeOption1', 'typeOption2', 'incidentType',
      'negativeImpact', 'negativePointer',
      'violatorType', 'violatorMotivation'
    ].includes(jsKey)) {
      const select = el.querySelector('select');
      newValue = select ? select.value : currentIncident[jsKey];
    }
    // Обычные поля
    else if (el.contentEditable === true || el.isContentEditable) {
      const trimmed = el.textContent.trim();
      const oldValue = currentIncident[jsKey] != null ? String(currentIncident[jsKey]).trim() : '';
      if (trimmed !== oldValue) {
        newValue = trimmed === '' ? null : trimmed;
      }
    }

    if (newValue !== undefined && newValue !== currentIncident[jsKey]) {
      data[jsKey] = newValue;
    }
  });

  return data;
}

// ──────────────────────────────────────────────────────────────
// Сохранение / Удаление
// ──────────────────────────────────────────────────────────────
async function saveChanges() {
  const payload = collectFormData();

  if (Object.keys(payload).length === 0) {
    alert('Ничего не изменилось');
    exitEditMode();
    return;
  }

  try {
    const res = await authFetch(`${API_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    if (!res) return;

    if (res.ok) {
      alert('Инцидент успешно обновлён!');
      // Можно перезагрузить данные:
      // const fresh = await (await authFetch(`${API_URL}/${id}`)).json();
      // renderIncident(fresh);
      exitEditMode();
      location.reload(); // самый простой способ обновить вид
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Ошибка сохранения: ' + (err.error || err.message || 'Неизвестная ошибка'));
    }
  } catch (e) {
    console.error(e);
    alert('Ошибка сети при сохранении');
  }
}

async function confirmDelete() {
  if (!confirm('Удалить инцидент навсегда? Это действие нельзя отменить.')) return;

  try {
    const res = await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res || !res.ok) throw new Error('Ошибка удаления');
    alert('Инцидент удалён');
    window.location.href = '/incident-table/none';
  } catch (e) {
    console.error(e);
    alert('Ошибка при удалении');
  }
}

// ──────────────────────────────────────────────────────────────
// Отрисовка данных
// ──────────────────────────────────────────────────────────────
function renderIncident(incident) {
  if (!incident) {
    document.body.innerHTML = `<h2 style="color:red;text-align:center;">Инцидент не найден</h2>`;
    return;
  }

  currentIncident = incident;

  incidentNumberTitle.textContent = incident.incidentNumber || '—';

  const dateFields = [
    'incidentDate', 'startDateTime', 'detectDateTime', 'reportDateTime',
    'investigationStartDate', 'incidentEndDate', 'impactEndDate', 'investigationEndDate'
  ];

  Object.entries(fields).forEach(([key, el]) => {
    if (!el) return;

    let value = incident[key];

    if (dateFields.includes(key)) {
      value = formatDateRu(value);
    } else if (key === 'isIncidentResolved') {
      value = value ? 'Да' : 'Нет';
    } else if (value == null || value === '') {
      value = '—';
    }

    el.textContent = value;
    el.contentEditable = false;
    el.style.cssText = '';
  });

  document.querySelector('.admin-controls')?.remove();
  createAdminControls();
}

// ──────────────────────────────────────────────────────────────
// Загрузка данных
// ──────────────────────────────────────────────────────────────
async function loadIncident() {
  try {
    const res = await authFetch(`${API_URL}/${id}`);
    if (!res || !res.ok) throw new Error('Не удалось загрузить инцидент');

    const data = await res.json();
    renderIncident(data);
  } catch (e) {
    console.error(e);
    document.body.innerHTML = `<h2 style="color:red;text-align:center;">${e.message}</h2>`;
  }
}

// ──────────────────────────────────────────────────────────────
// Старт
// ──────────────────────────────────────────────────────────────
loadIncident();