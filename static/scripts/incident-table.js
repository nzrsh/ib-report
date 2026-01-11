// incident-table.js — исправленная версия
const API_URL = '/api/incidents';
const LIMIT = 10;
const type = window.location.pathname.split('/').filter(Boolean)[1];
let currentSkip = 0;
let total = 0;

const tableBody = document.getElementById('incidentsBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

function truncateText(text, maxLength = 50) {
  if (!text) return '';
  const str = String(text);
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

// ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ — добавляет токен в запрос
async function authFetch(url) {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Вы не авторизованы!');
    window.location.href = '/login';
    return null;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
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

async function loadIncidents(skip = 0) {
  try {
    const byType = type === 'none' ? '' : `&type=${type}`;

    const response = await authFetch(
      `${API_URL}?skip=${skip}&take=${LIMIT}${byType}`,
    );
    if (!response) return;

    const result = await response.json();

    // Проблемная проверка убрана
    const incidentsData = result.data || result; // если backend возвращает {data: [...]} или сразу массив
    const incidents = incidentsData.data || incidentsData;
    const totalCount = incidentsData.total || incidents.length;
    currentSkip = incidentsData.skip || 0;
    total = totalCount;

    tableBody.innerHTML = '';

    if (incidents.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="10">Нет данных</td></tr>';
      updatePagination();
      return;
    }

    incidents.forEach((incident) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${incident.id || ''}</td>
        <td>${truncateText(incident.incidentDate)}</td>
        <td>${truncateText(incident.incidentNumber)}</td>
        <td>${truncateText(incident.operationSurname)}</td>
        <td>${truncateText(incident.operationAddress)}</td>
        <td>${truncateText(incident.griibSurname)}</td>
        <td>${truncateText(incident.griibAddress)}</td>
        <td>${incident.isIncidentResolved ? 'Да' : 'Нет'}</td>
        <td><a href="/api/incidents/${incident.id}/doc" target="_blank">PDF</a></td>
        <td><a href="/incident-table/${incident.incidentType}"> ${incident.incidentType}</a></td>
        <td><a href="/incident-details/${incident.id}">Подробнее</a></td>
      `;
      tableBody.appendChild(row);
    });

    updatePagination();
  } catch (err) {
    console.error('Ошибка:', err);
    tableBody.innerHTML = '<tr><td colspan="10">Ошибка сети</td></tr>';
  }
}

function updatePagination() {
  const currentPage = Math.floor(currentSkip / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  pageInfo.textContent = `Страница ${currentPage} из ${totalPages} (всего: ${total})`;
  prevBtn.disabled = currentSkip === 0;
  nextBtn.disabled = currentSkip + LIMIT >= total;
}

prevBtn.addEventListener('click', () => {
  if (currentSkip >= LIMIT) loadIncidents(currentSkip - LIMIT);
});

nextBtn.addEventListener('click', () => {
  if (currentSkip + LIMIT < total) loadIncidents(currentSkip + LIMIT);
});

// Загружаем при старте
loadIncidents(0);
