const API_URL = '/api/events'; // оставь как есть, если бэкенд на том же домене
const LIMIT = 10;
let currentSkip = 0;
let total = 0;

const tableBody = document.getElementById('eventsBody');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const pageInfo = document.getElementById('pageInfo');

// Универсальная функция для fetch с токеном
async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');

  // Если токена нет — сразу на логин
  if (!token) {
    window.location.href = '/login';
    return;
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...options.headers, // если вдруг захочешь передать свои заголовки
  };

  return fetch(url, { ...options, headers });
}

// Функция обрезки текста
function truncateText(text, maxLength = 50) {
  if (!text) return '';
  const str = String(text);
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

async function loadEvents(skip = 0) {
  try {
    const response = await apiFetch(`${API_URL}?skip=${skip}&take=${LIMIT}`);
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('login');
      window.location.href = '/login';
      return;
    }

    const result = await response.json();

    // Деструктурируем прямо из result
    const { data: events, total: totalCount, skip: returnedSkip } = result;

    total = totalCount;
    currentSkip = returnedSkip;

    tableBody.innerHTML = '';

    if (!events || events.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="19">Нет данных</td></tr>';
      updatePagination();
      return;
    }

    events.forEach((event) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${event.id || ''}</td>
                <td>${truncateText(event.date)}</td>
                <td>${truncateText(event.number)}</td>
                <td>${truncateText(event.surname)}</td>
                <td>${truncateText(event.address)}</td>
                <td>${event.isEventResolved ? 'Да' : 'Нет'}</td>
                <td><a href="/api/events/${event.id}/doc" target="_blank">PDF</a></td>
                <td><a href="/event-details/${event.id}"> Подробнее</a></td>
            `;
      tableBody.appendChild(row);
    });

    updatePagination();
  } catch (err) {
    console.error('Ошибка загрузки:', err);
    tableBody.innerHTML = '<tr><td colspan="19">Ошибка сети</td></tr>';
  }
}

function updatePagination() {
  const currentPage = Math.floor(currentSkip / LIMIT) + 1;
  const totalPages = Math.ceil(total / LIMIT) || 1;
  pageInfo.textContent = `Страница ${currentPage} из ${totalPages} (всего: ${total})`;
  prevBtn.disabled = currentSkip === 0;
  nextBtn.disabled = currentSkip + LIMIT >= total;
}

// Обработчики пагинации
prevBtn.addEventListener('click', () => {
  if (currentSkip >= LIMIT) {
    loadEvents(currentSkip - LIMIT);
  }
});

nextBtn.addEventListener('click', () => {
  if (currentSkip + LIMIT < total) {
    loadEvents(currentSkip + LIMIT);
  }
});

// Стартовая загрузка + проверка токена
(function checkAuthAndLoad() {
  if (!localStorage.getItem('token')) {
    window.location.href = '/login.html';
    return;
  }
  loadEvents(0);
})();
