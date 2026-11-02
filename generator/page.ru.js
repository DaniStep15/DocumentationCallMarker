'use strict'
// Russian page content for callmarker_integration.html; assembled by build.js.
const { customers, customFields, opportunities, appointments, messages, he } = require('./data')
const statusSection = require('./status')

const SCOPE = {
    now: 'Используется сейчас',
    later: 'Рассматривается на потом',
    notused: 'Сейчас не используется',
    deferred: 'Отложено',
    pending: 'Требует решения'
}
const IMPL = {
    match: 'Код соответствует решению',
    differs: 'Код расходится',
    partial: 'Только при настройке',
    temp: 'Временный режим',
    absent: 'Не реализовано',
    'absent-ok': 'Не отправляется (по плану)'
}
const badge = (kind, v) => `<span class="badge ${kind}-${v}">${(kind === 's' ? SCOPE : IMPL)[v]}</span>`
const slug = s => s.replace(/[{}]/g, '').replace(/[^a-z0-9_]+/gi, '-')

// ---- custom fields → common shape
const cfApi = t =>
    t.startsWith('Checkbox')
        ? 'Checkbox: значение должно совпадать с опцией поля или быть нулём (документировано). Интеграция отправляет <code>"1"</code>/<code>"0"</code>.'
        : t.startsWith('Selectbox')
        ? 'Значение должно точно совпадать с опцией из настроек поля (документировано для Select). Список опций не передан.'
        : t.startsWith('Date')
        ? 'Формат ввода для custom-полей Date не документирован. Форматы дат follow-up/appointment его не определяют.'
        : 'Общее правило <code>custom_field_{id}</code>. Для текстовых полей формат и лимиты длины не документированы.'
const cf = customFields.map(f =>
    Object.assign({}, f, {
        key: `custom_field_${f.id}`,
        label: `<code>custom_field_${f.id}</code> <span class="bn">(${f.name}${f.alias ? ' / ' + f.alias : ''})</span>`,
        type: 'Необязательное. ' + f.ftype + '.' + (f.sid === f.id ? ' ID общий для всех окружений («(S)»-версии нет).' : ` ID на dev/stage: <code>custom_field_${f.sid}</code> (${f.name}(S)); в production — <code>custom_field_${f.id}</code> (${f.name}).`),
        api: cfApi(f.ftype)
    })
)

const withLabels = (list, prefix) =>
    list.map(p =>
        Object.assign({}, p, {
            anchor: `${prefix}-${p.key ? slug(p.key) : 'direction'}`,
            label: p.label || (p.key ? `<code>${p.key}</code>` : '<span class="unknown">(без имени — направление; ключ неизвестен)</span>')
        })
    )

const groups = {
    cust: withLabels(customers, 'cust'),
    cf: withLabels(cf, 'cf'),
    opp: withLabels(opportunities, 'opp'),
    appt: withLabels(appointments, 'appt'),
    msg: withLabels(messages, 'msg')
}

const ROWS = [
    ['meaning', 'Ключ API и бизнес-смысл', ''],
    ['type', 'Обязательность / тип', ''],
    ['source', 'Источник в Mediwho', ''],
    ['transform', 'Преобразование и правила отправки', ''],
    ['api', 'Поведение по документации API', 'k-api'],
    ['current', 'Текущая реализация', 'k-cur'],
    ['live', 'Результат живого теста 11.10.2026', 'k-live'],
    ['intended', 'Подтверждённое целевое поведение', 'k-int'],
    ['open', 'Открытые вопросы / нужная проверка', 'k-open']
]

const card = p => `
<article class="card" id="${p.anchor}" data-param data-scope="${p.scope}" data-impl="${p.impl}">
  <header><h4>${p.label}</h4><div class="badges">${badge('s', p.scope)}${badge('i', p.impl)}</div></header>
  <dl>${ROWS.filter(([k]) => p[k])
      .map(([k, t, cls]) => `<div class="${cls}"><dt>${t}</dt><dd>${p[k]}</dd></div>`)
      .join('')}</dl>
</article>`

const summary = (list, cols) => `
<div class="tablewrap"><table class="summary">
<thead><tr><th>Параметр</th>${cols.map(x => `<th>${x[0]}</th>`).join('')}<th>План</th><th>Код сейчас</th></tr></thead>
<tbody>${list
    .map(
        p =>
            `<tr data-param data-scope="${p.scope}" data-impl="${p.impl}"><td><a href="#${p.anchor}">${p.label}</a></td>${cols
                .map(x => `<td>${p[x[1]]}</td>`)
                .join('')}<td>${badge('s', p.scope)}</td><td>${badge('i', p.impl)}</td></tr>`
    )
    .join('')}</tbody></table></div>`

// ---- examples
const ex = (title, note, rows, extra) => `
<figure class="example">
  <figcaption><strong>${title}</strong><span class="badge s-pending">Пример — в таком виде не отправлялся</span></figcaption>
  <p class="note">${note}</p>
  <div class="tablewrap"><table class="extable"><thead><tr><th>Точный ключ API</th><th>Пример значения</th><th>Пояснение</th></tr></thead><tbody>
  ${rows.map(([k, v, a]) => `<tr><td><code>${k}</code></td><td><code>${v}</code></td><td>${a}</td></tr>`).join('')}
  </tbody></table></div>
  <pre class="raw" aria-label="Тело запроса в раскодированном виде">POST https://app.callmarker.com/api/simple/customers
Content-Type: application/x-www-form-urlencoded   # кодировка — допущение теста

${rows.map(([k, v]) => `${k}=${v}`).join('\n&amp;')}</pre>
  ${extra || ''}
</figure>`

const exCustomer = ex(
    'Пример 1 — тест клиента на stage (тело, которое сформировал бы текущий код)',
    'Вымышленный клиент. Тело показано раскодированным, по одному параметру в строке; реальное тело — одна URL-кодированная строка (иврит и JSON в percent-encoding). Birthday отправляется в фиксированном формате DD-MM-YYYY; отдельные значения Selectbox ещё требуют проверки.',
    [
        ['crm_id', '100501', '<code>users.id</code>'],
        ['name', 'דנה', '<code>users.first_name</code>'],
        ['last_name', 'לוי', '<code>users.last_name</code>'],
        ['email', 'dana.levi@example.test', '<code>users.email</code>'],
        ['number', '0501234567', 'Из <code>users.phone</code>. Временный режим: израильский номер в локальном виде, без <code>international</code> и <code>region</code>.'],
        ['custom_field_16901', 'stage', 'custom_field_16901 (env): из <code>NODE_ENV=stage</code>; ID общий для всех окружений.'],
        ['custom_field_16954', '012345674', 'custom_field_16954 (identity(S)): ведущий ноль сохранён.'],
        ['custom_field_16955', '23-05-1990', 'birthday(S): DD-MM-YYYY; API v2: 1990-05-23.'],
        ['custom_field_17023', 'אבי', 'fathers_name(S): users.fathers_name.'],
        ['custom_field_16957', 'כללית', 'Enums.HMO_COMPANIES; Hebrew name only; unknown ID omitted.'],
        ['custom_field_16958', 'כללית פלטינום', 'custom_field_16958 (hmo_plan(S)): «название на иврите» из <code>users.hmo_plan_id</code>.'],
        ['custom_field_16959', '12', 'custom_field_16959 (active_product_id(S)): <code>products.id</code> по правилу Kaveret (вымышленный ID).'],
        ['custom_field_16960', 'Example Product', 'custom_field_16960 (active_product_name(S)): <code>products.name</code>.'],
        ['custom_field_16964', '2024-01-02 03:04:05', 'custom_field_16964 (created_at(S)): «настенное» время без пояса.'],
        ['custom_field_16965', '100400', 'custom_field_16965 (parent_id(S))'],
        ['custom_field_16966', 'אבי לוי', 'custom_field_16966 (parent_name(S))'],
        ['custom_field_16967', '0521111111', 'custom_field_16967 (parent_phone(S)): как хранится.'],
        ['custom_field_16969', 'ילד', 'custom_field_16969 (parent_related_as(S)): CHILD → ילד.'],
        ['custom_field_16970', '100900', 'custom_field_16970 (agent_id(S)): здесь унаследован от родителя.'],
        ['custom_field_16971', 'רון כהן', 'custom_field_16971 (agent_name(S)): информационно; не стандартный <code>agent_name</code>.'],
        ['custom_field_16972', '0541111111', 'custom_field_16972 (agent_phone(S))'],
        ['custom_field_16973', 'ron.cohen@example.test', 'custom_field_16973 (agent_email(S))'],
        ['custom_field_16975', '100950', 'custom_field_16975 (parent_agency_id(S)): <code>parent_agency_id</code> вычисленного агента.'],
        ['custom_field_16977', '0531111111', 'custom_field_16977 (parent_agency_phone(S)): пользователь агентства.'],
        ['custom_field_16961', '0', 'custom_field_16961 (is_deleted(S)): <code>"1"</code>/<code>"0"</code>; принимает ли Selectbox эти значения — не проверено.'],
        ['custom_field_16962', '0', 'custom_field_16962 (is_blocked(S)): <code>"1"</code>/<code>"0"</code>.'],
        ['custom_field_16981', 'חיפה, הנמל 1, דירה 2, מיקוד 0000000', 'custom_field_16981 (address(S)): читаемый текст, не JSON; не длиннее 255 кодовых точек (предварительный предел интеграции).'],
        ['custom_field_16982', 'לקוח', 'custom_field_16982 (roles(S)): метки на иврите простым текстом через «, », не slug (согласованный формат; в коде API с 18.10.2026, на stage не проверен).'],
        ['campaign', '13565', `<code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (${he('בדיקות')}); константа, контроллер добавляет её последней.`],
        ['token', '&lt;CALLMARKER_TOKEN&gt;', 'Заглушка секрета; <code>CallMarker.sendCustomer</code> добавляет её в самом конце. Реальное значение никогда не показывается.']
    ],
    '<p class="note">На stage тест клиента отправляет «(S)»-ID custom fields; в production эндпоинт закрыт (404). Флажки жизненного цикла тест клиента не отправляет; custom_field_16963 (blocked_agent(S)) — только для агентов; custom_field_16980 (subscriptions(S)) не отправляется. В примере не отправлены также: отсутствующие необязательные значения (например, custom_field_16956 (passport(S)), custom_field_16968 (parent_email(S)), custom_field_16974 (agent_mentor(S)), custom_field_16978 (parent_agency_email(S)), custom_field_16979 (parent_agency_mentor(S))); custom_field_16976 (parent_agency_name(S)) — <code>PENDING_CONFIRMATION</code>; custom_field_16867 (advertisement / ' +
        he('מודעה') +
        ') — <code>NOT_USED</code>; все стандартные параметры со статусом «Сейчас не используется»; верхнеуровневый <code>env</code>.</p>'
)

const exContact = ex(
    'Пример 4 — лид Contact Us с сайта (stage)',
    `Вымышленные данные. Сайт прислал <code>{"params":{"name":"דנה לוי כהן","phone":"050-123-4567"}}</code>: первое слово — <code>name</code>, все остальные — <code>last_name</code>. Это реализованный поток; отдельно этот пример не отправлялся.`,
    [
        ['name', 'דנה', 'Первое слово имени из формы.'],
        ['last_name', 'לוי כהן', 'Все остальные слова. В приложении +60 имя не делится, а пустая фамилия уходит как пустая строка.'],
        ['number', '0501234567', '<code>normalizePhone(phone, \'972\')</code> + <code>callMarkerNumber</code>: израильский номер в локальном виде. Явный иностранный номер (<code>+</code>/<code>00</code>) ушёл бы в E.164 с <code>international=1</code>.'],
        ['source', 'אתר Mediwho', 'Задаётся сервером по origin <code>SITE</code>; для <code>APP</code> — <code>אפליקציית +60</code>.'],
        ['campaign', '13565', 'stage — <code>TESTS_CAMPAIGN</code>; production — <code>LEADS_CAMPAIGN</code> = <code>13558</code>; в development отправки нет.'],
        ['custom_field_16901', 'stage', 'custom_field_16901 (env): из <code>NODE_ENV</code>.'],
        ['custom_field_16988', '1', 'custom_field_16988 (is_lead(S)): только для нового номера (поиск через API v2 не нашёл карточку).'],
        ['custom_field_16999', '0', 'custom_field_16999 (is_registered_without_subscription(S)).'],
        ['custom_field_16992', '0', 'custom_field_16992 (is_customer(S)).'],
        ['custom_field_16996', '0', 'custom_field_16996 (is_former_customer(S)).'],
        ['ignore_duplicates', '1', 'Явно только в Contact Us. Возможен ответ «Duplicate customer», в том числе для номера из другой кампании.'],
        ['token', '&lt;CALLMARKER_TOKEN&gt;', 'Добавляется внутри <code>sendCustomer</code>.']
    ],
    '<p class="note">Не отправляются: <code>crm_id</code>, <code>email</code>, <code>birthday</code> и custom fields полного клиента. В production параллельно и независимо идёт лид в Kaveret через лендинг сайта.</p>'
)

const exPhone = `
<figure class="example">
  <figcaption><strong>Пример 2 — варианты передачи телефона</strong><span class="badge s-pending">Варианты, не комбинировать</span></figcaption>
  <div class="tablewrap"><table class="extable"><thead><tr><th>Режим</th><th>Точные параметры</th><th>Пояснение</th></tr></thead><tbody>
  <tr><td>Текущий код: израильский номер (TEMP)</td><td><code>number=0501234567</code></td><td>Без флагов. Валидный израильский номер в таком виде был принят в живом тесте.</td></tr>
  <tr><td>Текущий код: иностранный номер</td><td><code>number=+447911123456&amp;international=1</code></td><td>Вымышленный номер UK, только с явным <code>+</code>/<code>00</code>. Не проверялся.</td></tr>
  <tr><td>Режим E.164 для Израиля</td><td><code>number=+972501234567&amp;international=1</code></td><td>Был отклонён на номере из невыделенного диапазона; нужно повторить с валидным номером.</td></tr>
  <tr><td>Режим region (не реализован)</td><td><code>number=0501234567&amp;region=IL</code></td><td>ISO alpha-2, не телефонный код. Не проверялся.</td></tr>
  </tbody></table></div>
</figure>`

const exOpp = ex(
    'Пример 3 — автоматическая сделка Purchased (текущий код)',
    'Вымышленные данные. Поля сделки уходят в <strong>том же</strong> POST, что и клиент, при активации личной подписки (кампания 13566, без <code>source</code>); ниже — только поля сделки. Имена параметров сделки одинаковы во всех окружениях. Отмена и восстановление используют то же сопоставление для своей строки: отмена — <code>opportunity_status=3</code> с ID причины (кампания 13568), блокировка — <code>3</code> с причиной <code>367</code>, восстановление и разблокировка — <code>2</code> плюс <code>product_field_1060</code> (кампания 13566). Исторические ручные тесты — в <a href="#st-opportunity">сводке</a>.',
    [
        ['product_id', '7794', '<code>subscriptions.callmarker_product_id</code> тарифа (пример: тариф 192 / SKU I-0004). Нет значения — сделка не отправляется.'],
        ['opportunity_crm_id', '192', '<code>user_subscriptions.subscription_id</code>: тариф, а не покупка; не ключ идемпотентности.'],
        ['opportunity_price', '90', '<code>user_subscriptions.price</code>; применяется только при открытой цене продукта.'],
        ['opportunity_status', '2', 'Purchased (покупка; так же при восстановлении и разблокировке). Без открытой сделки создаётся новая закрытая сделка.'],
        ['opportunity_agent_name', '&lt;users.callmarker_agent_name&gt;', 'Точное Name пользователя CallMarker <strong>или</strong> настроенное у него CRM Name; если колонка пуста — параметр не отправляется. Вживую подтверждено для Name «Yuval Kopel REP»; CRM Name через API v2 не проверить (только id и Name).'],
        ['product_field_1057', 'רון כהן - 100900', 'Поставщик: имя фамилия - <code>users.id</code>, простой текст.'],
        ['product_field_1058', 'Example Product', '<code>products.name</code> купленного тарифа (правило Kaveret).'],
        ['product_field_1059', '88231', '<code>user_subscriptions.id</code>: связь с конкретной покупкой, не уникальный ключ.']
    ],
    '<p class="note">Постоянной защиты от дубликатов нет (решение пользователя): повторное событие или повтор после тайм-аута могут создать вторую сделку. После записи сделка проверяется только чтением через API v2.</p>'
)

// ---- risks & differences in the current code
const risks = [
    ['Телефон (TEMP)', '<code>callMarkerNumber</code> (общая для всех потоков): израильские номера уходят в локальном виде без <code>international</code>/<code>region</code>; иностранные — E.164 + <code>international=1</code>; локальные неизраильские отклоняются.', 'Режим не выбран; ни один из двух документированных режимов не используется для Израиля.', 'Основное описание телефона в <code>callmarker_instructions.md</code> всё ещё говорит про E.164 + <code>international=1</code>. Отказ E.164 доказан только на номере из невыделенного диапазона.'],
    ['Сделки без защиты от дубликатов', 'Сделки покупки, отмены, восстановления, блокировки и разблокировки отправляются автоматически без постоянной защиты от дубликатов (явное решение пользователя).', 'Отложено пользователем, как и идемпотентность платежей.', 'Повторные или параллельные события, два пода при обновлении или ручная повторная отправка после тайм-аута могут создать дубли. <code>product_field_1059</code> помогает их найти, но не предотвращает; у всех сделок одной строки оно общее. Повторные отправки могут создать дополнительные закрытые сделки.'],
    ['Активный продукт после отмены', 'custom_field_16876 (active_product_id) и custom_field_16877 (active_product_name) после отмены пропускаются, а не очищаются.', 'Способ очистки не согласован.', 'В CRM может остаться прежний продукт.'],
    ['Перенос между кампаниями', 'Запись синхронизации с другой кампанией переносит клиента (тест 14.10.2026).', 'Нужны операции с несколькими кампаниями.', 'Клиент может выйти из прежней кампании (наблюдение теста, а не общий контракт); собственные подписки агентов теперь пишутся с проверкой сохранения членств после записи (без <code>unique</code>, исправлений и повторов).'],
    ['custom_field_16873 (passport)', 'Отправляется любое не-NULL значение строкой.', 'Схема в репозитории: <code>tinyint(1) NOT NULL DEFAULT 0</code>.', 'Вместо номера паспорта может уходить <code>"0"</code>/<code>"1"</code>.'],
    ['custom_field_16886 (parent_related_as)', `Заглушка ${he('לא הוזן')} отправляется, если <code>related_as</code> не распознан.`, 'Переводы Kaveret подтверждены; про заглушку явного решения нет.', 'В CRM попадает текст «не введено».'],
    ['custom_field_16881 (created_at)', '<code>YYYY-MM-DD HH:mm:ss</code> без пояса.', 'Текущий формат с описанным ограничением.', 'Неоднозначное время.'],
    ['Активная подписка', 'Две собственные ACTIVE-строки с разными продуктами — расходящиеся строки снимка, отправка блокируется.', 'Инвариант «одна активная подписка» — бизнес-правило.', 'Члены семьи без собственной подписки получают пустые 16876/16877.'],
    ['Общий снимок Kaveret', 'Используется для active_product_id/name, is_deleted, is_blocked, blocked_agent и roles.', 'Общий SQL не меняется.', 'Дефектный JOIN по-прежнему может размножать строки (см. раздел 10).'],
    ['Ответы CallMarker', 'HTTP 200 и «Customer has been added successfully» не подтверждают сделку, её цену, статус или агента.', 'Проверка после записи — только чтение через API v2.', 'Тайм-аут оставляет результат неопределённым; повторов нет.'],
    ['Пример env-файла', '<code>.env.example</code> нет; плейсхолдеры — в <code>callmarker_instructions.md</code>.', '—', 'Переменные задаются вручную (Azure Key Vault для stage).'],
    ['Тесты и lint', 'Мок-тесты, запущенные мной 15.10.2026 (без сети, БД и <code>.env</code>): Contact Us — 34, тест клиента — 43, синхронизация пользователей — 67, активация подписки — 17; все пройдены. ESLint в этой задаче не запускался; последняя известная ошибка — неиспользуемая <code>isCard</code> в <code>KaveretController.js</code> (14.10.2026).', '—', 'Мок-тесты не доказывают совместимость с CRM.']
]
const fixed = [
    'Отправляется <code>campaign</code> вместо <code>campaign_id</code>; кампания теста — константа <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (13565).',
    'Защита <code>auth</code> + <code>is:(admin or developer)</code> есть в маршруте (коммит <code>ac3ecdd09</code>, 12.10.2026); 11.10.2026 в незакоммиченной версии она была закомментирована.',
    'Код сведён в три основных файла: <code>CallMarkerController.js</code>, <code>app/Modules/CallMarker.js</code>, <code>app/Utils/callMarkerCustomer.js</code>.',
    '<code>region</code> больше не отправляется вместе с E.164.',
    "HMO и план: только названия на иврите из каталога; неизвестные ID пропускаются. Birthday: фиксированный DD-MM-YYYY; fathers_name: собственное значение, без пробелов по краям (17022 / 17023). Подтверждено пользователем на stage, 26.10.2026; production не проверен.",
    'custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name) — <code>products.id</code> / <code>products.name</code> по правилу Kaveret (с 14.10.2026).',
    'ID custom fields выбираются по окружению: «(S)» на dev/stage, исходные в production; env — общий custom_field_16901 (env).',
    'custom_field_16878 (is_deleted) и custom_field_16879 (is_blocked) отправляются <code>"1"</code>/<code>"0"</code>; карты опций больше не используются.',
    'custom_field_16897 (subscriptions) больше не отправляется; custom_field_16898 (address) — читаемый текст с предварительным пределом интеграции 255 кодовых точек.',
    'Сделка Purchased отправляется автоматически с внутренним ID продукта CallMarker (<code>subscriptions.callmarker_product_id</code>) и проверяется чтением после записи.',
    'Обычная отмена ACTIVE → CANCELED (ручная, Galil, плановая) и восстановление CANCELED → ACTIVE синхронизируются с отдельными сделками Not purchased и Purchased (коммиты <code>2282e8548</code> и <code>04b1126a5</code>, 18.10.2026); коллективная покупка подключена к <code>SUBSCRIPTION_ACTIVATED</code>.',
    'Блокировка и разблокировка синхронизируются (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>), отмена охватывает BLOCKED и AWAITING_BANK_TRANSFER, сделки Not purchased получают ID причины (367–378), а отмена из заблокированного состояния — примечание <code>product_field_1061</code> (коммиты <code>98ecc453f</code> и <code>dabf47e63</code>, 18.10.2026); custom_field_16899 (roles) отправляется простым текстом.',
    'Агент и агентство читаются отдельными запросами (<code>CallMarker.loadCustomer</code>); дефектный JOIN для полей агентства не используется.',
    'Неоднозначные данные блокируют отправку; форма сырого результата проверяется (<code>readRawRows</code>).',
    'Все значения отправляются строками; <code>CONTRACT_FIELDS</code> описывает контракт и сверяется тестом, но не фильтрует поля во время выполнения.'
]

// ---- checklist: [text, doneNote]
const checklist = [
    ['Транспорт и авторизация', [
        ['POST в form-urlencoded принимается; точный текст ответа об успехе зафиксирован.', 'выполнено: «Customer has been added successfully»'],
        ['Параметр <code>token</code> в теле принимается; API v2 читается с отдельным Bearer-токеном.', 'выполнено'],
        ['Ответ при отсутствующем или неверном токене.', ''],
        ['Защита <code>auth</code> + <code>is:(admin or developer)</code> в маршруте теста клиента.', 'выполнено: в коде с коммита 12.10.2026']]],
    ['Реализованный поток на stage', [
        ['Развёрнутый поток проверен на stage.', 'выполнено: подтверждено пользователем (отдельные случаи и ID не передавались)'],
        ['Проверка в production.', '']]],
    ['Contact Us', [
        ['Сайт: проверка на stage.', 'выполнено: подтверждено пользователем'],
        ['Приложение +60: отдельная контролируемая проверка на stage (лид, кампания 13565, <code>source</code>, пустая фамилия, аккаунт ревью).', ''],
        ['<code>ignore_duplicates=1</code>: ответ «Duplicate customer» для номера из другой кампании.', 'наблюдалось (отчёт пользователя)'],
        ['Письмо-оповещение пользователю 84 действительно приходит (отправка события — не доказательство доставки).', '']]],
    ['Кампании', [
        ['Запись с другой кампанией переносит клиента.', 'наблюдалось: тест 14.10.2026'],
        ['Обновление данных через одну кампанию меняет общие данные клиента в других кампаниях.', 'подтверждено пользователем'],
        ['Как добавить клиента во вторую кампанию без переноса (вопрос к поддержке CallMarker).', ''],
        ['Влияние <code>unique</code> на кампанию агентов; статусы и назначения агентов в разных кампаниях.', '']]],
    ['Флажки жизненного цикла', [
        ['<code>fields[customers]</code> с <code>include=custom_fields&amp;custom_fields_format=map</code>; отмеченный флажок — <code>"1"</code>, снятый — <code>null</code>.', 'выполнено: отчёт пользователя'],
        ['Отправка <code>"0"</code> снимает флажок.', 'выполнено: отчёт пользователя'],
        ['Три шага «лид → зарегистрирован → клиент» сохраняют флажки production, агента, тестовые отметки и env.', 'выполнено: отчёт пользователя'],
        ['Отмена: кампания 13568, is_former_customer = <code>"1"</code>, остальные три — <code>"0"</code>, is_agent и is_test не меняются.', 'выполнено: подтверждено пользователем на stage (не все точки входа)']]],
    ['Режимы телефона', [
        ['Израиль, локальный вид без флагов (текущий TEMP).', 'выполнено: принят валидный номер'],
        ['Израиль, E.164 + <code>international</code>, с <em>валидным</em> номером.', ''],
        ['Локальный номер + <code>region=IL</code>; оба флага вместе.', ''],
        ['Иностранные номера (например, GB, US, IT — случай с ведущим нулём).', ''],
        ['Пустой <code>country_code</code>; нерезидент с израильским номером.', '']]],
    ['Формат birthday', [
        ['После выкладки проверить prod birthday 16869 с DD-MM-YYYY; stage 16955 подтверждён.', ''],
        ['Поведение при неверном формате.', '']]],
    ['Опции Selectbox', [
        ['Selectbox принимает текст опции: «dev» в custom_field_16901 (env) сохранено и отображается.', 'выполнено: тест 7'],
        ['Тексты опций «stage» и «prod» в custom_field_16901 (env).', ''],
        ['Принимают ли custom_field_16878 (is_deleted) и custom_field_16879 (is_blocked), включая «(S)»-версии, значения <code>1</code>/<code>0</code>.', '']]],
    ['Текстовые значения', [
        ['Ведущий ноль в custom_field_16868 (identity) сохраняется в интерфейсе (код это делает, проверено мок-тестом; в CRM не сверялось).', ''],
        ['Отображение custom_field_16881 (created_at) и выбранный часовой пояс.', ''],
        ['Реальные пределы длины полей CallMarker для custom_field_16898 (address; в интеграции предварительно 255 кодовых точек) и custom_field_16899 (roles; предела в коде нет).', ''],
        ['custom_field_16899 (roles) простым текстом после развёртывания.', '']]],
    ['Дубликаты клиентов', [
        ['Повторная отправка с тем же номером без флагов.', 'выполнено: запись обновлена, дубликата нет (тест 4)'],
        ['Клиент определяется по номеру; другой номер с тем же <code>crm_id</code> создаёт новую строку CRM.', 'подтверждено пользователем'],
        ['Бизнес-решения: смена телефона, общий номер в семье.', '']]],
    ['Очистка полей', [
        ['Сохраняет ли пропущенное поле прежнее значение.', ''],
        ['Очищает ли его пустое значение.', '']]],
    ['Сделки', [
        ['Нужен именно внутренний ID продукта CallMarker.', 'выполнено: исторический тест'],
        ['Прямое создание сразу Purchased.', 'выполнено: исторический тест'],
        ['Точное Name «Yuval Kopel REP» → агент CallMarker 13619; неизвестное имя закрытию не мешает, но назначение пустое.', 'выполнено: исторический тест'],
        ['Opened → Purchased и Opened → Not purchased обновляют ту же открытую сделку; без открытой сделки статус 2 или 3 создаёт новую закрытую.', 'выполнено: исторический тест'],
        ['Повторяющийся <code>opportunity_crm_id</code> не мешает дубликатам; поля 1057/1058/1059 сохраняются при закрытии.', 'выполнено: исторический тест'],
        ['Отмена создаёт новую сделку Not purchased; прежние сделки не меняются.', 'выполнено: подтверждено пользователем на stage'],
        ['Восстановление создаёт новую сделку Purchased с <code>product_field_1060</code>; прежние сделки не меняются.', 'выполнено: подтверждено пользователем на stage'],
        ['Коллективная покупка на stage: 13566, is_customer, Purchased с ценой покупки, <code>product_field_1059</code> = новый <code>user_subscriptions.id</code>.', ''],
        ['ID причин 367–378 принимаются и возвращаются через API v2 (<code>not_purchased_reason_id</code>), включая 378.', ''],
        ['Ручная отмена отправляет 378; отмена по запросу — ID своей причины.', ''],
        ['Блокировка: 13566, is_blocked = 1, Not purchased с причиной 367; разблокировка: is_blocked = 0, Purchased с отметкой ' + he('הוסדר תשלום') + '.', ''],
        ['Отмена из BLOCKED / AWAITING_BANK_TRANSFER: 13568, is_blocked = 0, правильное <code>product_field_1061</code>.', ''],
        ['Восстановление сохраняет отметку ' + he('שחזור מנוי') + '; прежние сделки во всех этих сценариях не меняются.', ''],
        ['Создание Purchased без <code>opportunity_agent_name</code>.', ''],
        ['Сопоставление по CRM Name (через API v2 личность не подтвердить: только id и Name).', ''],
        ['Постоянная защита от дубликатов сделок.', '']]],
    ['Ответы', [
        ['Собрать наблюдаемые тексты ответов: «Customer has been added successfully», «Invalid number format», «Duplicate customer» и другие. Ответ на тест 7 не записан.', 'частично'],
        ['HTTP 200 сам по себе не доказывает создание; сделку проверять через API v2.', '']]]
]

// ---- campaigns
const campaigns = [
    ['LEADS_CAMPAIGN', '13558', 'לידים', '1', 'Contact Us в production', 'Contact Us (подтверждено)'],
    ['TESTS_CAMPAIGN', '13565', 'בדיקות', '2', 'Тест клиента всегда; Contact Us на stage; исторические ручные тесты сделок', 'Тесты'],
    ['CUSTOMERS_CAMPAIGN', '13566', 'לקוחות', '3', 'Активация личной подписки (<code>SUBSCRIPTION_ACTIVATED</code>, включая коллективную покупку) восстановление (<code>SUBSCRIPTION_RECOVERED</code>), блокировка и разблокировка (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>): клиент и отдельная сделка', 'Подписка стала ACTIVE (покупка, восстановление из CANCELED, разблокировка) или заблокирована'],
    ['AGENTS_CAMPAIGN', '13567', 'סוכנים', '4', 'Регистрация агента и адрес агента', 'Регистрация агента'],
    ['FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר', '5', 'Отмена ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED (<code>SUBSCRIPTION_CANCELED</code>): клиент и отдельная сделка Not purchased с ID причины', 'Отмена: ручная, Galil, выполнение плановой отмены (только из ACTIVE)'],
    ['REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי', '6', 'Регистрация пользователя на сайте и агентом', 'Обычная регистрация пользователя']
]

const toc = [
    ['purpose', 'Цель и рамки'],
    ['reading', 'Как читать страницу'],
    ['flow', 'Работа тестового эндпоинта'],
    ['customers', 'Customers: стандартные параметры'],
    ['custom', 'Custom fields'],
    ['opportunities', 'Сделки (Opportunities)'],
    ['appointments', 'Встречи (отложено)'],
    ['messages', 'Входящие сообщения (отложено)'],
    ['differences', 'Риски и расхождения кода'],
    ['agency-defect', 'Дефект JOIN агентства в снимке'],
    ['campaigns', 'Справочник кампаний'],
    ['examples', 'Примеры запросов'],
    ['checklist', 'Чек-лист ручной проверки'],
    ['unresolved', 'Нерешённые вопросы'],
    ['sources', 'Источники']
]

const total = Object.keys(groups).reduce((n, g) => n + groups[g].length, 0)
const AGENCY_RANGE = 'custom_field_16892 (parent_agency_id) – custom_field_16896 (parent_agency_mentor)'

module.exports = () => ({
    lang: 'ru',
    title: 'Интеграция с CallMarker',
    total,
    body: `<div class="layout">
<nav class="toc" aria-label="Оглавление">
  <h2>Обзор</h2>
  <p class="toc-overview"><a href="#status">CallMarker: состояние интеграции и открытые вопросы</a></p>
  <h2>Справочник</h2>
  <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>
</nav>
<main id="top">
<header class="top">
  <h1>Интеграция Mediwho → CallMarker</h1>
  <div class="meta">Справочник параметров и состояние реализации · проверено 11.10.2026 по текущему коду репозитория API · только документация: код, маршруты, схема и поведение не менялись; запросы в CRM не отправлялись.</div>
</header>
<div class="print-toc"><strong>Содержание:</strong> Обзор: CallMarker: состояние интеграции и открытые вопросы · ${toc.map(([, t], i) => `${i + 1}. ${t}`).join(' · ')}</div>



<div class="callout"><strong>Статус.</strong> Реализованы: тестовый эндпоинт клиента (всегда кампания 13565), Contact Us с сайта и из приложения +60, синхронизация пользователей (регистрация агента, создание клиента на сайте и агентом, адрес агента) активация личной подписки с <strong>автоматической отправкой сделки Purchased</strong>, отмена из ACTIVE, BLOCKED или AWAITING_BANK_TRANSFER (отдельная сделка Not purchased с ID причины), восстановление (новая сделка Purchased с отметкой ${he('שחזור מנוי')}), блокировка (Not purchased с причиной 367) и разблокировка (Purchased с отметкой ${he('הוסדר תשלום')}). Пользователь подтвердил успешную проверку на stage, включая обычную отмену и восстановление (отдельные случаи не передавались; проверки в production не было). Блокировка, разблокировка, ID причин, примечание 1061 и коллективная покупка вживую ещё не проверены. Краткая сводка — на отдельной странице <a href="#status">«CallMarker: состояние интеграции и открытые вопросы»</a>.</div>
${statusSection()}

<div class="filters" role="search">
  <input id="q" class="f-q" type="search" placeholder="Фильтр параметров (ключ, имя, таблица, текст)…" aria-label="Фильтр параметров">
  <select id="fscope" class="f-scope" aria-label="Фильтр по плану"><option value="">Любой план</option>${Object.keys(SCOPE).map(k => `<option value="${k}">${SCOPE[k]}</option>`).join('')}</select>
  <select id="fimpl" class="f-impl" aria-label="Фильтр по коду"><option value="">Любой статус кода</option>${Object.keys(IMPL).map(k => `<option value="${k}">${IMPL[k]}</option>`).join('')}</select>
  <span class="count f-count" id="count" data-tpl-all="Параметров: {t}" data-tpl-some="Показано {n} из {t}">Параметров: ${total}</span>
</div>

<section id="purpose">
<h2>1. Цель и рамки</h2>
<p>CallMarker должен <strong>постепенно заменить Kaveret</strong> в роли CRM, получающей данные клиентов Mediwho. <strong>MyBusiness сохраняется</strong> и продолжает работать без изменений. Путь Kaveret (<code>app/Modules/Kaveret.js</code>, который на prod отправляет снимок <code>Kaveret.scopeGetUserInfo</code> в вебхук Make) не меняется; тест CallMarker использует общий снимок только для шести вычисляемых значений.</p>
<ul>
<li><strong>Сейчас:</strong> тестовый эндпоинт клиента; Contact Us (сайт и приложение +60); синхронизация пользователей при регистрации агента, создании клиента, адресе агента, активации личной подписки (вместе с автоматической сделкой Purchased), отмене (отдельная сделка Not purchased с ID причины), восстановлении (новая сделка Purchased), блокировке и разблокировке. См. <a href="#st-lifecycle">сводку</a>.</li>
<li><strong>Не реализовано:</strong> прочие переходы статусов (CARD_BLOCKED и AWAITING_BANK_APPROVAL → CANCELED, истечение), ручная активация других статусов, импорт и административные пути, Fly/RDG, оставшиеся ветки регистрации, члены семьи, постоянная защита сделок от дубликатов, хранение членства в кампаниях, встречи, входящие сообщения.</li>
<li><strong>Секреты:</strong> токен задаётся вручную в <code>CALLMARKER_TOKEN</code>. На этой странице — только заглушка <code>&lt;CALLMARKER_TOKEN&gt;</code>.</li>
</ul>
</section>

<section id="reading">
<h2>2. Как читать страницу</h2>
<p>Каждый custom field записывается как точный ключ API и бизнес-имя в скобках, например <code>custom_field_16893</code> <span class="bn">(parent_agency_name)</span>. В телах запросов — только точный ключ. В карточке параметра есть строки, и цветные категории строго разделены:</p>
<div class="legend">
  <div><span class="swatch" style="background:var(--api)"></span><strong>Поведение по документации API</strong> — только то, что сказано в переданном документе CallMarker.</div>
  <div><span class="swatch" style="background:var(--cur)"></span><strong>Текущая реализация</strong> — что делает код в репозитории API сейчас, по чтению файлов.</div>
  <div><span class="swatch" style="background:var(--live)"></span><strong>Результат живого теста</strong> — что записано в журнале теста 11.10.2026 и в отчётах пользователя (тесты 1–7); здесь не воспроизводилось. Различается: поле включено в запрос, запрос принят, значение сверено в интерфейсе.</div>
  <div><span class="swatch" style="background:var(--int)"></span><strong>Подтверждённое целевое поведение</strong> — решения заказчика. Реализованы и проверены только там, где это сказано в строках выше.</div>
  <div><span class="swatch" style="background:var(--open)"></span><strong>Открытые вопросы / нужная проверка</strong> — нерешённые вопросы и проверки на реальной CRM.</div>
</div>
<h3>Метки</h3>
<div class="tablewrap"><table><thead><tr><th>Метка плана</th><th>Значение</th><th>Метка кода</th><th>Значение</th></tr></thead><tbody>
<tr><td>${badge('s', 'now')}</td><td>Входит в текущий объём для клиента.</td><td>${badge('i', 'match')}</td><td>Код следует подтверждённому решению (по чтению кода).</td></tr>
<tr><td>${badge('s', 'later')}</td><td>Рассматривается для следующего этапа.</td><td>${badge('i', 'differs')}</td><td>Код делает не то, что подтверждено или документировано.</td></tr>
<tr><td>${badge('s', 'notused')}</td><td>Понятно, но сейчас не используется.</td><td>${badge('i', 'partial')}</td><td>Отправляется только при заданной необязательной настройке.</td></tr>
<tr><td>${badge('s', 'deferred')}</td><td>Весь блок отложен.</td><td>${badge('i', 'temp')}</td><td>Временное решение в коде до следующего теста CRM.</td></tr>
<tr><td>${badge('s', 'pending')}</td><td>Сопоставление или режим предложены, но не решены.</td><td>${badge('i', 'absent')}</td><td>Кода нет, хотя параметр предложен или нужен.</td></tr>
<tr><td></td><td></td><td>${badge('i', 'absent-ok')}</td><td>Не отправляется, и это соответствует плану.</td></tr>
</tbody></table></div>
<p class="note">Общие правила отправки: отсутствующие необязательные значения пропускаются, а не отправляются пустыми; все значения уходят строками (сохраняются ведущие нули и значимый <code>0</code>). Очищает ли пропуск или пустое значение сохранённые данные — неизвестно. Флаги вида «if set» не отправляются, когда не нужны.</p>
</section>

<section id="flow">
<h2>3. Работа тестового эндпоинта</h2>
<p>Файлы: <code>start/routes/call-marker.js</code> (маршрут), <code>app/Controllers/Http/CallMarkerController.js</code> (HTTP-проверки, пробный запуск, условия живой отправки), <code>app/Modules/CallMarker.js</code> (чтение данных, HTTP-отправка, Contact Us), <code>app/Utils/callMarkerCustomer.js</code> (чистое отображение и преобразования), <code>tests/callmarker-customer-regressions.js</code>. Маршрут подключён в <code>start/routes/index.js</code>.</p>
<ol class="steps">
<li><strong>Маршрут.</strong> <code>POST /call-marker/test/customer</code>, защищён <code>auth</code> + <code>is:(admin or developer)</code> (<code>start/routes/call-marker.js:9</code>).</li>
<li><strong>Защита окружения.</strong> Если <code>NODE_ENV</code> не <code>development</code> и не <code>stage</code>, контроллер отвечает <code>404 NOT_FOUND</code>. Значение env, отправляемое в CallMarker, эту защиту не заменяет.</li>
<li><strong>Входные данные.</strong> <code>user_id</code> должен соответствовать <code>^\\d{1,10}$</code> и быть &gt; 0, иначе <code>400 INVALID_USER_ID</code>. <code>dry_run</code>: отсутствует, пусто, <code>true</code> или <code>1</code> — пробный запуск; <code>false</code> или <code>0</code> — живой; иначе <code>400 INVALID_DRY_RUN</code>.</li>
<li><strong>Загрузка (только чтение).</strong> <code>CallMarker.loadCustomer()</code>: строка <code>users</code> (нет — <code>404 USER_NOT_FOUND</code>), родитель, вычисленный агент (собственный, иначе агент родителя), пользователь агентства по <code>agent.parent_agency_id</code>, собственные ACTIVE-строки <code>user_subscriptions</code> с <code>subscriptions.name</code>, плюс общий снимок Kaveret. Форма сырого результата проверяется (<code>readRawRows</code>): неожиданная — <code>500 UNEXPECTED_RAW_RESULT</code>/<code>UNEXPECTED_RAW_ROW</code>, пустой снимок — <code>500 SNAPSHOT_MISSING</code>.</li>
<li><strong>Отображение.</strong> <code>buildCustomerPayload()</code> возвращает разрешённые поля, <code>omitted[{field, label, reason}]</code>, <code>ambiguities</code>, <code>warnings</code> и <code>phone{source, warnings, sent_format}</code>. Причины пропуска: <code>EMPTY</code>, <code>NOT_USED</code>, <code>PENDING_CONFIRMATION</code>, <code>SOURCE_ROW_NOT_FOUND</code>, <code>AMBIGUOUS</code>, <code>INVALID_JSON</code>, <code>INVALID_SHAPE</code>, <code>INVALID_DATE</code>, <code>SELECT_MAP_NOT_CONFIGURED</code>, <code>SELECT_VALUE_NOT_MAPPED</code>. Ошибка телефона — <code>422</code>.</li>
<li><strong>Кампания.</strong> Всегда <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> = <code>13565</code>; ни окружение, ни запрос её не меняют. <code>config_complete_for_live = Boolean(fields.campaign)</code> оставлен для совместимости: он отражает только наличие кампании (сейчас всегда <code>true</code>) и <strong>не</strong> означает готовность к живой отправке — токен, флаг включения и неоднозначности проверяются только на живом пути.</li>
<li><strong>Пробный запуск.</strong> <code>200 {dry_run:true, user_id, url, content_type, fields, omitted, ambiguities, phone, warnings, config_complete_for_live}</code>. HTTP-запроса нет, токена в ответе нет, но персональные данные клиента в ответе есть.</li>
<li><strong>Условия живой отправки.</strong> Сначала сетевая политика: только <code>NODE_ENV=production</code> + <code>CALLMARKER_ENABLED=true</code>, а в production эндпоинт отвечает 404, поэтому живой режим сейчас недоступен везде (<code>403 CALLMARKER_DISABLED</code>); <code>CALLMARKER_TEST_ENABLED=true</code> это не обходит. Пробный запуск доступен. Далее (историческое условие) <code>CALLMARKER_TEST_ENABLED</code> должен быть ровно <code>true</code>, иначе <code>403 CALLMARKER_TEST_DISABLED</code>. Непустые <code>ambiguities</code> → <code>409 AMBIGUOUS_SOURCE_DATA</code>. Нет токена → <code>503 CALLMARKER_NOT_CONFIGURED</code>.</li>
<li><strong>HTTP-транспорт.</strong> <code>CallMarker.sendCustomer</code>: один POST в form-urlencoded на фиксированный URL <code>https://app.callmarker.com/api/simple/customers</code>; <code>token</code> добавляется только здесь; тайм-аут 15 с; любой HTTP-статус принимается; без повторов. Флаги <code>source</code> и <code>ignore_duplicates</code> тест клиента не отправляет — они есть только в Contact Us.</li>
<li><strong>Обработка ответа.</strong> Любой статус CallMarker → наш <code>200 {dry_run:false, upstream:{status, body}, creation_confirmed:false, …}</code>; тело сохраняется как есть, токен вырезается. Нет ответа → <code>502</code> с <code>TIMEOUT</code> или <code>NETWORK_ERROR</code>. Исключение → <code>500 INTERNAL_ERROR</code>. В логах только коды ошибок. CallMarker может ответить HTTP 200 с текстом ошибки («Invalid number format»), поэтому смотреть нужно на тело.</li>
</ol>
<h3>Переменные окружения (только имена)</h3>
<div class="tablewrap"><table><thead><tr><th>Переменная</th><th>Назначение</th></tr></thead><tbody>
<tr><td><code>NODE_ENV</code> + <code>CALLMARKER_ENABLED</code></td><td>Глобальный выключатель: запросы в CallMarker только при <code>production</code> + <code>true</code> (сырые значения, строго); по умолчанию выключено; после изменения нужен перезапуск.</td></tr>
<tr><td><code>CALLMARKER_TEST_ENABLED</code></td><td>Второе условие живого теста; глобальный выключатель не обходит.</td></tr>
<tr><td><code>CALLMARKER_TOKEN</code></td><td>Секретный токен Simple API (запись); пользователь задаёт его вручную. Читается только на живых путях.</td></tr>
<tr><td><code>CALLMARKER_ACCESS_TOKEN</code></td><td>Секретный Bearer-токен API v2 только для чтения: синхронизация пользователей, поиск в Contact Us, проверка сделок.</td></tr>
<tr><td><code>CALLMARKER_TEST_CAMPAIGN_ID</code></td><td><strong>Историческая</strong>: так задавалась кампания в тестах 11.10.2026. С 12.10.2026 не читается; кампания — константа из <code>CAMPAIGNS_LIST</code>.</td></tr>
<tr><td><code>CALLMARKER_IS_DELETED_MAP</code>, <code>CALLMARKER_IS_BLOCKED_MAP</code></td><td><strong>Больше не используются</strong> (с 14.10.2026): custom_field_16878 (is_deleted) и custom_field_16879 (is_blocked) отправляются <code>"1"</code>/<code>"0"</code>.</td></tr>
</tbody></table></div>
<p class="note"><code>.env.example</code> в репозитории больше нет; плейсхолдеры приведены в <code>callmarker_instructions.md</code>. Для stage переменные задаются в Azure Key Vault.</p>
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="customers">
<h2>4. Customers: стандартные параметры</h2>
<p>Эндпоинт <code>POST|GET https://app.callmarker.com/api/simple/customers</code>; документированный формат ответа — строка. Кодировка тела не документирована (form-urlencoded — допущение теста, по журналу работает; для файлов нужен multipart). Верхнеуровневый <code>env</code> не поддерживается (проигнорирован в тестах 4–5) и заменён полем <code>custom_field_16901</code> (env). Custom fields — в <a href="#custom">разделе 5</a>.</p>
${summary(groups.cust, [['Смысл', 'meaning']])}
<h3>Подробно по параметрам</h3>
${groups.cust.map(card).join('')}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="custom">
<h2>5. Custom fields</h2>
<p>Документированное общее правило для <code>custom_field_{id}</code>: значения <em>Checkbox</em> должны совпадать с настроенной опцией или быть нулём; значения <em>Select</em> — с настроенной опцией. Все поля необязательны. <strong>ID зависят от окружения:</strong> dev и stage используют «(S)»-ID, production — исходные (в карточках указаны оба); env — общий custom_field_16901 (env). Наборы «(S)» разделяют только custom-данные: стандартные поля клиента (имя, номер, email, <code>crm_id</code>, <code>source</code>), сопоставление по номеру и членство в кампаниях общие для всех окружений. ID <code>16870</code>–<code>16872</code> не передавались; custom_field_16900 (insurance_question) есть в аккаунте, но не используется.</p>
<div class="callout"><strong>Вычисление агента (как в Kaveret).</strong> Собственный агент клиента, если задан <code>users.agent_id</code>; иначе агент родителя. Поля custom_field_16887 (agent_id) – custom_field_16891 (agent_mentor) описывают этого агента, а ${AGENCY_RANGE} — пользователя, найденного по его <code>parent_agency_id</code>. В текущем коде это делает <code>CallMarker.loadCustomer</code> отдельными запросами.</div>
${summary(groups.cf, [['Тип в CRM', 'ftype'], ['Подтверждённый источник', 'source']])}
<h3>Подробно по полям</h3>
${groups.cf.map(card).join('')}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="opportunities">
<h2>6. Сделки (Opportunities)</h2>
<div class="callout"><strong>Сделки отправляются автоматически</strong> в том же POST, что и клиент: при активации личной подписки — Purchased (кампания 13566), при отмене — отдельная Not purchased (статус <code>3</code> с ID причины, кампания 13568), при блокировке — Not purchased с причиной <code>367</code>, при восстановлении и разблокировке — новая Purchased с <code>product_field_1060</code> (кампания 13566). Сопоставление: <code>subscriptions.callmarker_product_id</code>, <code>user_subscriptions.subscription_id</code>, <code>user_subscriptions.price</code>, статус <code>2</code>, <code>users.callmarker_agent_name</code>, поля продукта 1057/1058/1059. Постоянной защиты от дубликатов нет. Подробности, проверка после записи и исторические тесты — в <a href="#st-opportunity">сводке</a>; пример — пример 3.</div>
${summary(groups.opp, [['Источник', 'source']])}
<h3>Подробно по параметрам</h3>
${groups.opp.map(card).join('')}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="appointments">
<h2>7. Встречи (отложено)</h2>
<p>Весь блок отложен и сейчас не используется. Параметры встреч тоже передаются в запросе Customers, поэтому они должны отсутствовать. Встречи CallMarker — не то же самое, что медицинские приёмы Mediwho.</p>
${summary(groups.appt, [['Смысл по документации', 'meaning'], ['Значения', 'type']])}
<h3>Подробно по параметрам</h3>
${groups.appt.map(card).join('')}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="messages">
<h2>8. Входящие сообщения (отложено)</h2>
<p>Эндпоинт <code>POST|GET https://app.callmarker.com/api/simple/customers/messages</code>; запрос — form-data или JSON; ответ — строка или JSON. Весь блок отложен. Эндпоинт <strong>записывает</strong> сообщение в CallMarker; из переданной документации не следует, что он что-либо отправляет или доставляет клиенту. Имени параметра направления в источнике нет, поэтому его ключ указан как неизвестный.</p>
${summary(groups.msg, [['Смысл по документации', 'meaning'], ['Значения', 'type']])}
<h3>Подробно по параметрам</h3>
${groups.msg.map(card).join('')}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>

<section id="differences">
<h2>9. Риски и расхождения текущего кода</h2>
<p>По чтению файлов 11.10.2026, после правок параллельной сессии. Исправления не принимались на веру: каждый пункт ниже проверен по коду.</p>
<div class="tablewrap"><table><thead><tr><th>Область</th><th>Текущий код</th><th>Ожидание (документация / решение)</th><th>Последствие</th></tr></thead><tbody>
${risks.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}
</tbody></table></div>
<h3>Исправлено по сравнению с предыдущей версией кода</h3>
<ul>${fixed.map(x => `<li>${x}</li>`).join('')}</ul>
</section>

<section id="agency-defect">
<h2>10. Дефект JOIN агентства в общем снимке</h2>
<p>Общий запрос Kaveret <code>app/Models/Kaveret.js</code> (<code>scopeGetUserInfo</code>) не изменён и содержит:</p>
<pre>LEFT JOIN users parent_agent ON agent.parent_agency_id = parent.id      -- строка 235
...
CASE WHEN u.parent_agency_id IS NOT NULL THEN JSON_OBJECT('id', parent_agent.id, ...) -- строки 87-96</pre>
<ul>
<li><strong>Условие ON вообще не ссылается на <code>parent_agent</code>.</strong> Если <code>agent.parent_agency_id = parent.id</code> ложно или NULL, <code>parent_agent</code> будет NULL. Если истинно, подходит <em>каждая</em> строка <code>users</code>: снимок размножается на размер всей таблицы пользователей.</li>
<li><strong>Неверный триггер.</strong> Объект строится по <em>собственному</em> <code>u.parent_agency_id</code> клиента, а не агента; наследованные агенты (<code>agent_of_parent</code>) не учитываются.</li>
<li><strong>Второй источник дублей.</strong> <code>LEFT JOIN user_subscriptions us_active … status = 'ACTIVE'</code> повторяет пользователя для каждой собственной ACTIVE-строки.</li>
<li><strong>Что сейчас делает CallMarker.</strong> Объекты <code>agent</code>/<code>parent_agency</code> и <code>hmo</code> из снимка не используются: агента, агентство и <code>users.hmo_id</code> читает <code>CallMarker.loadCustomer</code> отдельными запросами. Из снимка в общем отображении клиента берутся только custom_field_16876 (active_product_id), custom_field_16877 (active_product_name), custom_field_16878 (is_deleted), custom_field_16880 (blocked_agent; только агентам) и метки custom_field_16899 (roles). Отдельно загружаются или вычисляются: custom_field_16879 (is_blocked) — <code>blockingSubscriptionsQuery</code>; custom_field_16898 (address) — из строк <code>addresses</code>; поле сделки <code>product_field_1058</code> — по собственному правилу загрузки покупки (<code>loadPurchase</code>). custom_field_16897 (subscriptions) не отправляется (<code>NOT_USED</code>).</li>
<li><strong>Дублирующиеся строки снимка.</strong> <code>pickSnapshot</code> сравнивает строки по <code>SNAPSHOT_KEYS</code>: active_product_id, active_product_name, is_deleted, is_blocked, blocked_agent, roles. Этот набор не совпадает с отправляемыми полями: is_blocked из снимка (только BLOCKED) в CallMarker не отправляется, но всё ещё участвует в сравнении, а blocked_agent сравнивается и у не-агентов. Одинаковые строки сворачиваются с предупреждением <code>SNAPSHOT_DUPLICATE_ROWS_IDENTICAL</code>. Если строки расходятся, все шесть ключей пропускаются как <code>AMBIGUOUS</code>: синхронизация пользователей ничего не пишет и отправляет письмо <code>AMBIGUOUS_SOURCE_DATA</code>, тест клиента отвечает 409. Дубли от JOIN агентства эти ключи не меняют; две собственные ACTIVE-подписки с разными продуктами дают расходящиеся строки.</li>
<li><strong>Остаточный риск.</strong> В случае «истинного» условия запрос вернёт столько строк, сколько пользователей в таблице. Это нагрузка на БД и память, хотя данные корректны. Kaveret со своей стороны отправляет все строки в свой вебхук.</li>
</ul>
<p><strong>Правильный источник агентства:</strong> <code>users agency ON agency.id = resolved_agent.parent_agency_id</code> — так и делает <code>CallMarker.loadCustomer</code>. Общий SQL намеренно не меняется, потому что от него зависит Kaveret. Исправлять его — отдельная задача с собственной регрессионной проверкой Kaveret.</p>
</section>

<section id="campaigns">
<h2>11. Справочник кампаний</h2>
<p>Каталог — <code>CAMPAIGNS_LIST</code> в <code>app/Constants/Enums.js</code>; ID хранятся строками. Столбец «# в CSV» — позиция в выгрузке <code>campaigns.csv</code>, а не ID (в выгрузке Min. Calls = 30, Time Between = 180 и статус Active у всех; единицы не указаны). Подробные правила переходов — в <a href="#st-lifecycle">сводке</a>.</p>
<div class="tablewrap"><table><thead><tr><th>Ключ</th><th>ID</th><th>Название</th><th># в CSV</th><th>Используется в коде сейчас</th><th>Утверждённое правило</th></tr></thead><tbody>
${campaigns.map(([key, id, name, n, now, rule]) => `<tr><td><code>${key}</code></td><td><code>${id}</code></td><td>${he(name)}</td><td>${n}</td><td>${now}</td><td>${rule}</td></tr>`).join('')}
</tbody></table></div>
<p class="note">Подключены не все переходы. Отмена пишет в 13568 только из ACTIVE, BLOCKED и AWAITING_BANK_TRANSFER по трём подключённым путям (ручная отмена, Galil, выполнение плановой отмены; плановая отмена обрабатывает только ACTIVE); CARD_BLOCKED и AWAITING_BANK_APPROVAL → CANCELED не подключены. Подключённые переходы блокировки (ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, CANCELED → BLOCKED) и разблокировки пишут в 13566. Ручная активация других статусов и истечение не подключены; у пользователей с собственной ролью агента контексты подписок пропускаются (комбинации для агентов не реализованы). Запись с другой кампанией переносит клиента (тест 14.10.2026). Текущее членство можно прочитать через API v2 (<a href="#st-lifecycle">сводка</a>), но запись его не сохраняет. Несинхронизируемые статусы (например, CARD_BLOCKED, EXPIRED) сохраняют прежнее членство, поэтому кампанию нельзя вывести из одного текущего снимка статусов.</p>
</section>

<section id="examples">
<h2>12. Примеры запросов с пояснениями</h2>
<p>Только вымышленные данные и заглушки секретов. Пример 1 показывает тело, которое сформировал бы текущий код; именно такой набор не отправлялся. Похожие запросы с другими данными в живом тесте проходили.</p>
${exCustomer}
${exPhone}
${exOpp}
${exContact}
</section>

<section id="checklist">
<h2>13. Чек-лист ручной проверки</h2>
<p>Только тестовая кампания (${he('בדיקות')}, <code>13565</code>), отдельный тестовый пользователь и вручную заданный токен. Каждый ответ записывать дословно, без токена. Отметки «выполнено» взяты из журнала живого теста 11.10.2026; галочки — рабочие пометки и не сохраняются.</p>
${checklist
    .map(
        ([t, items]) =>
            `<h3>${t}</h3><ul class="check">${items
                .map(
                    ([i, done]) =>
                        `<li><input type="checkbox" aria-label="выполнено"${done.startsWith('выполнено') ? ' checked' : ''}><span>${i}</span>${done ? `<span class="done">✓ ${done}</span>` : ''}</li>`
                )
                .join('')}</ul>`
    )
    .join('')}
</section>

<section id="unresolved">
<h2>14. Нерешённые вопросы</h2>
<ol>
<li><strong>Contact Us из приложения +60:</strong> живая проверка не выполнена; сетевой доступ со stage отключён текущей политикой (код просмотрен и покрыт мок-тестами).</li>
<li><strong>Режим телефона:</strong> закрепить или убрать временный локальный вид для Израиля; повторить <a href="#cust-international">E.164 + international</a> на валидном номере; решить про <a href="#cust-region">region</a> и иностранные номера.</li>
<li><strong>env:</strong> замена верхнеуровневого <a href="#cust-env">env</a> на <a href="#cf-custom_field_16901">custom_field_16901 (env)</a> утверждена, опция «dev» подтверждена тестом 7; осталось сверить тексты опций «stage» и «prod».</li>
<li><strong>Смена телефона и общий номер:</strong> клиент определяется по номеру, другой номер создаёт новую строку CRM. <strong>Поведение членов семьи</strong> — отложено.</li>
<li><strong>Хранение членства в кампаниях и состояния синхронизации</strong> — отложено. Для Contact Us политика ошибок решена: письмо-оповещение без повторов, ограничения приняты.</li>
<li><strong>Поток <a href="#st-newclient">/new-client</a>:</strong> подключать ли к нему CallMarker и кто генерирует ссылку.</li>
<li><strong>Переходы между кампаниями</strong> (<a href="#st-lifecycle">частично реализованы</a>): прочие переходы статусов, ручная активация других статусов и агенты с личной подпиской не подключены; как добавить клиента во вторую кампанию без переноса — вопрос к поддержке CallMarker; <code>unique</code> может удалить кампанию агентов.</li>
<li><strong>Стандартный <a href="#cust-agent_name">agent_name</a></strong>: сопоставление для назначения агента.</li>
<li><strong><a href="#cust-unique">unique</a> / <a href="#cust-ignore_duplicates">ignore_duplicates</a></strong>: <code>ignore_duplicates</code> явно используется в Contact Us; «Duplicate customer» наблюдался для номера из другой кампании. Значение <code>unique</code> и использование флагов в будущих потоках не утверждены. Для <a href="#cust-duplicate_days">duplicate_days</a>, <a href="#cust-remove">remove</a> и <a href="#cust-attachment">attachment</a> правил включения нет.</li>
<li><strong>custom_field_16869 (birthday)</strong> — production-проверка DD-MM-YYYY (stage подтверждён); <strong>custom_field_16878 (is_deleted) / custom_field_16879 (is_blocked)</strong> — принимают ли Selectbox значения <code>1</code>/<code>0</code>; <strong>custom_field_16881 (created_at)</strong> — часовой пояс.</li>
<li><strong>custom_field_16893 (parent_agency_name)</strong>: подтвердить сопоставление.</li>
<li><strong>custom_field_16873 (passport)</strong>: проверить реальный тип колонки.</li>
<li><strong>custom_field_16886 (parent_related_as)</strong>: отправлять ли заглушку ${he('לא הוזן')}.</li>
<li><strong>Активная подписка у членов семьи</strong> (custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name)).</li>
<li><strong>custom_field_16899 (roles)</strong>: простой текст в коде API с 18.10.2026; развёртывание и живая проверка не выполнена; сетевой доступ со stage отключён текущей политикой.</li>
<li><strong>Лимиты длины</strong> для custom_field_16897 (subscriptions), custom_field_16898 (address) и custom_field_16899 (roles); custom_field_16898 (address) в тестах не отправлялось.</li>
<li><strong>Поля родителя и агентства</strong> (custom_field_16882 (parent_id) – custom_field_16886 (parent_related_as), custom_field_16892 (parent_agency_id), custom_field_16894 (parent_agency_phone) – custom_field_16896 (parent_agency_mentor)): у тестового пользователя пусты, не проверены.</li>
<li><strong>Сделки</strong> (<a href="#st-opportunity">сводка</a>): постоянная защита от дубликатов и идемпотентность платежей — отложены пользователем; приём ID причин 367–378 и примечание <code>product_field_1061</code> вживую не проверены; блокировка и разблокировка на stage не проверены; очистка custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name) после отмены не решена; коллективная покупка на stage не проверена; создание Purchased без <code>opportunity_agent_name</code> не проверено; правило замены неясных флажков при покупке — текущее поведение кода, отдельно не утверждено.</li>
<li><strong>Сообщения:</strong> имя <a href="#msg-direction">ключа направления</a>. <strong>Встречи и сообщения</strong> отложены целиком.</li>
<li><strong>Очистка полей</strong> и полный <strong>каталог ответов</strong> CallMarker.</li>
</ol>
</section>

<section id="sources">
<h2>15. Источники</h2>
<ul>
<li><code>CallMarker API simple documentation.md</code> и <code>campaigns.csv</code> (от пользователя; использованы как справочные данные).</li>
<li><code>docs/instructions/callmarker_instructions.md</code> (включая журнал живого теста 11.10.2026) и <code>docs/instructions/callmarker_parameter_contract.md</code> — документы параллельной сессии. Подтверждённые решения на этой странице имеют приоритет; результаты теста взяты оттуда без воспроизведения.</li>
<li><code>start/routes/call-marker.js</code>, <code>app/Controllers/Http/CallMarkerController.js</code>, <code>app/Modules/CallMarker.js</code>, <code>app/Utils/callMarkerCustomer.js</code>, <code>app/Controllers/Http/KaveretController.js</code>, <code>app/Listeners/CallMarkerListener.js</code>, <code>app/Listeners/EmailListener.js</code>, <code>start/events.js</code>, <code>start/routes/kaveret.js</code>, <code>start/routes/app-60-plus.js</code>, <code>tests/callmarker-customer-regressions.js</code>, <code>tests/callmarker-contact-us-regressions.js</code>.</li>
<li><code>app/Models/Kaveret.js</code>, <code>app/Modules/Kaveret.js</code>, <code>app/Constants/Enums.js</code> (<code>CAMPAIGNS_LIST</code>), <code>docs/models/users.yml</code>, <code>docs/models/user_subscriptions.yml</code>, миграции для <code>passport</code>, <code>parent_agency_id</code> и <code>provided_by</code>.</li>
</ul>
<p class="note">Для подготовки страницы файл <code>.env</code> и значение токена не читались; к базе данных и CRM подключений не было.</p>
</section>
</main>
</div>`
})
