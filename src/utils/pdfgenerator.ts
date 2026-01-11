import PDFDocument from 'pdfkit';
import fs from 'fs';
import { Event, Incident, IncidentType, NegativeImpact, ViolatorType, ViolatorMotivation, IncidentReality, IncidentIntent, NegativePointer } from '@prisma/client';

// Функция форматирования дат (читаемый русский формат)
function formatDateTime(dt?: string | null, showTime: boolean = true): string {
  if (!dt) return '____________________________';
  const d = new Date(dt);
  if (isNaN(d.getTime())) return dt;

  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  if (showTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
  }

  return d.toLocaleString('ru-RU', options).replace(',', ' г.,');
}

// Красивое название для enum-значений (можно расширять)
const prettyLabels: Record<string, string> = {
  // IncidentType
  хищение: 'хищение',
  хакерство: 'хакерство',
  мошенничество: 'мошенничество',
  неправильное_использование_ресурсов: 'неправильное использование ресурсов',
  саботаж: 'саботаж',
  иное_намеренное: 'иное намеренное',
  отказ_аппаратуры: 'отказ аппаратуры',
  отказ_ПО: 'отказ ПО',
  другие_природные_события: 'другие природные события',
  отказ_системы_связи: 'отказ системы связи',
  потеря_значимых_сервисов: 'потеря значимых сервисов',
  пожар: 'пожар',
  недостаточное_кадровое_обеспечение: 'недостаточное кадровое обеспечение',
  другие_случайные_случаи: 'другие случайные случаи',
  операционная_ошибка: 'операционная ошибка',
  ошибка_пользователя: 'ошибка пользователя',
  ошибка_в_эксплуатации_аппаратных_средств: 'ошибка в эксплуатации аппаратных средств',
  ошибка_проектирования: 'ошибка проектирования',
  ошибка_в_эксплуатации: 'ошибка в эксплуатации',
  другие_случаи_ошибок: 'другие случаи ошибок',

  // NegativeImpact
  нарушение_конфиденциальности: 'нарушение конфиденциальности',
  нарушение_целостности: 'нарушение целостности',
  нарушение_доступности: 'нарушение доступности',
  нарушение_неотказуемости: 'нарушение неотказуемости',
  уничтожение: 'уничтожение',
  значимость_указатели: 'значимость / указатели',

  // ViolatorType
  PE: 'PE — Лицо',
  OI: 'OI — Организация/учреждение',
  GR: 'GR — Организованная группа',
  AC: 'AC — Случайность',
  NP: 'NP — Отсутствие нарушителя',

  // ViolatorMotivation
  CG: 'CG — Криминальная/финансовая выгода',
  PH: 'PH — Развлечение/хакерство',
  PT: 'PT — Политика/терроризм',
  RE: 'RE — Месть',
  OM: 'OM — Другие мотивы',

  // Новые поля
  Действительный: 'Действительный',
  Попытка: 'Попытка',
  Предполагаемый: 'Предполагаемый',
  Намеренная: 'Намеренная',
  Случайная: 'Случайная',
  Ошибка: 'Ошибка',
  Неизвестно: 'Неизвестно',

  FD: 'FD — Финансовые убытки / Разрушение бизнес-операций',
  CE: 'CE — Коммерческие и экономические интересы',
  PI: 'PI — Информация, содержащая персональные данные',
  LR: 'LR — Правовые и нормативные обязательства',
  MO: 'MO — Менеджмент и бизнес-операции',
  LG: 'LG — Потеря престижа',
};

// Функция получения красивого названия
function prettify(value?: string | null): string {
  if (!value) return '—';
  return prettyLabels[value] || value.replace(/_/g, ' ');
}

// Заголовок поля
function Label(doc: PDFDocument, text: string) {
  doc.font('Main-Bold').fontSize(11).text(text);
  doc.moveDown(0.2);
}

// =======================================================================
// PDF для ИНЦИДЕНТОВ (полная версия с новыми полями)
// =======================================================================
export function generateIncidentsPDF(incident: Incident, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Регистрация шрифтов (поддержка кириллицы)
    const notoRegular = '/usr/share/fonts/noto/NotoSans-Regular.ttf';
    const notoBold = '/usr/share/fonts/noto/NotoSans-Bold.ttf';
    try {
      if (fs.existsSync(notoRegular) && fs.existsSync(notoBold)) {
        doc.registerFont('Main', notoRegular);
        doc.registerFont('Main-Bold', notoBold);
      } else {
        doc.registerFont('Main', 'Helvetica');
        doc.registerFont('Main-Bold', 'Helvetica-Bold');
      }
    } catch {
      doc.registerFont('Main', 'Helvetica');
      doc.registerFont('Main-Bold', 'Helvetica-Bold');
    }

    const empty = '____________________________';

    const H1 = (t: string) => doc.font('Main-Bold').fontSize(16).text(t, { align: 'center' });
    const H2 = (t: string) => doc.font('Main-Bold').fontSize(13).text(t);
    const Body = (t: string, opts: any = {}) =>
      doc.font('Main').fontSize(11).text(t, {
        align: opts.align ?? 'left',
        lineGap: opts.lineGap ?? 3,
        paragraphGap: opts.paragraphGap ?? 6,
      });

    // Заголовок документа
    H1('Отчёт об инциденте информационной безопасности');
    doc.moveDown(1.5);

    // Основные данные
    H2('1. Основные сведения');
    Label(doc, 'Дата инцидента:');
    Body(formatDateTime(incident.incidentDate, false));
    Label(doc, 'Номер инцидента:');
    Body(incident.incidentNumber ?? empty);
    doc.moveDown(1);

    // Сотрудники
    H2('2. Участники');
    H2('Сотрудник группы эксплуатации');
    Label(doc, 'ФИО:');
    Body(incident.operationSurname ?? empty);
    Label(doc, 'Адрес:');
    Body(incident.operationAddress ?? empty);
    Label(doc, 'Телефон:');
    Body(incident.operationPhone ?? empty);
    Label(doc, 'Email:');
    Body(incident.operationEmail ?? empty);

    doc.moveDown(0.8);
    H2('Сотрудник ГРИИБ');
    Label(doc, 'ФИО:');
    Body(incident.griibSurname ?? empty);
    Label(doc, 'Адрес:');
    Body(incident.griibAddress ?? empty);
    Label(doc, 'Телефон:');
    Body(incident.griibPhone ?? empty);
    Label(doc, 'Email:');
    Body(incident.griibEmail ?? empty);
    doc.moveDown(1);

    // Описание
    H2('3. Описание инцидента');
    Label(doc, 'Что произошло:');
    Body(incident.whatHappened ?? empty);
    Label(doc, 'Как произошло:');
    Body(incident.howHappened ?? empty);
    Label(doc, 'Почему произошло:');
    Body(incident.whyHappened ?? empty);
    Label(doc, 'Поражённые компоненты:');
    Body(incident.affectedComponents ?? empty);
    Label(doc, 'Негативное воздействие на бизнес:');
    Body(incident.businessImpact ?? empty);
    Label(doc, 'Идентифицированные уязвимости:');
    Body(incident.identifiedVulnerabilities ?? empty);
    doc.moveDown(1);

    // Временные метки
    H2('4. Временные метки');
    Label(doc, 'Начало инцидента:');
    Body(formatDateTime(incident.startDateTime));
    Label(doc, 'Обнаружение:');
    Body(formatDateTime(incident.detectDateTime));
    Label(doc, 'Сообщение:');
    Body(formatDateTime(incident.reportDateTime));
    doc.moveDown(1);

    // Статус
    H2('5. Статус');
    Body(`Завершён: ${incident.isIncidentResolved ? 'Да' : 'Нет'}`);
    doc.moveDown(1);

    // Классификация (новые поля!)
    H2('6. Классификация инцидента');
    Label(doc, 'Реальность инцидента:');
    Body(prettify(incident.typeOption1));
    Label(doc, 'Характер угрозы:');
    Body(prettify(incident.typeOption2));
    Label(doc, 'Тип инцидента:');
    Body(prettify(incident.incidentType));
    doc.moveDown(1);

    // Пострадавшие средства
    H2('7. Пострадавшие средства');
    Label(doc, 'Информация:');
    Body(incident.information ?? empty);
    Label(doc, 'Аппаратные средства:');
    Body(incident.hardware ?? empty);
    Label(doc, 'Программное обеспечение:');
    Body(incident.software ?? empty);
    Label(doc, 'Средства связи:');
    Body(incident.communicationMeans ?? empty);
    Label(doc, 'Документация:');
    Body(incident.documentation ?? empty);
    doc.moveDown(1);

    // Негативное воздействие + новые издержки
    H2('8. Негативное воздействие');
    Label(doc, 'Вид воздействия:');
    Body(prettify(incident.negativeImpact));
    Label(doc, 'Значимость (1–10):');
    Body(incident.negativeNumber ?? '—');
    Label(doc, 'Указатель:');
    Body(prettify(incident.negativePointer));
    Label(doc, 'Описание издержек:');
    Body(incident.negativeIssues ?? empty);
    doc.moveDown(1);

    // Разрешение
    H2('9. Разрешение инцидента');
    Label(doc, 'Дата начала расследования:');
    Body(formatDateTime(incident.investigationStartDate));
    Label(doc, 'Расследователи:');
    Body(incident.investigators ?? empty);
    Label(doc, 'Дата завершения инцидента:');
    Body(formatDateTime(incident.incidentEndDate));
    Label(doc, 'Дата окончания воздействия:');
    Body(formatDateTime(incident.impactEndDate));
    Label(doc, 'Дата завершения расследования:');
    Body(formatDateTime(incident.investigationEndDate));
    Label(doc, 'Место хранения отчёта:');
    Body(incident.investigationReportLocation ?? empty);
    doc.moveDown(1);

    // Нарушитель
    H2('10. Нарушитель');
    Label(doc, 'Тип:');
    Body(prettify(incident.violatorType));
    Label(doc, 'Описание:');
    Body(incident.violatorDescription ?? empty);
    doc.moveDown(1);

    // Мотивация
    H2('11. Мотивация нарушителя');
    Body(prettify(incident.violatorMotivation));
    doc.moveDown(1);

    // Действия
    H2('12. Действия по разрешению');
    Label(doc, 'Выполненные:');
    Body(incident.resolutionActions ?? empty);
    Label(doc, 'Планируемые:');
    Body(incident.plannedResolutionActions ?? empty);
    Label(doc, 'Прочие:');
    Body(incident.otherActions ?? empty);

    // Подвал
    doc.moveDown(2);
    doc.font('Main').fontSize(9).text(
      '¹ Номера инцидентов назначаются руководителем ГРИИБ и привязываются к соответствующим событиям.',
      { align: 'left' }
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

// =======================================================================
// PDF для СОБЫТИЙ (обновлено с organization)
// =======================================================================
export function generateEventsPDF(event: Event, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Шрифты
    try {
      const notoRegular = '/usr/share/fonts/noto/NotoSans-Regular.ttf';
      const notoBold = '/usr/share/fonts/noto/NotoSans-Bold.ttf';
      if (fs.existsSync(notoRegular) && fs.existsSync(notoBold)) {
        doc.registerFont('Main', notoRegular);
        doc.registerFont('Main-Bold', notoBold);
      } else {
        doc.registerFont('Main', 'Helvetica');
        doc.registerFont('Main-Bold', 'Helvetica-Bold');
      }
    } catch {
      doc.registerFont('Main', 'Helvetica');
      doc.registerFont('Main-Bold', 'Helvetica-Bold');
    }

    const empty = '____________________________';

    const H1 = (t: string) => doc.font('Main-Bold').fontSize(16).text(t, { align: 'center' });
    const H2 = (t: string) => doc.font('Main-Bold').fontSize(13).text(t);
    const Body = (t: string, opts: any = {}) =>
      doc.font('Main').fontSize(11).text(t, {
        align: opts.align ?? 'left',
        lineGap: opts.lineGap ?? 3,
        paragraphGap: opts.paragraphGap ?? 6,
      });

    H1('Отчёт о событии информационной безопасности');
    doc.moveDown(1.5);

    H2('1. Основные сведения');
    Label(doc, 'Дата события:');
    Body(formatDateTime(event.date, false));
    Label(doc, 'Номер события:');
    Body(event.number ?? empty);
    doc.moveDown(1);

    H2('2. Информация о сообщающем лице');
    Label(doc, 'Организация:');
    Body(event.organization ?? empty);
    Label(doc, 'ФИО:');
    Body(event.surname ?? empty);
    Label(doc, 'Адрес:');
    Body(event.address ?? empty);
    Label(doc, 'Телефон:');
    Body(event.phoneNumber ?? empty);
    Label(doc, 'Электронная почта:');
    Body(event.mail ?? empty);
    doc.moveDown(1);

    H2('3. Описание события');
    Label(doc, 'Что произошло:');
    Body(event.happened ?? empty);
    Label(doc, 'Как произошло:');
    Body(event.happenedCause ?? empty);
    Label(doc, 'Почему произошло:');
    Body(event.rootCause ?? empty);
    Label(doc, 'Поражённые компоненты:');
    Body(event.affectedComponents ?? empty);
    Label(doc, 'Негативное воздействие на бизнес:');
    Body(event.businessImpact ?? empty);
    Label(doc, 'Идентифицированные уязвимости:');
    Body(event.identifiedVulnerabilities ?? empty);
    doc.moveDown(1);

    H2('4. Временные метки');
    Label(doc, 'Начало:');
    Body(formatDateTime(event.start));
    Label(doc, 'Обнаружение:');
    Body(formatDateTime(event.detect));
    Label(doc, 'Сообщение:');
    Body(formatDateTime(event.end));
    Label(doc, 'Длительность:');
    Body(event.eventDuration ?? empty);
    doc.moveDown(1);

    H2('5. Статус');
    Body(`Событие завершено: ${event.isEventResolved ? 'Да' : 'Нет'}`);

    doc.moveDown(2);
    doc.font('Main').fontSize(9).text(
      '¹ Номера событий назначаются автоматически и уникальны в системе.',
      { align: 'left' }
    );

    doc.end();
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}