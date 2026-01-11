const API_URL = '/api/events';
const path = window.location.pathname;
const id = path.split('/').pop();

// DOM-элементы (все поля из схемы Event)
const eventNumberTitle = document.getElementById('event-number');
const fields = {
  id: document.getElementById('id'),
  number: document.getElementById('number'),
  date: document.getElementById('date'),
  organization: document.getElementById('organization'),
  surname: document.getElementById('surname'),
  address: document.getElementById('address'),
  phoneNumber: document.getElementById('phoneNumber'),
  mail: document.getElementById('mail'),
  start: document.getElementById('start'),
  detect: document.getElementById('detect'),
  end: document.getElementById('end'),
  eventDuration: document.getElementById('eventDuration'),
  isEventResolved: document.getElementById('isEventResolved'),
  happened: document.getElementById('happened'),
  happenedCause: document.getElementById('happenedCause'),
  rootCause: document.getElementById('rootCause'),
  affectedComponents: document.getElementById('affectedComponents'),
  identifiedVulnerabilities: document.getElementById('identifiedVulnerabilities'),
  businessImpact: document.getElementById('businessImpact'),
};

// Временные переменные
let editBtn, saveBtn, cancelBtn, deleteBtn;
let currentEvent = null;
let isEditMode = false;

// Универсальный authFetch
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

// Создание кнопок админ-панели
function createAdminControls() {
  if (localStorage.getItem('role') !== 'admin') return;

  const controls = document.createElement('div');
  controls.className = 'admin-controls';
  controls.style.cssText = `
    margin: 20px 0; 
    padding: 15px; 
    background: #f8f9fa; 
    border-radius: 8px;
    display: flex; 
    gap: 12px; 
    flex-wrap: wrap; 
    align-items: center; 
    font-size: 15px;
  `;

  editBtn = createButton('Редактировать', () => enterEditMode(), '#007bff');
  deleteBtn = createButton('Удалить событие', () => confirmDelete(), '#dc3545');

  controls.append(editBtn, deleteBtn);
  document.querySelector('h1').after(controls);
}

function createButton(text, onClick, bgColor) {
  const btn = document.createElement('button');
  btn.textContent = text;
  btn.type = 'button';
  btn.onclick = onClick;
  btn.style.cssText = `
    padding: 10px 18px; 
    border: none; 
    border-radius: 6px; 
    cursor: pointer;
    color: white; 
    background: ${bgColor}; 
    font-weight: 500; 
    transition: opacity .2s;
  `;
  btn.onmouseover = () => (btn.style.opacity = '0.9');
  btn.onmouseout = () => (btn.style.opacity = '1');
  return btn;
}

// Вход в режим редактирования
function enterEditMode() {
  isEditMode = true;
  Object.keys(fields).forEach(key => {
    fields[key].dataset.original = fields[key].textContent;
  });

  makeFieldsEditable();

  const controls = document.querySelector('.admin-controls');
  controls.innerHTML = '';

  saveBtn = createButton('Сохранить', () => saveChanges(), '#28a745');
  cancelBtn = createButton('Отмена', () => exitEditMode(), '#6c757d');

  controls.append(saveBtn, cancelBtn);
}

// Выход из режима редактирования без сохранения
function exitEditMode() {
  isEditMode = false;
  Object.keys(fields).forEach(key => {
    const el = fields[key];
    el.textContent = el.dataset.original || el.textContent;
    el.contentEditable = false;
    el.style.cssText = '';
  });

  const controls = document.querySelector('.admin-controls');
  controls.innerHTML = '';
  controls.append(editBtn, deleteBtn);
}

// Делаем поля редактируемыми
function makeFieldsEditable() {
  const nonEditable = ['id']; // id нельзя редактировать

  Object.keys(fields).forEach(key => {
    const el = fields[key];
    if (nonEditable.includes(key)) return;

    if (key === 'isEventResolved') {
      const select = document.createElement('select');
      select.innerHTML = `<option value="false">Нет</option><option value="true">Да</option>`;
      select.value = currentEvent.isEventResolved ? 'true' : 'false';
      el.textContent = '';
      el.appendChild(select);
      return;
    }

    el.contentEditable = true;
    el.style.cssText = 'background:#fffde7; padding:4px 6px; border:1px solid #007bff; border-radius:4px;';
  });
}

// Сбор изменённых данных для отправки
function collectFormData() {
  const data = {};
  const dtoKeys = Object.keys(fields); // все ключи совпадают с полями в БД

  dtoKeys.forEach(key => {
    const el = fields[key];
    if (!el) return;

    let newValue;

    if (key === 'isEventResolved') {
      const select = el.querySelector('select');
      if (select) newValue = select.value === 'true';
    } else if (el.contentEditable === 'true') {
      const trimmed = el.textContent.trim();
      const old = currentEvent[key] != null ? String(currentEvent[key]).trim() : '';
      if (trimmed !== old) {
        newValue = trimmed === '' ? null : trimmed;
      }
    }

    if (newValue !== undefined) {
      data[key] = newValue;
    }
  });

  console.log('Отправляем на сервер:', data);
  return data;
}

// Сохранение изменений
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
      alert('Событие успешно обновлено!');
      const fresh = await (await authFetch(`${API_URL}/${id}`)).json();
      currentEvent = fresh;
      renderEvent(currentEvent);
      exitEditMode();
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Ошибка сохранения: ' + (err.message || 'Неизвестная ошибка'));
    }
  } catch (e) {
    console.error(e);
    alert('Ошибка сети');
  }
}

// Подтверждение удаления
async function confirmDelete() {
  if (!confirm('Удалить событие навсегда? Это действие нельзя отменить.')) return;

  try {
    const res = await authFetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (!res) return;

    if (res.ok) {
      alert('Событие удалено');
      window.location.href = '/event-table';
    } else {
      const err = await res.json().catch(() => ({}));
      alert('Ошибка удаления: ' + (err.message || 'Неизвестная ошибка'));
    }
  } catch (e) {
    console.error(e);
    alert('Ошибка при удалении');
  }
}

// Форматирование дат в русский стиль
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(',', ' г.,');
  } catch {
    return dateStr;
  }
}

// Рендер данных события
function renderEvent(event) {
  if (!event) {
    document.body.innerHTML = `<h2 style="color:red;text-align:center;">Событие не найдено</h2>`;
    return;
  }

  currentEvent = event;
  eventNumberTitle.textContent = event.number || '—';

  Object.entries(fields).forEach(([key, el]) => {
    let value = event[key];

    // Форматируем даты
    if (['date', 'start', 'detect', 'end'].includes(key)) {
      value = formatDate(value);
    }

    // Булево поле
    if (key === 'isEventResolved') {
      value = value ? 'Да' : 'Нет';
    }

    el.textContent = value ?? '—';
    el.contentEditable = false;
    el.style.cssText = '';
  });

  document.querySelector('.admin-controls')?.remove();
  createAdminControls();
}

// Загрузка события
async function getEvent(id) {
  if (!id || isNaN(id)) {
    document.body.innerHTML = `<h2 style="color:red;">Неверный ID</h2>`;
    return;
  }

  try {
    const res = await authFetch(`${API_URL}/${id}`);
    if (!res) return;

    if (!res.ok) throw new Error('Не удалось загрузить событие');

    const event = await res.json();
    renderEvent(event);
  } catch (e) {
    console.error(e);
    document.body.innerHTML = `<h2 style="color:red;text-align:center;">${e.message}</h2>`;
  }
}

// Старт
getEvent(id);