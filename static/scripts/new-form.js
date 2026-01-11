document.addEventListener('DOMContentLoaded', () => {
  const isIncidentSelect = document.getElementById('isIncident');
  const sendBtn = document.getElementById('sendBtn');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');

  const sections = [
    document.getElementById('eventForm'),
    document.getElementById('incidentForm'),
    document.getElementById('incidentFormType'),
    document.getElementById('incidentFormAddInfo'),
    document.getElementById('incidentFormResolution'),
  ];

  let currentSectionIndex = 0;
  let isIncident = false;

  // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===
  async function authFetch(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('Вы не авторизованы!');
      window.location.href = '/login.html';
      return null;
    }
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      localStorage.clear();
      alert('Сессия истекла. Войдите заново.');
      window.location.href = '/auth/login';
      return null;
    }
    return response;
  }

  // Проверка, все ли обязательные поля в секции заполнены
  function isSectionValid(sectionIndex) {
    const section = sections[sectionIndex];
    if (!section) return true;

    const inputs = section.querySelectorAll(
      'input[required], select[required], textarea[required]',
    );
    return Array.from(inputs).every((input) => {
      if (input.type === 'radio' || input.type === 'checkbox') {
        const name = input.getAttribute('name');
        return document.querySelector(`input[name="${name}"]:checked`) !== null;
      }
      return input.value.trim() !== '' && input.checkValidity();
    });
  }

  function updateButtons() {
    const isLast = currentSectionIndex === sections.length - 1;
    const isFirst = currentSectionIndex === 0;
    const sectionValid = isSectionValid(currentSectionIndex);

    const canGoNext = isIncident && currentSectionIndex < sections.length - 1;
    nextBtn.disabled = !sectionValid || !canGoNext;

    prevBtn.classList.toggle('hidden', isFirst);

    const showSendButton = (!isIncident && isFirst) || isLast;

    sendBtn.classList.toggle('hidden', !showSendButton);
    sendBtn.disabled = !sectionValid;
  }

  function updateSections() {
    sections.forEach((sec, i) => {
      sec.classList.toggle('hidden', i !== currentSectionIndex);
    });
    updateButtons();
  }

  function collectFormData(formId) {
    const form = document.getElementById(formId);
    if (!form) return {};
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (value === 'да' || value === 'true') data[key] = true;
      else if (value === 'нет' || value === 'false') data[key] = false;
      else data[key] = value.trim();
    });
    return data;
  }

  // === ИНИЦИАЛИЗАЦИЯ: добавляем required + правильные типы полей ===
  document
    .querySelectorAll('input[name="date"], input[name="incidentDate"]')
    .forEach((el) => {
      el.type = 'date';
      el.required = true;
    });

  document
    .querySelectorAll(
      'input[name="start"], input[name="detect"], input[name="end"], \
    input[name="startDateTime"], input[name="detectDateTime"], input[name="reportDateTime"], \
    input[name="investigationStartDate"], input[name="incidentEndDate"], \
    input[name="impactEndDate"], input[name="investigationEndDate"]',
    )
    .forEach((el) => {
      el.type = 'datetime-local';
      el.required = true;
    });

  // Обязательные поля
  document
    .querySelectorAll(
      'input[name="number"], input[name="incidentNumber"], \
    select[name="isEventResolved"], select[name="isIncidentResolved"], \
    select[name="incidentType"], select[name="negativeImpact"], \
    select[name="offenderType"], select[name="offenderMotivation"]',
    )
    .forEach((el) => {
      el.required = true;
    });


  // Основные поля события и инцидента
  document
    .querySelectorAll(
      'input[name="surname"], input[name="operationSurname"], input[name="griibSurname"]',
    )
    .forEach((el) => {
      el.required = true;
    });

  // === СОБЫТИЯ ===
  isIncidentSelect.required = true;
  isIncidentSelect.addEventListener('change', (e) => {
    isIncident = e.target.value === 'yes';
    currentSectionIndex = 0;
    updateSections();
  });

  nextBtn.addEventListener('click', () => {
    if (
      isSectionValid(currentSectionIndex) &&
      currentSectionIndex < sections.length - 1
    ) {
      currentSectionIndex++;
      updateSections();
    }
  });

  prevBtn.addEventListener('click', () => {
    if (currentSectionIndex > 0) {
      currentSectionIndex--;
      updateSections();
    }
  });

  // Отслеживаем изменения в полях
  document.addEventListener('input', updateButtons);
  document.addEventListener('change', updateButtons);

  // === ОТПРАВКА ===
  sendBtn.addEventListener('click', async () => {
    if (!isSectionValid(currentSectionIndex)) {
      alert('Заполните все обязательные поля!');
      return;
    }

    try {
      const eventData = collectFormData('eventFormContent');
      const eventRes = await authFetch('/api/events', {
        method: 'POST',
        body: JSON.stringify(eventData),
      });
      if (!eventRes?.ok) throw new Error('Ошибка при создании события');

      if (isIncident) {
        const incidentData = {
          ...collectFormData('incidentFormContent'),
          ...collectFormData('incidentFormTypeContent'),
          ...collectFormData('incidentFormAddInfoContent'),
          ...collectFormData('incidentFormResolutionContent'),
        };
        const incRes = await authFetch('/api/incidents', {
          method: 'POST',
          body: JSON.stringify(incidentData),
        });
        if (!incRes?.ok) throw new Error('Ошибка при создании инцидента');
      }

      alert('Отчёт успешно создан!');
      document.querySelectorAll('form').forEach((f) => f.reset());
      isIncidentSelect.value = '';
      isIncident = false;
      currentSectionIndex = 0;
      updateSections();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Ошибка отправки');
    }
  });

  // Старт
  updateSections();
});
