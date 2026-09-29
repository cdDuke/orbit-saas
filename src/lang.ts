import type { Dict } from './i18n';

const snippetsEn = [
  `// Orbit detects your framework automatically
import { defineConfig } from '@orbit/sdk';

export default defineConfig({
  project: 'acme-store',
  framework: 'nextjs', // auto-detected
  repo: 'github.com/acme/store',
  previews: true,      // a URL for every branch
});`,
  `export default defineConfig({
  // run next to your users
  regions: ['fra', 'lhr', 'iad', 'nrt'],
  env: { DATABASE_URL: secret('db-url') },
  cache: {
    '/api/products': { ttl: '5m', swr: true },
    '/images/*': { ttl: '30d' },
  },
});`,
  `export default defineConfig({
  scale: {
    min: 0,        // scale to zero when idle
    max: 'auto',   // burst to millions of rps
  },
  ai: { model: 'llama-4-8b', gpu: 'edge' },
  alerts: { p95: '< 50ms', errors: '< 0.1%' },
});`,
];

const snippetsRu = [
  `// Orbit сам определяет ваш фреймворк
import { defineConfig } from '@orbit/sdk';

export default defineConfig({
  project: 'acme-store',
  framework: 'nextjs', // определён автоматически
  repo: 'github.com/acme/store',
  previews: true,      // отдельный URL для каждой ветки
});`,
  `export default defineConfig({
  // запуск рядом с пользователями
  regions: ['fra', 'lhr', 'iad', 'nrt'],
  env: { DATABASE_URL: secret('db-url') },
  cache: {
    '/api/products': { ttl: '5m', swr: true },
    '/images/*': { ttl: '30d' },
  },
});`,
  `export default defineConfig({
  scale: {
    min: 0,        // ноль инстансов в простое
    max: 'auto',   // до миллионов запросов в секунду
  },
  ai: { model: 'llama-4-8b', gpu: 'edge' },
  alerts: { p95: '< 50ms', errors: '< 0.1%' },
});`,
];

export const snippets = { en: snippetsEn, ru: snippetsRu };

export const terminal = {
  en: [
    ['cmd', '$ orbit deploy'],
    ['dim', '› Building acme-store (Next.js)…'],
    ['ok', '✓ Built in 4.2s'],
    ['dim', '› Uploading to 310 locations…'],
    ['ok', '✓ Live → <span class="hl">acme.orbit.app</span> in 11s'],
  ],
  ru: [
    ['cmd', '$ orbit deploy'],
    ['dim', '› Сборка acme-store (Next.js)…'],
    ['ok', '✓ Собрано за 4,2 с'],
    ['dim', '› Загрузка в 310 локаций…'],
    ['ok', '✓ Опубликовано → <span class="hl">acme.orbit.app</span> за 11 с'],
  ],
} as const;

export const dict: Dict = {
  en: {
    copied: 'Copied!',
    'copy.fail': 'Copy failed — select the text manually',
    'copy.ok': 'Command copied to clipboard',
    ms: 'ms',
  },
  ru: {
    'meta.title': 'Orbit — edge-платформа для мгновенных приложений',
    'meta.desc': 'Деплой в 300+ локаций за секунды. Orbit запускает ваш код, данные и AI рядом с пользователями.',
    'nav.features': 'Возможности',
    'nav.how': 'Как это работает',
    'nav.pricing': 'Тарифы',
    'nav.login': 'Войти',
    'cta.start': 'Начать бесплатно',
    menu: 'Меню',
    'hero.new': 'Новое',
    'hero.pill': 'Orbit Edge 2.0 — AI-инференс на edge',
    'hero.t1': 'Edge-платформа',
    'hero.t2': 'для мгновенных приложений',
    'hero.lead':
      'Разворачивайте код, данные и AI-модели в 300+ локациях за секунды. Пользователи получают ответ быстрее чем за 25&nbsp;мс — где бы они ни находились.',
    copied: 'Скопировано!',
    'copy.fail': 'Не удалось скопировать — выделите текст вручную',
    'copy.ok': 'Команда скопирована',
    'hero.f1': 'Бесплатный тариф навсегда',
    'hero.f2': 'Без банковской карты',
    'hero.f3': 'SOC 2 Type II',
    'globe.aria': 'Интерактивный глобус: запросы между edge-локациями',
    'globe.req': 'Запросов / сек',
    'globe.lat': 'Медианная задержка',
    'globe.hint': 'Потяните, чтобы вращать',
    ms: 'мс',
    'logos.aria': 'Нам доверяют',
    'logos.title': 'Нам доверяют быстрые команды',
    'stat.1': 'edge-локаций',
    'stat.2': 'медианная задержка по миру',
    'stat.3': 'доступность по SLA',
    'stat.4u': 'млрд',
    'stat.4': 'запросов в сутки',
    'feat.eyebrow': 'Платформа',
    'feat.title': 'Всё, чтобы выйти на <span class="grad">весь мир</span>',
    'feat.sub': 'Вычисления, хранилище и AI на одной платформе — с инструментами, которые команда уже знает.',
    'b1.t': 'Задержка в реальном времени — везде',
    'b1.p': 'Умная маршрутизация отправляет каждый запрос в самый быстрый исправный регион — автоматически.',
    'b1.legacy': 'Обычный CDN',
    'b2.t': 'Деплой за секунды',
    'b2.p': 'git push или одна команда. Превью-ссылка для каждой ветки.',
    'b3.t': 'Безопасность по умолчанию',
    'b3.p': 'Защита от DDoS, WAF и zero-trust доступ на любом тарифе.',
    'b3.s': 'атак отражено сегодня',
    'b4.t': 'Аналитика вживую',
    'b4.p': 'Трафик, ошибки и Web Vitals обновляются в дашборде каждую секунду.',
    'b5.t': 'Работает с вашим стеком',
    'b5.p': 'Готовые адаптеры для современных фреймворков и рантаймов. Без привязки к вендору.',
    'how.eyebrow': 'Как это работает',
    'how.title': 'От <span class="grad">git push</span> до масштаба планеты',
    'how.aria': 'Шаги',
    's1.t': 'Подключите репозиторий',
    's1.p': 'Импорт из GitHub, GitLab или Bitbucket. Фреймворк определим сами.',
    's2.t': 'Настройте один раз',
    's2.p': 'Переменные окружения, регионы и правила кэша — в одном типизированном файле.',
    's3.t': 'Масштабируйтесь автоматически',
    's3.p': 'От нуля до миллионов запросов — и никаких серверов, за которыми надо следить.',
    'price.eyebrow': 'Тарифы',
    'price.title': 'Простые тарифы — <span class="grad">платите за использование</span>',
    'price.billing': 'Период оплаты',
    'price.monthly': 'Помесячно',
    'price.yearly': 'За год',
    'price.per': '/ месяц',
    'price.perseat': '/ участник / месяц',
    'price.popular': 'Популярный',
    'p1.d': 'Для пет-проектов и экспериментов.',
    'p1.1': '100 тыс. запросов в месяц',
    'p1.2': '1 ГБ edge-хранилища',
    'p1.3': 'Поддержка сообщества',
    'p1.4': 'Превью-деплои',
    'p2.d': 'Для растущих продуктов и команд.',
    'p2.cta': 'Попробовать 14 дней',
    'p2.1': '10 млн запросов в месяц',
    'p2.2': '100 ГБ edge-хранилища',
    'p2.3': 'AI-инференс на GPU',
    'p2.4': 'Расширенная аналитика',
    'p2.5': 'Поддержка по почте, ответ за 24 ч',
    'p3.d': 'Для критически важных нагрузок.',
    'p3.price': 'Индивидуально',
    'p3.cta': 'Связаться с отделом продаж',
    'p3.1': 'Безлимитные запросы',
    'p3.2': 'Выделенные регионы',
    'p3.3': 'SLA доступности 99,999%',
    'p3.4': 'SSO, журнал аудита, SCIM',
    'p3.5': 'Персональный инженер',
    'faq.title': 'Ответы на <span class="grad">вопросы</span>',
    q1: 'Что такое edge-платформа?',
    a1: 'Вместо одного дата-центра Orbit запускает приложение сразу в сотнях городов. Каждого пользователя обслуживает ближайшая к нему локация, поэтому страницы и API отвечают почти мгновенно.',
    q2: 'Придётся переписывать приложение?',
    a2: 'Нет. Orbit поддерживает стандартные Web API и готовые адаптеры для популярных фреймворков. Большинство проектов разворачиваются без изменений в коде.',
    q3: 'Как работает оплата по использованию?',
    a3: 'В каждый тариф входит щедрая квота. Сверх неё вы платите только за фактическое потребление — с уведомлениями и жёсткими лимитами расходов, чтобы не было сюрпризов.',
    q4: 'Где хранятся мои данные?',
    a4: 'Вы выбираете сами. Можно закрепить данные в нужной юрисдикции для соответствия требованиям или позволить Orbit реплицировать их по миру ради минимальной задержки.',
    q5: 'Можно отменить подписку в любой момент?',
    a5: 'Да. Оплата помесячная, если вы не выбрали годовую, а все данные можно выгрузить одной командой.',
    'final.title': 'Готовы к <span class="grad">мгновенной</span> скорости?',
    'final.sub': 'Присоединяйтесь к 40 000+ разработчиков, которые запускаются быстрее с Orbit.',
    'ft.product': 'Продукт',
    'ft.changelog': 'Обновления',
    'ft.dev': 'Разработчикам',
    'ft.docs': 'Документация',
    'ft.status': 'Статус',
    'ft.company': 'Компания',
    'ft.about': 'О нас',
    'ft.careers': 'Вакансии',
    'ft.contact': 'Контакты',
    'ft.ok': 'Все системы работают',
    'ft.concept': 'Концепт продукта — проект для портфолио',
  },
};
