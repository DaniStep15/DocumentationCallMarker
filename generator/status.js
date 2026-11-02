'use strict'
// Section "CallMarker: состояние интеграции и открытые вопросы" (Russian), rendered into the same page.
// Sources: API repository code (inspected 2026-10-14), docs/instructions/callmarker_*.md,
// docs/audits/kaveret-flow-scan-2026-10-07.md, frontend source (/new-client flow), and the user's reports.
const { he } = require('./data')

const PEND = 'живая проверка не выполнена; сетевой доступ со stage отключён текущей политикой'
const T = {
    impl: '<span class="tag t-impl">Реализовано</span>',
    live: '<span class="tag t-live">Проверено живым тестом</span>',
    dec: '<span class="tag t-dec">Подтверждённое решение</span>',
    open: '<span class="tag t-open">Открытый вопрос</span>',
    next: '<span class="tag t-next">Предлагаемый шаг</span>',
    exist: '<span class="tag t-exist">Существующий поток</span>',
    notimpl: '<span class="tag t-open">НЕ РЕАЛИЗОВАНО</span>',
    lim: '<span class="tag t-exist">Принятое ограничение</span>'
}
const li = items => `<ul class="status-list">${items.map(([t, x]) => `<li>${T[t]} ${x}</li>`).join('')}</ul>`
const table = (head, rows, cls) =>
    `<div class="tablewrap"><table${cls ? ` class="${cls}"` : ''}><thead><tr>${head.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows
        .map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`)
        .join('')}</tbody></table></div>`
const NAMES = {
    17022: 'fathers_name', 16867: 'advertisement', 16868: 'identity', 16869: 'birthday', 16873: 'passport', 16874: 'hmo', 16875: 'hmo_plan',
    16876: 'active_product_id', 16877: 'active_product_name', 16878: 'is_deleted', 16879: 'is_blocked',
    16880: 'blocked_agent', 16881: 'created_at', 16882: 'parent_id', 16883: 'parent_name', 16884: 'parent_phone',
    16885: 'parent_email', 16886: 'parent_related_as', 16887: 'agent_id', 16888: 'agent_name', 16889: 'agent_phone',
    16890: 'agent_email', 16891: 'agent_mentor', 16892: 'parent_agency_id', 16893: 'parent_agency_name',
    16894: 'parent_agency_phone', 16895: 'parent_agency_email', 16896: 'parent_agency_mentor', 16897: 'subscriptions',
    16898: 'address', 16899: 'roles', 16900: 'insurance_question', 16901: 'env', 16987: 'is_lead', 16989: 'is_test',
    16991: 'is_customer', 16993: 'is_agent', 16995: 'is_former_customer', 16997: 'is_registered_without_subscription'
}
// dev/stage ("(S)") IDs; env is shared.
const SIDS = { 17022: 17023, 16867: 16953, 16868: 16954, 16869: 16955, 16873: 16956, 16900: 16983, 16901: 16901, 16987: 16988, 16989: 16990, 16991: 16992, 16993: 16994, 16995: 16996, 16997: 16999 }
for (let id = 16874; id <= 16899; id++) SIDS[id] = id + 83
const cfS = id => cf(id) + (SIDS[id] === id ? '' : ` <span class="note">· (S): <code>custom_field_${SIDS[id]}</code> (${NAMES[id]}(S))</span>`)
const cf = id => `<a href="#cf-custom_field_${id}"><code>custom_field_${id}</code></a> <span class="bn">(${NAMES[id]})</span>`
const cfs = ids => ids.map(cf).join(', ')
const camp = (key, id, name) => `<code>${key}</code> (<code>${id}</code>, ${he(name)})`
const OK = '<span class="ok">✓</span>'
const T5 = 'Отправлено в тесте 5, принято'
const EMPTY = 'Нет (пусто у тестового пользователя)'

const SUB = [
    ['st-scope', '1. Рамки интеграции и триггеры'],
    ['st-contactus', '2. Contact Us: сайт и приложение +60'],
    ['st-newclient', '3. Существующий поток mediwho.com/new-client'],
    ['st-flow', '4. Тестовый эндпоинт клиента'],
    ['st-ident', '5. Идентификация клиента и кампании'],
    ['st-lifecycle', '6. Синхронизация, кампании и флажки жизненного цикла'],
    ['st-opportunity', '7. Сделки: покупка, отмена, восстановление'],
    ['st-fields', '8. Сопоставление полей'],
    ['st-live', '9. Живые тесты и состояние проверки'],
    ['st-unverified', '10. Непроверенные поля и случаи'],
    ['st-deferred', '11. Отложенная функциональность'],
    ['st-temp', '12. Временные элементы реализации'],
    ['st-next', '13. Рекомендуемые шаги'],
    ['st-diff', '14. Расхождения между источниками'],
    ['st-decisions', '15. Таблица решений']
]

// Kaveret snapshot triggers: docs/audits/kaveret-flow-scan-2026-10-07.md §3, re-checked against code on 2026-10-11.
const triggers = [
    ['<code>CREATE_USER</code>', '<code>auth/RegistrationController.js</code>: <code>regAgent:265</code>, <code>regAnotherUser:787</code>, <code>createUser:927</code>; <code>Agent/AgentRegClient.js</code>: <code>addNewFamilyMember:287</code>'],
    ['<code>UPDATE_USER</code>', '<code>auth/RegistrationController.js</code>: <code>updateIdentityWithBirthday:89</code>, <code>updateUserHmo:990</code>; <code>auth/UserController.js</code>: <code>editUser:968</code>, <code>editAgentInfo:1102</code>, <code>editUserInfo:1407</code>, <code>changePhone:2556</code>; <code>auth/RoleUserController.js</code>: <code>updateUserRoles:39</code>; <code>AddressController.js</code>: <code>createAddress:94</code>; <code>AgentController.js</code>: <code>updateClientInfo:1524</code>, <code>regFamilyMember:1879</code>'],
    ['<code>DELETE_USER</code>', '<code>auth/UserController.js</code>: <code>removeFamilyMember:1502, 1515, 1527, 1536</code>, <code>deleteClient:1595</code>. По аудиту, событие отправляется и при отключении от семьи, когда аккаунт остаётся и не помечен DELETED.'],
    ['<code>CREATE_SUBSCRIPTION</code>', '<code>AgentController.js</code>: <code>sendPlusSubSms:1438</code>; <code>UserSubscriptionController.js</code>: <code>__updateCommision:1776</code>, <code>_sendPlusSubSmsFromAgentController:2120</code>; <code>PaymentController.js</code>: <code>updateBankApprovalStatus:2473</code>'],
    ['<code>UPDATE_SUBSCRIPTION</code>', '<code>UserSubscriptionController.js</code>: <code>updateUserSubscriptionStatus:1457</code>, <code>__applyCardBlockStatusChange:1863</code>, <code>userSubscriptionRecovery:2260</code>; <code>Agent/AgentRegClient.js</code>: <code>addNewMemberToSubscription:413</code> (для родителя); <code>GalilRequestsController.js</code>: <code>blockUserSubscription_Galil:330</code>; <code>TranzilaWebhookController.js</code>: <code>applyAutomationActions:659</code>; <code>ReplacedController.js</code>: <code>applyActions:696</code>; <code>Modules/Scheduler.js</code>: <code>autoPrepaymentBlock:208</code>'],
    ['<code>CANCEL_SUBSCRIPTION</code>', '<code>UserSubscriptionController.js</code>: <code>canceledSubscription:649</code>; <code>GalilRequestsController.js</code>: <code>cancelUserSubscription_Galil:252</code>; <code>Services/FutureCancellationRunner.js</code>: <code>runPostCommitSideEffects:331</code>']
].map(([e, w]) => [e, w, 'Отправляет снимок в вебхук Make (только при <code>NODE_ENV</code> → prod)', 'Не подключён напрямую; свои события CallMarker — в разделе 6'])

// ---- Contact Us
const contactEntry = [
    ['<code>SITE</code>', '<code>POST /kaveret/contact-us</code> — публичный маршрут (как и раньше)', 'Тело <code>{params:{name, phone}}</code>. Имя делится по пробелам: первое слово → <code>name</code>, все остальные → <code>last_name</code>; обе части обязательны. Имя ≤ 200 символов, телефон ≤ 30.', he('אתר Mediwho'), 'Лендинг Kaveret для сайта (<code>contactUsKaveret</code>), прежнее написание источника <code>אתר MediWho</code>'],
    ['<code>APP</code>', '<code>POST /app-users/kaveret-contact</code> — группа <code>appSession</code>, контроллер повторно проверяет <code>jwtAppUser</code>', 'Тело запроса не читается: <code>name</code>, <code>last_name</code> и <code>phone</code> берутся из аутентифицированной строки <code>app_users</code>. <code>first_name</code> не делится; пустая фамилия допустима и уходит как <code>\'\'</code>.', he('אפליקציית +60'), 'Отдельный лендинг Kaveret для приложения (<code>contactUsKaveretApp</code>); <code>birthday</code> передаётся только в эту ветку Kaveret']
]
const contactResponses = [
    ['Сайт: корректный ввод', '<code>200 {STATUS:\'OK\'}</code> сразу, до завершения доставки в CRM.'],
    ['Сайт: некорректный ввод', '<code>400 {error:\'INVALID_CONTACT_US\'}</code>, событие не отправляется.'],
    ['Приложение: нет сессии <code>jwtAppUser</code>', '<code>401</code>; исключение при проверке или чтении — <code>500</code>. Это отдельно от проверки данных.'],
    ['Приложение: телефон аккаунта совпадает с <code>APP_REVIEW_PHONE</code>', '<code>200 {STATUS:\'OK\'}</code> до любой проверки и отправки: без события, CRM и письма.'],
    ['Приложение: нет <code>first_name</code> или телефона', '<code>400 {error:\'INVALID_CONTACT_US\'}</code>, событие не отправляется.'],
    ['Приложение: корректные данные', '<code>200 {STATUS:\'OK\'}</code> сразу, до завершения доставки в CRM.'],
    ['Ошибка отправки события (оба источника)', 'Пишется в лог (только код); ответ клиенту не меняется; запасного письма нет.']
]
const contactPayload = [
    ['<code>name</code>, <code>last_name</code>', 'Из контроллера (см. выше).'],
    ['<code>number</code>', '<code>normalizePhone(phone, \'972\')</code> + <code>callMarkerNumber</code>: израильский номер — локальный вид <code>0…</code> (тот же временный формат, что в тесте клиента); явный иностранный (<code>+</code>/<code>00</code>) — E.164 и дополнительно <code>international=\'1\'</code>. Номер, который не нормализуется, в CallMarker не отправляется (<code>PHONE_NOT_SENDABLE</code>).'],
    ['<code>source</code>', 'Задаётся сервером по origin.'],
    ['<code>campaign</code>', 'По окружению (таблица ниже).'],
    ['<code>ignore_duplicates</code>', '<code>\'1\'</code> — явно в полях Contact Us; не добавляется глобально ко всем запросам.'],
    ['custom_field_16901 (env)', 'Из <code>NODE_ENV</code>; ID общий для всех окружений.'],
    ['Флажки жизненного цикла', 'Перед записью — поиск карточки по номеру через API v2 (<code>CALLMARKER_ACCESS_TOKEN</code>). Новый номер → is_lead <code>"1"</code> и остальные три <code>"0"</code>; одна карточка → только повышение (зарегистрированный, клиент, бывший клиент, агент-клиент не сбрасываются в лид); несколько карточек, нет токена, ошибка → флажки не отправляются. is_agent и is_test не отправляются никогда.'],
    ['<code>token</code>', 'Добавляется внутри <code>CallMarker.sendCustomer</code>.']
]
const contactEnv = [
    ['<code>development</code>', 'Не вызывается', 'Не вызывается', 'Нет (только моки)'],
    ['<code>stage</code>', 'Не вызывается (сетевая политика; 13565 — только сопоставление для пробных запусков)', 'Не вызывается', 'Нет'],
    ['<code>production</code> + <code>CALLMARKER_ENABLED=true</code>', camp('LEADS_CAMPAIGN', '13558', 'לידים'), 'Лендинг по origin: <code>SITE</code> — сайта, <code>APP</code> — приложения', 'При сбое любой CRM'],
    ['<code>production</code>, <code>CALLMARKER_ENABLED</code> не ровно <code>true</code>', 'Не вызывается (<code>CALLMARKER_DISABLED</code>, не сбой)', 'Как раньше, независимо', 'Только при сбое Kaveret'],
    ['Другой <code>NODE_ENV</code>, который Kaveret считает production (<code>prod</code>, <code>test</code>, отсутствует)', 'Не вызывается (сетевая политика)', 'Как раньше (правило Kaveret не изменено)', 'Только при сбое Kaveret']
]
const reasons = [
    ['<code>DUPLICATE</code>', 'В теле «Duplicate customer»: CRM отклонила как дубликат, данные этой операцией не обновлены. Наблюдался и для номера из другой кампании.'],
    ['<code>INVALID_NUMBER</code>', 'В теле «Invalid number format»: проверить значение, страну и формат номера.'],
    ['<code>HTTP_ERROR</code>', 'Статус не 2xx (CallMarker или Kaveret): успех не подтверждён.'],
    ['<code>TIMEOUT</code>', 'Нет ответа за 15 с: доставка <strong>неопределённа</strong> (CRM могла обработать запрос); повтора нет.'],
    ['<code>NETWORK_ERROR</code>', 'Сетевая ошибка: доставка неопределённа; повтора нет.'],
    ['<code>NOT_CONFIGURED</code>', 'Нет <code>CALLMARKER_TOKEN</code>: ничего не отправлено.'],
    ['<code>PHONE_NOT_SENDABLE</code>', 'Телефон не нормализован: CallMarker не вызывался.'],
    ['<code>UNEXPECTED_RESPONSE</code>', 'Любой другой ответ: успех не подтверждён.'],
    ['<code>INTERNAL</code>', 'Неожиданное исключение при доставке: успех не подтверждён.']
]

// ---- lifecycle (approved, not implemented)
const syncContexts = [
    ['<code>AGENT_REGISTRATION</code>', '<code>RegistrationController.regAgent</code> (через вспомогательную функцию <code>fireCallMarkerSync</code> в <code>RegistrationController.js</code>): ветка OTP — новый агент и повторная регистрация (200); ветка входа — после сохранения ролей (200). Не срабатывает: существующий агент на ветке входа (206), агентство не найдено, неверный код, ошибка сохранения, шаг отправки кода.', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), he('אתר Mediwho')],
    ['<code>CUSTOMER_CREATION</code>', '<code>regUser</code> (<code>POST /registration</code>, ветка с проверенным OTP) и <code>createUser</code> (<code>POST /registration/user</code>). Не срабатывает: отправка OTP, неверный код, шаги identity/birthday, вход, регистрация агента, члены семьи, создание администратором, регистрация <code>app_users</code>.', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), he('אתר Mediwho')],
    ['<code>AGENT_CUSTOMER_CREATION</code>', '<code>AgentController.regClient</code> (<code>POST /agent/reg-client</code>, <code>AgentController.js:1751</code>), только ветка нового клиента (201). Не подключены: агент как клиент, существующий Fly-лид, член семьи, <code>POST /agent/reg-non-resident-client</code>.', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), he('אתר Mediwho')],
    ['<code>USER_PROFILE_UPDATED</code>', 'Только <code>UserController.editUser</code> (<code>PUT /user/user-data</code>), после успешного сохранения, если изменилось отображаемое поле (<code>first_name</code>, <code>last_name</code>, <code>email</code>, <code>birthday</code>, <code>hmo_id</code>, <code>hmo_plan_id</code>, <code>fathers_name</code>). PATCH /user/edit-info подключён отдельно; член семьи пропускается (<code>FAMILY_PROFILE_PENDING_DECISION</code>).', 'Одно существующее активное членство по классификации MediWho', 'не отправляется'],
    ['<code>AGENT_ADDRESS_UPDATE</code>', '<code>AddressController.createAddress</code> (<code>POST /address</code>, тип AGENT, <code>AddressController.js:99</code>), только при собственной роли агента.', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), 'не отправляется'],
    ['<code>SUBSCRIPTION_ACTIVATED</code>', '<code>PaymentController.addSubscriptionPayment</code> (<code>POST/PUT /payment-info</code>), <code>PaymentController.updateBankApprovalStatus</code> и <code>UserSubscriptionController.updateBlockedCardUserSubscriptionStatus</code>: строка, которая при загрузке была <strong>не</strong> ACTIVE, сохранена как ACTIVE; <code>UserSubscriptionController.createCollectiveSubscription</code> (<code>POST /user-subscription/collective</code>): новая коллективная покупка после успешного <code>addSubscriptionPayment</code>. Всё — через локальную функцию <code>fireCallMarkerSubscriptionActivated</code> (своя копия в каждом из двух контроллеров). Не подключены: ручная активация других статусов, импорт, административная замена тарифа, создание группы (разблокировка — отдельный контекст), продления STO, Fly/RDG, члены семьи.', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'не отправляется'],
    ['<code>SUBSCRIPTION_CANCELED</code>', 'Отмена ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED: <code>UserSubscriptionController.canceledSubscription</code> (<code>POST /user-subscription/canceled-subscription</code>), <code>GalilRequestsController.cancelUserSubscription_Galil</code> (<code>POST /galil/cancel-user-subscription</code>) и <code>FutureCancellationRunner.runOne</code> (выполнение плановой отмены; cron только в production, отменяет только ACTIVE) — через локальную функцию <code>fireCallMarkerSubscriptionCanceled</code>; событие несёт <code>cancellation_request_id</code> (кроме ручной отмены). При запуске пропускаются член семьи (<code>FAMILY_MEMBER_PENDING_DECISION</code>) и устаревшее событие, если уже есть ACTIVE личная подписка (<code>ACTIVE_SUBSCRIPTION_EXISTS</code>). Не подключены: другие статусы → CANCELED (CARD_BLOCKED, AWAITING_BANK_APPROVAL), старые строки, отменённые покупкой или заменой тарифа, произвольные изменения статуса, подписки агентов, Fly/RDG.', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), 'не отправляется'],
    ['<code>SUBSCRIPTION_RECOVERED</code>', '<code>UserSubscriptionController.userSubscriptionRecovery</code> (<code>PUT /subscription-recovery</code>) через <code>fireCallMarkerSubscriptionRecovered</code>: только строка CANCELED, сохранённая как ACTIVE, с известным тарифом не AGENT. Восстановление в BLOCKED идёт как <code>SUBSCRIPTION_BLOCKED</code>; член семьи пропускается (<code>FAMILY_MEMBER_PENDING_DECISION</code>).', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'не отправляется'],
    ['<code>SUBSCRIPTION_BLOCKED</code>', 'ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER и CANCELED → BLOCKED (восстановление с <code>blocked_cancel</code>), через <code>app/Utils/callMarkerEvents.js</code>: <code>UserSubscriptionController.updateUserSubscriptionStatus</code> (<code>PUT /update-subscription-status</code>, индивидуальная и коллективная ветки), <code>GalilRequestsController.blockUserSubscription_Galil</code>, <code>Scheduler.autoPrepaymentBlock</code>, <code>ReplacedController.applyActions</code>, <code>TranzilaWebhookController.applyAutomationActions</code>, <code>UserSubscriptionController.userSubscriptionRecovery</code>. Не подключены: CARD_BLOCKED, переход между BLOCKED и AWAITING_BANK_TRANSFER.', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'не отправляется'],
    ['<code>SUBSCRIPTION_UNBLOCKED</code>', 'BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE через <code>UserSubscriptionController.updateUserSubscriptionStatus</code> (административное изменение статуса, не покупка; отметка ' + he('הוסדר תשלום') + '). Подтверждение банка (AWAITING_BANK_APPROVAL → ACTIVE через <code>updateBankApprovalStatus</code>) и активация из CARD_BLOCKED остаются покупками (<code>SUBSCRIPTION_ACTIVATED</code>).', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'не отправляется']
]
const routing = [
    ['Contact Us', camp('TESTS_CAMPAIGN', '13565', 'בדיקות'), camp('LEADS_CAMPAIGN', '13558', 'לידים')],
    ['Регистрация агента и адрес агента', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), camp('AGENTS_CAMPAIGN', '13567', 'סוכנים')],
    ['Создание клиента (сайт и агент)', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי')],
    ['Активация подписки (клиент + сделка)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Отмена (клиент + сделка Not purchased)', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר')],
    ['Восстановление (клиент + сделка Purchased)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Блокировка и разблокировка (клиент + сделка)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Тест клиента', camp('TESTS_CAMPAIGN', '13565', 'בדיקות'), 'Закрыт (404)']
]
const lifeFlags = [
    [cf(16987), '<code>custom_field_16988</code> (is_lead(S))', 'Contact Us: новый номер; только повышение'],
    [cf(16997), '<code>custom_field_16999</code> (is_registered_without_subscription(S)), не 16998', 'Создание клиента (сайт и агент); только повышение'],
    [cf(16991), '<code>custom_field_16992</code> (is_customer(S))', 'Активация, восстановление, блокировка и разблокировка; подтверждённый переход'],
    [cf(16995), '<code>custom_field_16996</code> (is_former_customer(S))', '<code>"1"</code> только при отмене (<code>SUBSCRIPTION_CANCELED</code>); подтверждённый переход'],
    [cf(16993), '<code>custom_field_16994</code> (is_agent(S))', 'Независим; <code>"1"</code> только при собственной роли агента'],
    [cf(16989), '<code>custom_field_16990</code> (is_test(S))', 'Ни один поток не отправляет; только явно разрешённые тесты']
]
const lifecycle = [
    ['Contact Us (сайт или приложение)', camp('LEADS_CAMPAIGN', '13558', 'לידים'), 'is_lead (только повышение)', '<strong>Реализовано</strong> (production; на stage — 13565)'],
    ['Регистрация пользователя на сайте и агентом', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), 'is_registered_without_subscription (только повышение)', '<strong>Реализовано</strong>'],
    ['Регистрация агента и адрес агента', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), 'Без перехода; is_agent', '<strong>Реализовано</strong>'],
    ['Личная подписка перешла в ACTIVE, включая повторную покупку, апгрейд и коллективную покупку', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (подтверждённый переход)', '<strong>Реализовано</strong> вместе с автоматической сделкой Purchased'],
    ['Отмена ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED (ручная, Galil; плановая — только из ACTIVE)', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), 'is_former_customer (подтверждённый переход); is_blocked = <code>"0"</code>', '<strong>Реализовано</strong> вместе с отдельной сделкой Not purchased и ID причины'],
    ['Блокировка: ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, CANCELED → BLOCKED', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (подтверждённый переход); is_blocked = <code>"1"</code>', '<strong>Реализовано</strong> вместе с отдельной сделкой Not purchased (причина 367)'],
    ['Разблокировка: BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (подтверждённый переход); is_blocked = <code>"0"</code>', '<strong>Реализовано</strong> вместе с отдельной сделкой Purchased (' + he('הוסדר תשלום') + ')'],
    ['Восстановление CANCELED → ACTIVE', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (подтверждённый переход)', '<strong>Реализовано</strong> вместе с новой сделкой Purchased (<code>product_field_1060</code>)'],
    ['CARD_BLOCKED и AWAITING_BANK_APPROVAL → CANCELED, переход между BLOCKED и AWAITING_BANK_TRANSFER, EXPIRED и др.', '—', 'Без изменений', 'Не синхронизируется; CARD_BLOCKED сам по себе is_blocked не ставит (активация из CARD_BLOCKED и подтверждение банка — покупка)'],
    ['Ручная активация других статусов (<code>PUT /update-subscription-status</code>; блокировка и разблокировка через него подключены)', '—', '—', 'Не подключено; отложено'],
    ['<code>PUT /user/user-data</code>; <code>PATCH /user/edit-info</code>; <code>PATCH /user/edit-agent-info</code>', 'Существующее подходящее членство по классификации MediWho', 'Без флажков и Opportunity', 'Birthday, fathers_name, HMO: подтверждено пользователем на stage 26.10.2026; <code>PATCH /user/edit-agent-info</code>: подтверждено пользователем на stage 26.10.2026; не каждая ветка проверена, production не проверен'],
    ['<code>PUT /agent/client-info</code> (HMO, план, имя отца)', 'Существующее подходящее членство по классификации MediWho', 'Только изменённые три поля; без флажков и Opportunity', 'Подтверждено пользователем на stage 26.10.2026; production не проверен'],
    ['Покупка, отмена, восстановление, блокировка или разблокировка собственной (не AGENT) подписки пользователя с собственной ролью <code>agent</code>/<code>insurance_agent</code>', 'Кампания события (покупка, блокировка, разблокировка, восстановление — 13566; отмена — 13568) <strong>плюс</strong> сохранение 13567 и всех прежних активных членств', 'Как у клиента; <code>is_agent</code> = <code>"1"</code>', '<strong>Реализовано</strong> (подробности — в разделе 6). Покупка: подтверждено пользователем на stage 29.10.2026 (общее сообщение, объём выведен из сопровождавшей задачи). Остальные четыре: ' + PEND + '. Production не проверен'],
    ['Отмена, восстановление, блокировка или разблокировка у члена семьи (<code>parent_id</code>)', '—', '—', 'Намеренно пропускается (<code>FAMILY_MEMBER_PENDING_DECISION</code>, только журнал)'],
    ['Fly / RDG', '—', '—', 'Исключены']
]
const oppFields = [
    ['<code>product_id</code>', '<code>subscriptions.callmarker_product_id</code> тарифа точной строки события — внутренний ID продукта CallMarker', 'Нет значения или не положительное целое → <code>PRODUCT_MAPPING_MISSING</code> / <code>PRODUCT_MAPPING_INVALID</code>: сделка не отправляется, клиент пишется без полей сделки, письмо пользователю 84'],
    ['<code>opportunity_crm_id</code>', '<code>user_subscriptions.subscription_id</code> — тариф, не покупка', 'Не ключ идемпотентности'],
    ['<code>opportunity_price</code>', '<code>user_subscriptions.price</code> точной строки как хранится', 'Некорректная цена → <code>PRICE_INVALID</code>: сделка не отправляется. При закрытой цене продукта CallMarker берёт цену каталога'],
    ['<code>opportunity_status</code>', '<code>"2"</code> — покупка, восстановление, разблокировка; <code>"3"</code> — отмена, блокировка', 'Всегда отдельная новая сделка; существующая сделка не меняется'],
    ['<code>opportunity_agent_name</code>', 'Обрезанное по краям <code>users.callmarker_agent_name</code> пользователя из <code>provided_by</code>: точное Name пользователя CallMarker или настроенное у него CRM Name', 'Только если не пусто (<code>AGENT_NAME_NOT_CONFIGURED</code>); имя MediWho не подставляется'],
    ['<code>product_field_1057</code>', 'Поставщик: <code>first_name</code> + <code>last_name</code> + « - » + <code>users.id</code>, простой текст без ссылки', 'Нет поставщика или имени — значение пропускается'],
    ['<code>product_field_1058</code>', '<code>products.name</code> купленного тарифа: <code>MIN(product_subscriptions.id)</code>, <code>products.active = 1</code>', 'Не найдено — пропускается (<code>PRODUCT_NAME_UNRESOLVED</code>)'],
    ['<code>product_field_1059</code>', '<code>user_subscriptions.id</code>', 'Связь со строкой подписки, а не с событием: у всех сделок одной строки значение общее; не уникальный ключ'],
    ['<code>product_field_1060</code>', he('שחזור מנוי') + ' — восстановление; ' + he('הוסדר תשלום') + ' — разблокировка', 'При покупке, отмене и блокировке не отправляется'],
    ['<code>product_field_1061</code>', '<code>msg</code> первого сообщения точного проверенного запроса — только отмена из BLOCKED / AWAITING_BANK_TRANSFER с причиной <code>RETURNED_CHARGE</code>, <code>DENIAL_OF_TRANSACTION</code> или <code>BLOCKING_PAYMENT_METHOD</code>', 'Неизвестный, отсутствующий, чужой или нечитаемый запрос, другая причина, пустое или неверное сообщение — не отправляется'],
    ['<code>opportunity_not_purchased_reason_id</code>', 'Только со статусом 3: блокировка — <code>367</code>; отмена — по причине точного запроса, иначе <code>378</code>', 'Таблица ниже; приём Simple API не проверен']
]
const npReasons = [
    ['<code>MISTAKE</code>', '<code>368</code>', he('טעות בבחירת המינוי')],
    ['<code>UPGRADE</code>', '<code>369</code>', he('שדרוג מינוי')],
    ['<code>CHANGE_SUBSCRIPTION</code>', '<code>370</code>', he('שינוי מינוי')],
    ['<code>CUSTOMER_REQUEST</code>', '<code>371</code>', he('לבקשת הלקוח')],
    ['<code>DENIAL_OF_TRANSACTION</code>', '<code>372</code>', he('הכחשת עסקה')],
    ['<code>BLOCKING_PAYMENT_METHOD</code>', '<code>373</code>', he('חסימת אמצעי תשלום')],
    ['<code>RIP</code>', '<code>374</code>', he('פטירת לקוח')],
    ['<code>OTHER</code>', '<code>375</code>', he('סיבה אחרת')],
    ['<code>STO_CANCELLED</code>', '<code>376</code>', he('ביטול הוראת קבע')],
    ['<code>RETURNED_CHARGE</code>', '<code>377</code>', he('חיוב חוזר')],
    ['— (блокировка)', '<code>367</code>', he('חסימת מנוי')],
    ['— (неизвестно, запасной вариант)', '<code>378</code>', he('לא ידוע')]
]
const oppVerified = [
    ['Нужен внутренний ID продукта CallMarker', '<code>7794</code> создал сделку; <code>user_subscriptions.id</code>, <code>subscriptions.id</code> и номер строки таблицы — нет'],
    ['Прямое создание сразу Purchased', 'Работает'],
    ['Назначение агента', 'Живое сопоставление подтверждено для Name «Yuval Kopel REP» (агент CallMarker 13619). Неизвестные или не сопоставленные имена не мешали закрытию, но назначение оставалось пустым. Сопоставление по CRM Name не проверялось'],
    ['Закрытие открытой сделки', 'Opened → Purchased и Opened → Not purchased обновляли <strong>ту же</strong> открытую сделку'],
    ['Статус без открытой сделки', '<code>status</code> 2 или 3 без открытой сделки создавал <strong>ещё одну</strong> закрытую сделку'],
    ['Дубликаты', 'Повторяющиеся <code>opportunity_crm_id</code> не мешали дубликатам'],
    ['Поля продукта', '1057/1058/1059 сохранялись при закрытии']
]
const oppTests = [
    ['1', 'POST: <code>product_id=7794</code>, <code>opportunity_crm_id=192</code>, <code>opportunity_price=90</code>', 'Создана сделка <code>1441001</code>: статус 1 / Opened, цена 90, <code>campaign_id = null</code>, <code>user_id = null</code>.'],
    ['2', 'Следующий POST: то же + <code>opportunity_status=2</code>, <code>opportunity_agent_name=' + he('אבישי קס') + '</code>', '<strong>Та же</strong> сделка <code>1441001</code>: статус 2 / Purchased, <code>campaign_id = 13565</code>, <code>user_id = null</code>; новой сделки не появилось.']
]

// ---- existing /new-client flow (frontend repo @ 0b94d80c9, API repo)
const FE = s => `<code>frontend/src/${s}</code>`
const newClientSteps = [
    ['Захват параметров', `${FE('pages/_app.js:20–30, 97–103')}. Если в адресе есть одна из строк-признаков (среди них <code>isNewClient</code>) и разбор нашёл хотя бы одну пару, все пары сохраняются в <code>authStore.serviceUrlDetails</code> вместе с <code>ref_url</code> (полный адрес). Отдельного маршрута <code>/new-client</code> в исходном коде нет: путь попадает в общий <code>PublicRouter</code> (${FE('pages/routes.js:129')}), а поведение определяется параметрами.`],
    ['Разбор адреса', `${FE('utils/urlChecker.js:14–26')}, функция <code>getUrlParams</code>. Регулярное выражение <code>[?&amp;]+([^=&amp;]+)=([^?&amp;]*)</code> считает разделителями и <code>?</code>, и <code>&amp;</code>, поэтому ссылка с повторяющимися <code>?</code> разбирается так же, как с обычными <code>&amp;</code>. Значения проходят <code>decodeURIComponent</code>; <code>+</code> не превращается в пробел; неэкранированные <code>?</code> или <code>&amp;</code> внутри значения обрезают его. Строка 18 (<code>url.replace(/^[?&amp;]+/, '')</code>) свой результат не сохраняет и фактически ничего не делает. Стандартный разбор (<code>URLSearchParams</code>, сервер, логи) понял бы ссылку с повторяющимися <code>?</code> иначе: всё после первого <code>?</code> стало бы одним значением первого параметра.`],
    ['Агент не вошёл', `${FE('pages/index.js:60–66')} → <code>myServicesUrlLogin</code> (${FE('utils/urlChecker.js:62–68')}): если <code>isNewClient</code> непустой — переход на вход агента <code>/auth/login/agent/step1</code>. Телефон из ссылки на странице входа не подставляется, если есть <code>isNewClient</code> (${FE('pages/AuthRouter/Login/index.js:28–31')}).`],
    ['Агент вошёл', `<code>myServicesUrl</code> (${FE('utils/urlChecker.js:143–154')}): нет роли <code>agent</code> или <code>insurance_agent</code> → <code>logout(history, ref_url)</code>; есть роль → <code>/agent/client-list</code>. Проверяется истинность строки <code>isNewClient</code>, поэтому пустое значение (<code>isNewClient=</code>) этот шаг не пройдёт.`],
    ['Открытие попапа', `${FE('pages/AgentRouter/ClientList/index.js:85–87, 113–115')}: при наличии ключа <code>isNewClient</code> открывается попап <code>agentAddClient</code> с <code>payload = {…параметры ссылки, status: 'VALIDATE'}</code>.`],
    ['Предзаполнение', `${FE('components/Popup/AgentAddClient/index.js:67–120')}: при <code>status === 'VALIDATE'</code> из ссылки заполняются <code>firstName</code> и <code>lastName</code> (через <code>safeDecode</code>), <code>registerIdentity</code>, <code>registerEmail</code>, <code>registerPhone</code>, <code>registerBirthday</code>. Для email, телефона и identity сначала выставляется признак ошибки, пока валидация его не снимет. Если значение совпало с данными самого агента, форма подставляет данные агента (<code>onFieldChange</code>, строки 395–428).`],
    ['Валидация', `${FE('forms/fieldsHelper.js')}: имя и фамилия — <code>required|string</code>; identity — <code>required|digits:9|identityExists</code>; дата рождения — <code>required</code>; телефон — <code>required|phoneExists</code> (при вводе оставляются цифры, начало только 0 или 5, не более 10 цифр); email — <code>required|email|string|emailExists</code>. Проверки <code>*Exists</code> вызывают <code>POST agent/validate-field</code> (${FE('forms/plugins.js')}).`],
    ['Создание пользователя', `<code>agentService.addClient</code> → <code>POST agent/reg-client</code> (${FE('utils/api.js:134')}). Тело: identity, email (в нижнем регистре), phone (<code>phoneGenerator</code> убирает ведущие <code>0</code>, <code>+</code> и <code>972</code>), first_name, last_name, birthday, lng и при необходимости portfolio_manager. Для нерезидента используется <code>POST agent/reg-non-resident-client</code> с паспортом и кодом страны; из ссылки эти поля не заполняются.`],
    ['Обработка в API', '<code>start/routes/agent.js:66</code> (<code>auth</code>, <code>is:(agent)</code>) → <code>AgentController.regClient:1694</code>. Дата рождения должна быть в формате <code>dd/MM/yyyy</code> (<code>AgentRegClient.validateBirthdayReg:61</code>). Если identity совпадает с identity агента — агент регистрируется как клиент. Если найден существующий пользователь (по identity или телефону) с ролью <code>customer_fly</code> — данные сливаются, вызывается <code>regExistClient</code>, ответ 201. Иначе <code>AgentRegClient.regNewClient:109</code>: проверка дубликатов email и телефона, <code>User.create</code> (статус <code>INCOMPLETE</code>, <code>agent_id</code> — агент), запись <code>Invitation</code> (BLOCKED), событие <code>incompleteByAgent::user</code>, ответ 201.'],
    ['MyBusiness', '<code>incompleteByAgent::user</code> → <code>Crm/Registration.createNewUserCrmByAgent</code>: ищет лид MyBusiness (<code>api.mbapps.co.il</code>, класс Accounts) по <code>PhoneNumber</code> и <code>Env</code>. Если лида нет — создаёт его (id_client, телефон, имя, identity, email, birthday, агент и т. д.); если найден лид с именем <code>CREATE_NEW_VISA_CAL</code> — обновляет. Проверки <code>NODE_ENV</code> в этом методе нет; окружение передаётся полем <code>Env</code>.'],
    ['Kaveret', '<strong>Снимок клиента в Kaveret на этом пути не отправляется</strong>: <code>regClient</code>, <code>regNewClient</code> и <code>regExistClient</code> не вызывают <code>kaveretSetDataBeforeSend::user</code>. Kaveret узнаёт о клиенте только из последующих событий, например <code>CREATE_SUBSCRIPTION</code> при оформлении подписки (<code>AgentController.sendPlusSubSms:1438</code>), и только в prod.'],
    ['После создания', `${FE('components/Popup/AgentAddClient/index.js:197–250')}: новый пользователь (201) → попап выбора продукта (<code>selectProduct</code> / <code>subModeSwitcher</code>); существующий пользователь (200) → сообщение <code>existingUser</code>; уже связанный член семьи (202) → предупреждение.`]
]

const fieldRows = [
    ['<code>campaign</code>', 'Тест клиента: константа <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> = <code>13565</code> (' + he('בדיקות') + ')', 'Да; окружение и запрос не меняют', OK + ' тест 3: клиент виден в кампании', 'Подтверждено'],
    ['<code>number</code>', '<code>users.phone</code> (+ <code>country_code</code> для нормализации)', 'Да; израильский номер временно в локальном виде (<code>IL_LOCAL_TEMP</code>)', OK + ' локальный вид, тест 3', 'Ключ идентификации; политика нормализации <strong>не решена</strong>'],
    ['<code>name</code>', '<code>users.first_name</code>', 'Да', OK + ' тест 4: изменение видно в интерфейсе', 'Подтверждено'],
    ['<code>last_name</code>', '<code>users.last_name</code>', 'Да', 'Включено, принято (тест 3)', 'Подтверждено'],
    ['<code>email</code>', '<code>users.email</code>', 'Да', 'Включено, принято (тест 4)', 'Подтверждено'],
    ['<code>crm_id</code>', '<code>users.id</code>', 'Да', 'Включено, принято (тест 4)', 'Подтверждено; справочное значение, <strong>не</strong> ключ сопоставления'],
    ['<code>source</code>', 'Contact Us: по origin; синхронизация: регистрационные контексты', 'Тест клиента не отправляет', 'Сайт: тест на stage подтверждён пользователем (детали не переданы)', 'Подтверждено для Contact Us'],
    ['<code>ignore_duplicates</code>', 'Только Contact Us: <code>\'1\'</code>', 'Тест клиента и синхронизация не отправляют', '«Duplicate customer» для номера из другой кампании (отчёт пользователя)', 'Подтверждено для Contact Us'],
    ['<code>env</code> (верхний уровень)', '—', 'Не отправляется', 'Тесты 4–5: принят без ошибки, проигнорирован; тест 7: убран', 'Не поддерживается; заменён полем 16901'],
    [cfS(16867), '—', 'Не отправляется (<code>NOT_USED</code>)', 'Не отправлялось', 'Сейчас не используется'],
    [cfS(16868), '<code>users.identity</code>', 'Да, строкой', T5, 'Подтверждено'],
    [cfS(16869), '<code>users.birthday</code>', 'DD-MM-YYYY', 'API v2: YYYY-MM-DD', "Подтверждено пользователем на stage, 26.10.2026; общее подтверждение без доказательств по каждой ветке. Production не проверен."],
    [cfS(17022), '<code>users.fathers_name</code>', 'Text; own user; trimmed', 'Empty → omitted', "Подтверждено пользователем на stage, 26.10.2026; общее подтверждение без доказательств по каждой ветке. Production не проверен."],
    [cfS(16873), '<code>users.passport</code>, если есть', 'Да (любое не-NULL значение)', 'Не проверено: у выбранного пользователя пусто', 'Подтверждено; см. расхождение по типу колонки'],
    [cfS(16874), 'Enums; Hebrew name only', 'Unknown ID → omitted', 'No ID or parentheses', "Подтверждено пользователем на stage, 26.10.2026; общее подтверждение без доказательств по каждой ветке. Production не проверен."],
    [cfS(16875), 'Enums; Hebrew name only', 'Unknown ID → omitted', 'No ID or parentheses', "Подтверждено пользователем на stage, 26.10.2026; общее подтверждение без доказательств по каждой ветке. Production не проверен."],
    [cfS(16876), 'Снимок Kaveret: <code>products.id</code>', 'Да', T5 + ' (тогда — прежнее значение)', 'Подтверждено (с 14.10.2026)'],
    [cfS(16877), 'Снимок Kaveret: <code>products.name</code>', 'Да', T5 + ' (тогда — прежнее значение)', 'Подтверждено (с 14.10.2026)'],
    [cfS(16878), 'Логика Kaveret: <code>users.status = DELETED</code>', 'Да, <code>"1"</code>/<code>"0"</code>', 'Нет', 'Подтверждено; приём 1/0 в Selectbox не проверен'],
    [cfS(16879), 'Собственный расчёт: BLOCKED или AWAITING_BANK_TRANSFER, с семьёй; CARD_BLOCKED не учитывается', 'Да, <code>"1"</code>/<code>"0"</code>; явно в контекстах блокировки, разблокировки и отмены', 'Нет', 'Подтверждено; приём 1/0 в Selectbox и блокировка на stage не проверены'],
    [cfS(16880), 'Логика Kaveret: <code>blocked_users</code>', 'Только агентам, <code>"1"</code>/<code>"0"</code>', T5, 'Подтверждено'],
    [cfS(16881), '<code>users.created_at</code>', 'Да, <code>YYYY-MM-DD HH:mm:ss</code> без пояса', T5, 'Подтверждено; пояс открыт'],
    [cfS(16882), '<code>users.parent_id</code>', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16883), 'first_name + last_name родителя', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16884), 'Телефон родителя', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16885), 'Email родителя', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16886), '<code>related_as</code> клиента, переводы Kaveret', 'Да; иначе заглушка ' + he('לא הוזן'), EMPTY, 'Переводы подтверждены'],
    [cfS(16887), 'Собственный агент, иначе агент родителя', 'Да', T5, 'Подтверждено'],
    [cfS(16888), 'first_name + last_name агента', 'Да', T5, 'Подтверждено; только информационно'],
    [cfS(16889), 'Телефон агента', 'Да', T5, 'Подтверждено'],
    [cfS(16890), 'Email агента', 'Да', T5, 'Подтверждено'],
    [cfS(16891), 'Ментор агента', 'Да', T5, 'Подтверждено'],
    [cfS(16892), '<code>parent_agency_id</code> агента', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16893), 'Предложено: имя пользователя агентства', 'Не отправляется (<code>PENDING_CONFIRMATION</code>)', 'Нет', '<strong>Не подтверждено</strong>: источник и одобрение открыты'],
    [cfS(16894), 'Телефон пользователя агентства', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16895), 'Email пользователя агентства', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16896), 'Ментор пользователя агентства', 'Да', EMPTY, 'Подтверждено'],
    [cfS(16897), '—', 'Не отправляется (<code>NOT_USED</code>): одно значение вернулось обрезанным на 255 символах', OK + ' тест 6 (тогда отправлялось)', 'Не используется'],
    [cfS(16898), 'Адреса клиента и родителя', 'Да, читаемый текст; предварительный предел интеграции 255 кодовых точек', EMPTY + '; см. расхождение', 'Подтверждено'],
    [cfS(16899), 'Метки ролей Kaveret на иврите', 'Да, простой текст через «, » (в коде с 18.10.2026; раньше JSON)', OK + ' тест 6 (JSON): отображение подтверждено', 'Формат утверждён; ' + PEND],
    [cfS(16901), '<code>NODE_ENV</code>: development → dev, stage → stage, иначе prod', 'Да, во всех потоках; ID общий', OK + ' тест 7, опция «dev»', 'Подтверждено; «stage»/«prod» отдельно не проверены'],
    [cfS(16900), '—', 'Не отправляется', '—', 'Не используется'],
    [cfS(16987), 'Contact Us', 'Да', 'Проверено (отчёт пользователя)', 'Подтверждено'],
    [cfS(16997), 'Создание клиента', 'Да', 'Проверено (отчёт пользователя)', 'Подтверждено'],
    [cfS(16991), 'Активация, восстановление, блокировка, разблокировка', 'Да', 'Проверено (отчёт пользователя)', 'Текущее поведение кода'],
    [cfS(16995), 'Отмена ACTIVE → CANCELED', 'Да, <code>"1"</code> при отмене, иначе <code>"0"</code>', 'Подтверждено пользователем на stage', 'Подтверждено'],
    [cfS(16993), 'Собственная роль агента', 'Да, только <code>"1"</code>', 'Проверено (отчёт пользователя)', 'Подтверждено'],
    [cfS(16989), 'Только разрешённые тесты', 'Не отправляется потоками', 'Проверено (отчёт пользователя)', 'Подтверждено'],
]

const liveRows = [
    ['1', '<code>+972550824042</code> + <code>international=1</code>', 'Полный набор', '200', '«Invalid number format»', 'Отказ. Номер непригоден как тестовые данные.'],
    ['2', '<code>0540824042</code>, локальный вид', 'Полный набор', '200', '«Invalid number format»', 'Отказ. Номер непригоден как тестовые данные.'],
    ['3', '<code>0502345678</code>, локальный вид', 'Минимальный: campaign, number, name, last_name', '200', '«Customer has been added successfully»', 'Клиент создан (видно в интерфейсе).'],
    ['4', 'Тот же номер', '+ <code>crm_id</code>, <code>email</code>, верхнеуровневый <code>env</code>, изменён <code>name</code>', '200', 'Тот же текст', 'Существующий клиент обновлён, дубликата нет. Верхнеуровневый <code>env</code> проигнорирован.'],
    ['5', 'Тот же номер', '+ простые custom fields (состав — в <a href="#st-fields">разделе 8</a>); верхнеуровневый <code>env=dev</code>', '200', 'Тот же текст', 'Принято. Верхнеуровневый <code>env</code> снова проигнорирован.'],
    ['6', 'Тот же номер', 'Набор теста 5 + ' + cf(16897) + ' (361 символ / 393 байта) и ' + cf(16899) + '; ' + cf(16898) + ' пусто и не отправлялось', '200', 'Тот же текст', 'Принято; пользователь подтвердил отображение JSON.'],
    ['7', 'Тот же номер', 'Полный набор; верхнеуровневый <code>env</code> убран; добавлено ' + cf(16901) + ' = <code>dev</code>', 'Не записан', 'Не записан', 'Пользователь подтвердил в интерфейсе: опция env «dev» сохранена и отображается.']
]

const deferred = [
    ['Прочие переходы статусов (CARD_BLOCKED и AWAITING_BANK_APPROVAL → CANCELED, переход между BLOCKED и AWAITING_BANK_TRANSFER, истечение)', 'Не подключено'],
    ['Ручная активация, импорт, административная замена тарифа, создание групп, продления STO', 'Не подключено'],
    ['Fly / RDG', 'Исключены'],
    ['Очистка ' + cf(16876) + ' / ' + cf(16877) + ' после отмены', 'Не решено'],
    ['Приём ID причин 367–378 Simple API и их возврат через API v2', 'Не проверено'],
    ['Оставшиеся ветки регистрации (агент как клиент, существующий Fly-лид, карточка клиента члена семьи, нерезидент; новый родственник уходит только в модель 208 через <code>family_details</code>)', 'Не подключены'],
    ['Постоянная защита сделок от дубликатов и идемпотентность платежей', 'Отложены пользователем'],
    ['Поведение членов семьи (собственный, общий или отсутствующий телефон); в контекстах отмены, восстановления, блокировки и разблокировки — пропуск <code>FAMILY_MEMBER_PENDING_DECISION</code>', 'Отложено'],
    ['Хранение членства в кампаниях и состояния синхронизации', 'Отложено'],
    ['Операции с несколькими кампаниями', 'Не решено; ждёт ответа поддержки CallMarker'],
    ['Нейтральные обновления совмещённой карточки агент + клиент', 'Могут остановиться с <code>CLASSIFICATION_AMBIGUOUS</code>; выбор кампании отложен (подписки агентов поддерживаются, раздел 6)'],
    ['Конкурентность платежей и комиссий', 'Не решено'],
    ['Изменения профиля клиента через другие маршруты (кроме <code>PUT /user/user-data</code>, <code>PATCH /user/edit-info</code>, <code>PATCH /user/edit-agent-info</code>, <code>PUT /agent/client-info</code> (только три поля) и адреса агента)', 'Не синхронизируются'],
    ['<code>source_medium</code> / <code>source_campaign</code>', 'Не подключено'],
    ['Стандартный <code>agent_name</code> (назначение агента клиенту)', 'Не подключено'],
    ['<code>note</code>, <code>followup_*</code>, <code>funnel_id</code>, <code>campaign_funnel_id</code>, <code>reset</code>, <code>unique</code>, <code>status</code>, <code>not_interested_reason_id</code>, <code>min_hour</code>, <code>max_hour</code>, <code>blacklisted</code>, <code>duplicate_days</code>, <code>remove</code>, <code>attachment</code>', 'Не подключено'],
    ['Генерация ссылок <a href="#st-newclient">/new-client</a> со стороны CallMarker', 'Не одобрено'],
    ['Параметры встреч (<a href="#appointments">раздел 7</a>)', 'Отложено целиком'],
    ['Inbound Messages (<a href="#messages">раздел 8</a>)', 'Отложено целиком']
]


const tempRows = [
    ['Защита эндпоинта теста <code>auth</code> + <code>is:(admin or developer)</code>', '<strong>Есть</strong>: <code>start/routes/call-marker.js:9</code>, с коммита <code>ac3ecdd09</code> (12.10.2026). Исторически: 11.10.2026 была закомментирована.', '—'],
    ['Временная обработка израильских телефонов', '<strong>Активна</strong>: <code>callMarkerNumber</code> в <code>app/Utils/callMarkerCustomer.js:262</code> (<code>IL_LOCAL_TEMP</code>); используется всеми потоками', 'Решить политику телефона и закрепить или убрать временную ветку.'],
    ['Значения опций ' + cf(16901), '«dev» подтверждена тестом 7; «stage»/«prod» отдельно не проверены (комментарий в <code>callMarkerCustomer.js:451–452</code>)', 'Сверить тексты опций с настройками поля.'],
    ['Предел 255 для адреса', 'Предварительный предел интеграции только для адреса (основан на одном значении subscriptions, вернувшемся обрезанным на 255 символах). У <code>roles</code> предела в коде нет', 'Подтвердить реальные пределы полей в CallMarker.'],
    ['Данные тестовых клиентов', 'Изменены во время живых тестов', 'Восстанавливать ли их — решение пользователя. Эта документация их не меняет.']
]

const diffRows = [
    ['Возврат отмеченного флажка API v2', 'Комментарий в коде (<code>checkboxState</code>) и <code>callmarker_instructions.md</code>: отмеченный флажок возвращается текстом опции (любая непустая строка)', 'Отчёт пользователя: отмеченный флажок вернулся строкой <code>"1"</code>', 'Совместимо: код считает отмеченной любую непустую строку. Отражены оба источника.'],
    ['Описание телефона в документах API', '<code>callmarker_instructions.md</code> и контракт: «E.164 + <code>international=1</code>»', 'Код: израильские номера — локальный вид (<code>IL_LOCAL_TEMP</code>)', 'Верен код; основной текст документов API устарел.'],
    ['Сопоставление клиента', '<code>callmarker_instructions.md</code>: сопоставление по <code>crm_id</code> / номеру — открытый вопрос', 'Подтверждено пользователем: клиент определяется по номеру', 'Принято подтверждение пользователя.'],
    [cf(16898), 'Журнал в репозитории: «JSON-string fields 16897-16899» в тесте 6', 'Отчёт пользователя: в тесте 6 поле было пустым и не отправлялось', 'Принят отчёт пользователя; сейчас поле — читаемый текст.'],
    ['Причина «Invalid number format»', 'Журнал: номера 054-0/055-0 «appear to be unallocated ranges»', 'Отчёт пользователя: номера были непригодными тестовыми данными', 'Вывод ограничен двумя конкретными номерами.'],
    ['Окружение теста клиента', '<code>callmarker_instructions.md</code>: ручной тест описан для stage', 'Отчёт пользователя: тесты 1–7 выполнены в dev', 'Процедура в документе не совпадает с фактическим окружением тестов.'],
    ['Тип <code>users.passport</code>', 'Миграция <code>1573719515331</code> и <code>docs/models/users.yml</code>: <code>tinyint(1)</code>', 'Решение: отправлять номер паспорта, если он есть', 'Реальный тип колонки нужно проверить.'],
    ['Handover-документ Kaveret', 'Аудит ссылается на <code>docs/instructions/kaveret_crm_developer_handover.docx</code>', 'В репозитории API файла нет', 'Поток /new-client описан по исходному коду.'],
    ['Статус 3 в документе API', '<code>callmarker_instructions.md</code>, раздел Lifecycle checkboxes: «<code>opportunity_status=3</code> is never sent»', 'Код и раздел отмены того же документа: отмена отправляет <code>"3"</code> отдельной сделкой Not purchased', 'Верен код; фраза в документе API устарела.'],
    ['Ранее на этой странице (первая редакция 18.10.2026)', 'Отмена только из ACTIVE; ID причины и ' + 'product_field_1061 не отправляются; блокировка и разблокировка не подключены; is_blocked по снимку Kaveret (только BLOCKED); ' + cf(16899) + ' — незакоммиченное изменение', 'Коммиты <code>98ecc453f</code> и <code>dabf47e63</code> (18.10.2026)', 'Исправлено; прежние описания заменены.'],
    ['Документ API об отмене и восстановлении', '<code>callmarker_instructions.md</code>: таблица Lifecycle — «ACTIVE → CANCELED only»; раздел восстановления — CANCELED → BLOCKED «customer and is_blocked only»', 'Код и таблица блокировки того же документа: отмена также из BLOCKED / AWAITING_BANK_TRANSFER; CANCELED → BLOCKED отправляет Not purchased с причиной 367 (без сделки восстановления)', 'Верен код; формулировки документа API устарели или неоднозначны.'],
    ['Ранее на этой странице (до 18.10.2026)', 'Отмена и восстановление не реализованы, is_former_customer только <code>"0"</code>; причина <code>AGENT_MEMBERSHIP_PENDING_SUPPORT</code> при отмене не выдаётся; коллективные покупки не подключены; ' + cf(16899) + ' — JSON', 'Коммиты <code>2282e8548</code>, <code>04b1126a5</code> и рабочее дерево API (18.10.2026)', 'Исправлено 18.10.2026; исторические записи тестов сохранены.'],
    ['Ранее на этой странице', 'До 15.10.2026: сделки «только готовятся / отправка отключена», <code>product_id</code> = <code>user_subscriptions.id</code>, карточки полей без «(S)»-ID и флажков жизненного цикла, «16900 не существует»', 'Текущий код и подтверждение пользователя', 'Исправлено 15.10.2026; прежние утверждения сохранены только как исторические записи тестов.']
]

const decisions = [
    ['Реализованный поток', 'Contact Us, синхронизация пользователей и автоматические сделки (покупка, отмена, восстановление) реализованы; успешная проверка на stage подтверждена пользователем', 'Проверка в production', 'Отдельное решение'],
    ['Кампании', 'Contact Us → 13565/13558; агенты → 13567; создание клиента → 13569; покупка, восстановление, блокировка и разблокировка → 13566; отмена → 13568; тест → 13565', 'Прочие (не подключённые и ручные) переходы статусов, ручная активация других статусов; выбор кампании для нейтральных обновлений профиля совмещённой карточки агент + клиент (<code>CLASSIFICATION_AMBIGUOUS</code>, отложен)', 'Утверждать оставшиеся переходы по одному; выбор кампании для совмещённых карточек — решение бизнеса'],
    ['Несколько кампаний', 'Исторически наблюдалось (тест 14.10.2026): запись с другой кампанией переносила клиента — это риск, а не общий текущий контракт. Собственные (не AGENT) подписки агентов (<code>agent</code> / <code>insurance_agent</code>) поддерживают покупку, отмену, блокировку, разблокировку и восстановление: кампания события — 13566, при отмене 13568; <code>is_agent</code> и все прежние активные членства сохраняются и проверяются после записи; перенос или изменение членства — результат «не подтверждено», без автоматического исправления и повтора; <code>unique</code> запрещён', 'Нейтральные обновления совмещённой карточки агент + клиент могут остановиться с <code>CLASSIFICATION_AMBIGUOUS</code>', 'Выбор кампании отложен (решение бизнеса)'],
    ['Флажки жизненного цикла', 'Реализованы; поведение API проверено (отчёт пользователя)', 'Правило замены неясных флажков при покупке, отмене и восстановлении', 'Отдельно утвердить'],
    ['Сделки', 'Покупка, отмена (Not purchased с ID причины), блокировка (Not purchased, 367), восстановление (Purchased, ' + he('שחזור מנוי') + ') и разблокировка (Purchased, ' + he('הוסדר תשלום') + ') отправляются автоматически; защита от открытой сделки — для всех, кроме покупки; проверка после записи', 'Защита от дубликатов и идемпотентность платежей (отложены); создание без agent_name; приём ID причин', 'Решение команды; ' + PEND],
    ['Причины Not purchased', 'Отмена — по точному проверенному запросу, иначе 378; блокировка — 367; один каталог аккаунта', 'Приём 367–378 Simple API и возврат через API v2', PEND],
    [cf(16899), 'Согласован простой текст через «, »; в коде с 18.10.2026', 'Развёртывание и живая проверка не подтверждены', PEND],
    ['Активный продукт после отмены', cf(16876) + ' / ' + cf(16877) + ' пропускаются, а не очищаются', 'Способ очистки', 'Согласовать и проверить'],
    ['Агенты сделок', 'Name сопоставляется (вживую подтверждено для «Yuval Kopel REP»); допустимо и CRM Name, но через API v2 его не проверить; неизвестное имя оставляет назначение пустым', 'Заполнение <code>users.callmarker_agent_name</code> для всех поставщиков', 'Настройка администратором'],
    ['Идентификация клиента', 'Ключ — номер; <code>crm_id</code> справочный', 'Смена телефона; общий телефон', 'Бизнес-решение'],
    ['Члены семьи; членство и состояние синхронизации', 'Отложено, кроме создания нового родственника (<code>family_details</code>; подтверждено пользователем на stage 26.10.2026)', 'Приглашения, изменения, удаления, дозаливка; смена телефона; сделки членов семьи (family_details их не подключает)', 'Решение позже'],
    ['Платежи', 'Последовательные повторные колбэки подавляются; параллельные — нет', 'Идемпотентность платежей и комиссий', 'Не воспроизводить колбэки как тест'],
    ['Формат телефона', 'Израильский локальный вид без флагов принят', 'E.164 с валидным номером; иностранные номера', 'Отдельно разрешённый тест'],
    ['Selectbox и даты', 'is_deleted/is_blocked отправляются 1/0; env «dev» подтверждена', 'Приём 1/0; «stage»/«prod» (birthday DD-MM-YYYY подтверждён)', 'Контролируемые проверки'],
    ['Поток /new-client', 'Создание клиента агентом синхронизируется (13569)', 'Генерация ссылок со стороны CallMarker', 'Решение команды'],
    ['Встречи и сообщения', 'Отложены', '—', 'Отдельная задача']
]

module.exports = () => `
<section id="status" class="status-page">
<h2>CallMarker: состояние интеграции и открытые вопросы</h2>
<p class="meta-line">Сводка на 18.10.2026. Реализация — по чтению текущего кода репозитория API; живые тесты — по отчётам пользователя и журналу в <code>callmarker_instructions.md</code> (здесь не воспроизводились); триггеры Kaveret — по аудиту <code>docs/audits/kaveret-flow-scan-2026-10-07.md</code>; поток /new-client — по исходному коду frontend и API.</p>
<div class="legend status-legend">
  <div>${T.impl} есть в коде сейчас.</div>
  <div>${T.live} подтверждено запросом к CallMarker.</div>
  <div>${T.dec} решение заказчика (может быть ещё не реализовано).</div>
  <div>${T.open} нет ответа или нет проверки.</div>
  <div>${T.next} рекомендация, ничего не сделано.</div>
  <div>${T.exist} действующий поток Mediwho, не связанный с CallMarker.</div>
  <div>${T.lim} пользователь решил оставить как есть.</div>
</div>
<nav class="subtoc" aria-label="Разделы сводки"><strong>В этой сводке:</strong> ${SUB.map(([id, t]) => `<a href="#${id}">${t}</a>`).join(' · ')}</nav>

<div class="callout"><strong>Сетевая политика (с 02.11.2026): CallMarker — только production.</strong> Любой запрос в CallMarker — запись Simple API (клиенты; <code>number_change</code> и <code>family_details</code> через external-change) и чтение API v2 (поиск карточки, сверка после записи, проверка сделок и членств) — разрешён <strong>только</strong> при точных сырых значениях <code>NODE_ENV=production</code> <strong>и</strong> <code>CALLMARKER_ENABLED=true</code> (<code>callMarkerNetworkAllowed()</code> в <code>app/Utils/callMarkerAccess.js</code>, строгое сравнение <code>process.env</code>). Отсутствующее или любое другое значение выключает CallMarker; <strong>по умолчанию выключено</strong>. <code>NODE_ENV=prod</code>, <code>test</code> или отсутствующий <code>NODE_ENV</code> CallMarker <strong>не</strong> разрешают (хотя сопоставление полей читает их как prod), как и <code>CALLMARKER_ENABLED</code> = <code>1</code> / <code>TRUE</code>.</div>
${table(['Окружение', '<code>NODE_ENV</code>', '<code>CALLMARKER_ENABLED</code>', 'Запросы в CallMarker'], [
    ['Production', '<code>production</code>', '<code>true</code>', 'Да; нужны также два существующих токена (значения здесь не приводятся)'],
    ['Stage', '<code>stage</code>', '<code>false</code>', 'Нет; даже <code>CALLMARKER_ENABLED=true</code> не включает stage'],
    ['Локально', '<code>development</code>', '<code>false</code>', 'Нет']
])}
${li([
    ['impl', 'Проверка стоит в начале каждого автоматического потока (Contact Us, все контексты синхронизации, <code>family_details</code>, <code>number_change</code>, правка админом) и ещё раз в транспорте (<code>postSimple</code>, <code>listV2</code>, <code>getV2Customer</code>). Выключено → <code>{ skipped: true, reason: \'CALLMARKER_DISABLED\' }</code> и одна строка журнала: без чтения токена, поиска, записи, проверки, письма-оповещения и повторов.'],
    ['impl', 'Изменение настройки вступает в силу только после перезапуска или повторного развёртывания процесса. Выключить CallMarker в production — <code>CALLMARKER_ENABLED=false</code> (или удалить переменную).'],
    ['impl', 'Stage-идентификаторы custom fields и кампания 13565 остаются для пробных запусков, мок-тестов и исторических записей; сетевого доступа со stage у приложения сейчас нет. Подтверждения пользователя на stage ниже датированы и сделаны <strong>до</strong> этой политики.'],
    ['impl', 'Kaveret работает по своему прежнему правилу (production — любой <code>NODE_ENV</code>, кроме <code>development</code> и <code>stage</code>); новая строгая проверка CallMarker его классификацию окружения не меняла. Выключенный CallMarker в production не выключает доставку Contact Us в Kaveret.'],
    ['open', 'Включение production (настройка, развёртывание, живая проверка) этой документацией не подтверждается: здесь описан только код.']
])}
<h3 id="st-scope">1. Рамки интеграции и триггеры</h3>
${li([
    ['dec', 'Kaveret постепенно заменяется на CallMarker. MyBusiness продолжает использоваться.'],
    ['impl', 'Реализованы: Contact Us (сайт и приложение); полные синхронизации при регистрации агента, создании клиента на сайте и агентом и адресе агента; активация личной подписки с <strong>автоматической сделкой Purchased</strong>; отмена (ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED, отдельная Not purchased с ID причины); восстановление; блокировка и разблокировка; нейтральное обновление профиля (<code>PUT /user/user-data</code>, <code>PATCH /user/edit-info</code>, <code>PATCH /user/edit-agent-info</code>); ограниченные обновления (<code>PUT /agent/client-info</code>, <code>PATCH /user/update-hmo-plans</code>, <code>PATCH /registration/hmo</code>, <code>PUT /registration/user</code>, ветки существующего пользователя <code>POST /registration</code>, <code>PATCH /user/add-client-email</code>, <code>POST /address</code> CLIENT); переназначение агента, блокировка агента и удаление пользователя; смена телефона (<code>number_change</code>); новый родственник (<code>family_details</code>); создание отсутствующей карточки полным маппингом. Kaveret не заменён.'],
    ['live', 'Подтверждено пользователем на stage (общие подтверждения без ID, журналов и результатов по отдельным случаям): обычная отмена и восстановление; <code>family_details</code>, <code>PUT /user/admin/change-phone</code>, <code>PATCH /user/edit-agent-info</code>, <code>PUT /agent/client-info</code>, <code>PATCH /user/update-hmo-plans</code>, <code>PATCH /registration/hmo</code>, <code>PUT /registration/user</code>, <code>POST /registration</code> (ветки существующего пользователя), <code>PATCH /user/add-client-email</code>, <code>POST /address</code> CLIENT, формат birthday, father’s name и HMO — 26.10.2026; создание отсутствующей карточки (аудит переноса в api-prod, 26.10.2026); причина 371 (<code>CUSTOMER_REQUEST</code>). Production не проверялся.'],
    ['open', 'Не подключены: прочие переходы статусов, ручная активация других статусов, другие маршруты изменения профиля и телефона, оставшиеся ветки регистрации, карточки и изменения родственников, Fly/RDG. Живая проверка не выполнена; сетевой доступ со stage отключён текущей политикой: переназначение и блокировка агента, удаление пользователя, коллективная покупка, ID причин кроме 371 и другие пункты раздела 7.']
])}
<p>Инвентаризация событий снимка клиента в Kaveret (<code>Event.fire('kaveretSetDataBeforeSend::user', id, KAVERET_UPD_KEYS.*)</code>). Источник: аудит <code>docs/audits/kaveret-flow-scan-2026-10-07.md</code>, раздел 3 (базовый коммит <code>81a30af</code>); ссылки <code>файл:строка</code> сверены с кодом 11.10.2026. Пути — относительно <code>app/Controllers/Http/</code>, кроме <code>Agent/</code>, <code>Modules/</code> и <code>Services/</code>, которые лежат в <code>app/</code>.</p>
${table(['Событие Kaveret', 'Где вызывается', 'Kaveret сейчас', 'CallMarker'], triggers)}
<p class="note">По аудиту: события асинхронные, отправка в Kaveret идёт только в prod, очереди, повторов и записи о доставке нет; каждое событие отправляет текущий снимок пользователя. Потоки заявок и файлов (<code>saveRequestToKaveret::user</code>) к клиентской интеграции не относятся. Contact Us — не событие снимка: это отдельный лид (раздел 2).</p>

<h3 id="st-contactus">2. Contact Us: сайт и приложение +60</h3>
<div class="callout">${T.impl} <strong>Подключено.</strong> Два входа используют одно событие: <code>callmarker::contactUs</code> → <code>CallMarkerListener.contactUs</code> (<code>app/Listeners/CallMarkerListener.js</code>, регистрация в <code>start/events.js:88</code>) → <code>CallMarker.processContactUs</code> (<code>app/Modules/CallMarker.js</code>). Контроллеры — <code>KaveretController.kaveretContactUs</code> и <code>kaveretContactUsApp</code>; ветка Kaveret — существующий <code>app/Modules/Kaveret.js</code>. Это отличается от теста клиента: Contact Us отправляет только минимальный лид с флагами <code>source</code> и <code>ignore_duplicates</code>, а тест клиента — полное отображение без этих флагов.</div>
${table(['Origin', 'Вход и защита', 'Входные данные', 'CallMarker <code>source</code>', 'Kaveret (только production)'], contactEntry)}
<p><strong>Ответы клиенту</strong> — до завершения доставки в CRM:</p>
${table(['Ситуация', 'Ответ'], contactResponses)}
<p><strong>Минимальный запрос в CallMarker</strong> (form-urlencoded, тот же транспорт <code>sendCustomer</code>):</p>
${table(['Поле', 'Значение'], contactPayload)}
<p class="note">Не отправляются: <code>crm_id</code>, <code>email</code>, <code>birthday</code> и custom fields полного клиента; данные из базы не читаются. Пример — в <a href="#examples">разделе 12</a> справочника.</p>
<p><strong>Окружения:</strong></p>
${table(['<code>NODE_ENV</code>', 'CallMarker', 'Kaveret', 'Письмо-оповещение'], contactEnv)}
${li([
    ['impl', 'В production с <code>CALLMARKER_ENABLED=true</code> обе CRM вызываются <strong>параллельно и независимо</strong>: сбой одной не мешает другой. Тайм-аут — 15 с на каждую, <strong>без повторов</strong>.'],
    ['impl', 'Успех CallMarker — только статус 2xx <strong>и</strong> точный текст «Customer has been added successfully». HTTP 200 сам по себе успехом не считается. Текст успеха одинаков при создании и обновлении. При тайм-ауте доставка неопределённа.'],
    ['impl', 'При ошибке любой CRM или дубликате — <strong>одно</strong> общее письмо на заявку пользователю с ID 84 (<code>send::emailListener</code>, тип <code>CallMarker</code>): имя и фамилия, присланный и исходящий номер, origin и source, окружение, ID и название кампании (например, <code>13565 (בדיקות)</code>), время в Asia/Jerusalem и UTC, по каждой CRM — результат, HTTP-статус, тело ответа (до 500 символов, токен вырезан) и объяснение. Все значения в HTML экранируются; в теме письма нет данных клиента. В логах только CRM, причина и статус.']
])}
${table(['Причина в письме', 'Объяснение'], reasons)}
<p><strong>Принятые ограничения</strong> (пользователь решил их не менять):</p>
${li([
    ['lim', 'Обработка события идёт в том же процессе, это не надёжная очередь: перезапуск до доставки теряет лид без оповещения.'],
    ['lim', 'Сбой отправки события только пишется в лог, запасного письма нет.'],
    ['lim', 'Существующий <code>EmailListener</code> не проверяет статусы доставки, которые возвращает почтовый провайдер (и отправляет письма только на stage и в production).'],
    ['lim', 'Отправка оповещения не доказывает, что письмо дошло до почтового ящика.']
])}
<p><strong>Состояние проверки:</strong></p>
${li([
    ['live', 'Сайт: тестирование на stage подтверждено пользователем; работа всего развёрнутого потока на stage подтверждена пользователем в целом. Отдельные результаты не передавались.'],
    ['open', 'Отдельная контролируемая проверка Contact Us из приложения +60 на stage в документах не описана.'],
    ['impl', 'Мок-тесты, запущенные мной 15.10.2026 (без сети, БД и <code>.env</code>): Contact Us — 34 из 34, тест клиента — 43 из 43, синхронизация пользователей — 67 из 67, активация подписки — 17 из 17.']
])}

<h3 id="st-newclient">3. Существующий поток mediwho.com/new-client (контекст миграции)</h3>
<div class="callout"><strong>${T.exist} Это ДЕЙСТВУЮЩИЙ поток Mediwho, который нужно оценить при миграции.</strong> Это не реализованный поток CallMarker: генерация ссылок со стороны CallMarker и подключение к этому пути <strong>не одобрены и не реализованы</strong>. Handover-документ Kaveret, на который ссылается аудит, в репозитории отсутствует, поэтому описание составлено по исходному коду: frontend (<code>/Users/Danil/WebstormProjects/frontend</code>, коммит <code>0b94d80c9</code>) и API.</div>
<p>Синтетический пример ссылки с повторяющимися <code>?</code> (данные вымышлены):</p>
<pre>https://mediwho.com/new-client?isNewClient=1?first_name=%D7%93%D7%A0%D7%94?last_name=%D7%9C%D7%95%D7%99?phone=0501234567?identity=012345674?birthday=17/05/1990?email=dana.levi@example.test</pre>
<p>Та же ссылка с обычными разделителями: <code>…/new-client?isNewClient=1&amp;first_name=…&amp;last_name=…&amp;phone=0501234567&amp;identity=012345674&amp;birthday=17/05/1990&amp;email=dana.levi@example.test</code>. Frontend разбирает обе формы одинаково. Входящие параметры: <code>first_name</code>, <code>last_name</code>, <code>phone</code>, <code>identity</code>, <code>birthday</code>, <code>email</code>, <code>isNewClient</code>. Дату рождения API ожидает в формате <code>dd/MM/yyyy</code>.</p>
${table(['Шаг', 'Что происходит (по коду)'], newClientSteps)}
<p class="note">Наблюдения для миграции: в маршруте <code>agent/reg-non-resident-client</code> (<code>start/routes/agent.js:72</code>) middleware не объявлен. Персональные данные (identity, телефон, email) передаются в адресе ссылки и могут оседать в истории браузера и логах. Как ссылку формирует Kaveret, по репозиторию не видно.</p>
${li([
    ['impl', 'Создание нового клиента агентом (ветка <code>regNewClient</code> в <code>AgentController.regClient</code>) теперь отправляет <code>callmarker::syncUser</code> с контекстом <code>AGENT_CUSTOMER_CREATION</code> (<code>AgentController.js:1751</code>) → кампания 13569. Остальные ветки этого пути (агент как клиент, существующий Fly-лид, нерезидент) не подключены.'],
    ['open', 'Генерация ссылок /new-client со стороны CallMarker не одобрена. Если её введут: повторяющиеся <code>?</code> работают только благодаря собственному разбору frontend; формат нужно согласовать.']
])}

<h3 id="st-flow">4. Тестовый эндпоинт клиента</h3>
${li([
    ['impl', '<code>POST /call-marker/test/customer</code> с <code>user_id</code> и <code>dry_run</code> (по умолчанию — пробный запуск); защищён <code>auth</code> + <code>is:(admin or developer)</code>; в production — 404. Вне production живая отправка запрещена сетевой политикой (<code>403 CALLMARKER_DISABLED</code> до чтения токена), <code>CALLMARKER_TEST_ENABLED=true</code> её не обходит; пробный запуск доступен. Описанные ниже живые тесты — исторические, сейчас недоступны.'],
    ['impl', 'Файлы: <code>CallMarkerController.js</code> (HTTP-проверки, пробный запуск, условия живой отправки), <code>app/Modules/CallMarker.js</code> (<code>loadCustomer</code> — чтение пользователя и связанных записей; <code>sendCustomer</code> — HTTP-отправка), <code>app/Utils/callMarkerCustomer.js</code> (чистое отображение). <code>CONTRACT_FIELDS</code> (бывший <code>ALLOWED_FIELDS</code>) описывает контракт и сверяется тестом, но не фильтрует поля во время выполнения.'],
    ['impl', 'Кампания — всегда <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (<code>13565</code>); ни окружение, ни параметр запроса её не меняют. <code>CALLMARKER_TEST_CAMPAIGN_ID</code> — историческая переменная.'],
    ['impl', 'Пробный запуск возвращает предпросмотр: <code>fields</code>, <code>omitted</code> с причинами, <code>warnings</code>, <code>ambiguities</code>, <code>phone</code>, <code>config_complete_for_live</code>. Этот флаг оставлен для совместимости и равен <code>Boolean(campaign)</code>: он отражает только наличие кампании (сейчас всегда <code>true</code>) и <strong>не</strong> означает готовность к живой отправке.'],
    ['impl', 'Живая отправка — POST в Simple Customers API (<code>https://app.callmarker.com/api/simple/customers</code>, form-urlencoded, тайм-аут 15 с, без повторов). Ответ: HTTP-статус и тело CallMarker как есть, <code>creation_confirmed: false</code>.']
])}
${table(
    ['Защита', 'Код', 'Состояние'],
    [
        ['Аутентификация и роль <code>auth</code> + <code>is:(admin or developer)</code>', '<code>start/routes/call-marker.js:9</code>', 'Включена.'],
        ['Блокировка в production', '<code>CallMarkerController.js:31</code>', 'При <code>NODE_ENV</code> → prod ответ 404.'],
        ['Проверка <code>user_id</code> / <code>dry_run</code>', 'строки 36, 39', '400.'],
        ['Включение живого теста', 'строка 76', 'Сначала сетевая политика (иначе <code>403 CALLMARKER_DISABLED</code>), затем <code>CALLMARKER_TEST_ENABLED</code> = <code>true</code> (иначе 403); вместе живой режим сейчас недоступен.'],
        ['Неоднозначные исходные данные', 'строка 79', '409 <code>AMBIGUOUS_SOURCE_DATA</code>.'],
        ['Токен', 'строка 83', 'Без него 503 <code>CALLMARKER_NOT_CONFIGURED</code>.'],
        ['Секрет в ответах и логах', '<code>CallMarker.sendCustomer</code>', 'Токен добавляется только при отправке; эхо в ответе заменяется на <code>[REDACTED]</code>; в логах только коды ошибок.']
    ]
)}

<h3 id="st-ident">5. Идентификация клиента и кампании</h3>
${li([
    ['dec', 'CallMarker определяет клиента <strong>по номеру телефона</strong>.'],
    ['dec', '<code>crm_id</code> хранит <code>users.id</code> как справочную информацию. Другой номер с тем же <code>crm_id</code> создаёт ещё одну строку CRM (подтверждено пользователем; в записанных тестах не проверялось).'],
    ['dec', 'Обновление данных клиента через одну кампанию меняет общие данные клиента и в других кампаниях (подтверждено пользователем). Переносить это на статусы и назначения агентов, которые относятся к конкретной кампании, без доказательств нельзя.'],
    ['live', 'Повторная отправка с тем же номером обновила существующего клиента в кампании 13565, дубликат не появился (тест 4; тесты 5–7 шли на тот же номер).'],
    ['live', 'С <code>ignore_duplicates=1</code> CallMarker ответил «Duplicate customer» для номера, который уже был в <strong>другой</strong> кампании (отчёт пользователя). Значит, проверка дубликатов не обязательно ограничена целевой кампанией; это не доказывает, что клиент не может состоять в нескольких кампаниях.'],
    ['impl', 'Флаг <code>ignore_duplicates</code> явно задаётся только в Contact Us; тест клиента его не отправляет, глобально к запросам он не добавляется. Собственной защиты от дубликатов и повторов в коде нет.'],
    ['open', 'Смена телефона и общий номер — открытые вопросы; поведение членов семьи отложено.']
])}

<h3 id="st-lifecycle">6. Синхронизация, кампании и флажки жизненного цикла</h3>
${li([
    ['impl', 'Событие <code>callmarker::syncUser</code> → <code>CallMarkerListener.syncUser</code> → <code>CallMarker.processUserSync</code> (<code>start/events.js:89</code>). Работает на stage и в production; в development автоматической внешней отправки нет. Очередь по пользователю — в памяти одного процесса Node, не между подами; каждый запуск заново читает данные MediWho. Клиент сначала ищется через read-only API v2 (по номеру и <code>crm_id</code>); при конфликте (<code>CRM_ID_CONFLICT</code>, <code>PHONE_CHANGED</code>, <code>MULTIPLE_MATCHES</code> и др.) ничего не пишется и пользователю 84 уходит письмо. Затем один POST Simple API без <code>ignore_duplicates</code>, <code>unique</code>, <code>remove</code>, <code>reset</code>; тайм-аут оставляет результат неопределённым, повторов нет.'],
    ['live', 'Работа развёрнутого потока на stage подтверждена пользователем в целом; проверки в production не было.']
])}
<p><strong>Контексты синхронизации</strong> (сверено с кодом API 18.10.2026):</p>
${table(['Контекст', 'Где срабатывает и исключения', 'Кампания (stage и production)', '<code>source</code>'], syncContexts, 'extable')}
<p><strong>Маршрутизация по окружениям:</strong></p>
${table(['Поток', 'stage', 'production'], routing)}
<p class="note">development: автоматической внешней отправки нет (только мок-тесты). Custom fields: dev/stage используют «(S)»-ID, production — исходные; env — общий ${cf(16901)}. Эти наборы <strong>не</strong> изолируют стандартные данные клиента и реальное членство в кампаниях: клиент сопоставляется по номеру, и запись со stage может изменить клиента, которого использует production.</p>
<p><strong>Флажки жизненного цикла</strong> (Checkbox; значения <code>"1"</code>/<code>"0"</code>):</p>
${table(['Флажок (production)', 'dev/stage', 'Кто ставит'], lifeFlags)}
${li([
    ['impl', 'Одновременно ставится один обычный флажок жизненного цикла (is_lead, is_registered_without_subscription, is_customer, is_former_customer): выбранный — <code>"1"</code>, остальные три — <code>"0"</code>. is_agent независим и может сочетаться с состоянием клиента.'],
    ['impl', 'is_test ставят только явно разрешённые тестовые скрипты; обычные потоки его не отправляют независимо от окружения и кампании.'],
    ['impl', 'Регистрация и Contact Us только повышают состояние и сохраняют более продвинутую или неоднозначную классификацию. Регистрация и адрес агента не придумывают личный статус клиента.'],
    ['impl', 'Покупка, восстановление, блокировка и разблокировка устанавливают is_customer, отмена — is_former_customer, заменяя в том числе неясные и противоречивые флажки. Это <strong>текущее поведение кода</strong>, а не отдельно утверждённая политика.'],
    ['live', 'Подтверждено пользователем на stage: обычная отмена перевела клиента в 13568, поставила is_former_customer(S) = <code>"1"</code>, сняла is_customer(S), is_lead(S) и is_registered_without_subscription(S) и не изменила is_agent(S) и is_test(S). Проверка всех трёх точек входа отмены этим не подтверждена.'],
    ['live', 'Проверено (отчёт пользователя): <code>fields[customers]</code> работает с <code>include=custom_fields&amp;custom_fields_format=map</code>; отмеченный флажок вернулся строкой <code>"1"</code>, снятый — <code>null</code>; отправка <code>"0"</code> снимает флажок; тест «лид → зарегистрирован → клиент» сохранил флажки production, агента, тестовые отметки и env.']
])}
<p><strong>Правила кампаний и их состояние:</strong></p>
${table(['Событие', 'Кампания', 'Флажок', 'Состояние'], lifecycle)}
${li([
    ['live', 'Живой тест 14.10.2026 (клиент 24625344, POST с <code>campaign=13567</code> без <code>unique</code>): Simple API <strong>перенёс</strong> клиента в новую кампанию, а не добавил вторую. Поэтому запись синхронизации может вывести клиента из прежней кампании.'],
    ['open', 'Как добавить существующего клиента во вторую кампанию без переноса — вопрос к поддержке CallMarker. Собственные подписки агентов теперь пишутся без <code>unique</code>: членства сохраняются и проверяются после записи (раздел 6).'],
    ['open', '<code>unique</code> — <strong>не</strong> общее решение для переводов: он может удалить клиента из кампании агентов.'],
    ['open', 'Хранение членства в кампаниях и состояния синхронизации отложено; кампанию нельзя вывести из одного снимка статусов.']
])}

<p><strong>Чтение членства в кампаниях и клиента по ID через API v2</strong> (только чтение):</p>
${li([
    ['live', 'Проверено вживую: <code>GET /api/v2/customers</code> с <code>include=custom_fields,campaign_customers</code>, <code>fields[customers]=id,name,number,email,crm_id</code> и <code>custom_fields_format=map</code> работает. Активные членства встраиваются как <code>campaign_customers[]</code>: ID членства, <code>campaign_id</code>, <code>status</code>/<code>status_name</code> и <code>disabled</code>; названия кампаний не встраиваются. Встраиваются только активные членства в неудалённых кампаниях.'],
    ['live', 'Активные и отключённые членства с названиями кампаний читаются отдельно: <code>GET /api/v2/campaign-customers</code> с <code>filter[customer_id]={id}</code>, <code>filter[disabled]=0,1</code>, <code>include=campaign</code> и <code>fields[campaign]=id,name</code>.'],
    ['live', 'Waiting — статус клиента внутри кампании, а не активность самой кампании. <code>updated_at</code> членства сам по себе не доказывает точное время удаления из кампании.'],
    ['open', 'По обновлённой спецификации API изменения членства и custom fields не меняют <code>updated_at</code> клиента (отдельно не проверялось), поэтому по нему такие изменения не обнаружить.'],
    ['impl', 'В коде (коммит <code>ad3939070</code>, далее перенесено в api-prod/stage): поиски API v2 встраивают <code>campaign_customers</code>. Членства используются: нейтральные и ограниченные обновления пишут в существующее членство кампании по классификации пользователя и сверяют полный набор членств после записи; создание карточки проверяет итоговые членства. Перенос в api-prod/stage (коммит <code>cf19603ff</code>, 26.10.2026) не означает развёртывания и проверки в production.'],
    ['live', 'Проверено вживую чтение по внутреннему ID CallMarker без параметров <code>number</code> и <code>crm_id</code>: <code>GET /api/v2/customers/24622736</code> с <code>include=custom_fields,campaign_customers</code> и <code>custom_fields_format=map</code> вернул один объект клиента с обоими include.'],
    ['open', 'Документированная альтернатива — <code>GET /api/v2/customers?filter[id]=24622736&amp;include=custom_fields,campaign_customers&amp;custom_fields_format=map</code>; вживую не проверялась. <code>filter[number]</code> — поиск по телефону: значение 24622736 вернуло пустой список.'],
    ['open', 'Это возможности чтения API v2. Они не подтверждают, что Simple API умеет писать по ID вместо телефона, и не означают, что запись сохраняет несколько кампаний: в тесте 14.10.2026 запись с другой кампанией переносила клиента. Поэтому потоки агентов проверяют членства после записи (раздел 6).']
])}

<p><strong>Профиль и админское редактирование</strong></p>
${li([['impl', "PUT /user/user-data и PATCH /user/edit-info отправляют полный свежий маппинг после сохранённых изменений; fathers_name включён. Админское редактирование отправляет событие после шагов сохранения, в том числе при частичном сбое после успешной записи. Телефон меняется отдельным number_change перед профилем; профиль продолжается после подтверждения телефона (либо обработки изменения только формата). Существующая привязанная карточка обновляется; доказанно отсутствующая создаётся полным маппингом (см. ниже); профили членов семьи отложены. Lifecycle-флаги, source и Opportunity не отправляются. Кампания по классификации: собственная роль агента → 13567; личная ACTIVE/BLOCKED/AWAITING_BANK_TRANSFER → 13566; иначе CANCELED → 13568; иначе 13569. Нужно ровно одно существующее подходящее членство; другие членства допустимы; агент с членствами обеих подходящих классификаций остаётся неоднозначным. Сверка проверяет идентичность, отправленный email, шесть флагов и полный набор ID членств/кампаний; имена, birthday, fathers_name и HMO не сравниваются. Изменения обнаруживаются, но не откатываются; автоповтора нет. Birthday, fathers_name и названия HMO без ID подтверждены пользователем на stage 26.10.2026; это не доказательство по каждой ветке или production."]])}<p class="note">Доступность customer custom fields: браузерный runner включил Use in all campaigns у всех 75 существовавших тогда полей и повторно открыл все 75 для проверки. Это подтверждение настройки аккаунта, а не записи через API; добавленные позднее поля 17022/17023 отдельно подтверждены пользователем на stage.</p>
<p><strong>Админское редактирование агента</strong> (<code>PATCH /user/edit-agent-info</code>):</p>
${li([
    ['impl', '<code>UserController.editAgentInfo</code> (admin или money; admin-panel → страница агента → окно <code>EditAgentInfo</code>) использует то же единственное событие <code>callmarker::adminUserEdit</code> и ту же задачу в очереди пользователя (<code>processAdminUserEdit</code> → <code>runAdminUserEdit</code>), что и <code>PATCH /user/edit-info</code>. Событие уходит один раз, после того как завершились шаги обработчика (сохранение пользователя, STO, приглашение, старая CRM, Kaveret), в том числе если после успешного сохранения следующий шаг ответил 400 или выбросил ошибку. Не уходит при 404, ошибке проверки и неудачном сохранении пользователя.'],
    ['impl', 'Триггер — сохранённое администратором изменение <code>first_name</code>, <code>last_name</code>, <code>identity</code> или <code>email</code>: после записи отправляется полный свежий нейтральный маппинг (<code>ADMIN_PROFILE_UPDATED</code>), перечитанный из базы, а не тело запроса. Настоящая смена телефона — отдельный <code>number_change</code>; данные профиля отправляются только после подтверждения телефона на той же карточке или если он уже применён. Смена только формата номера <code>number_change</code> не вызывает.'],
    ['impl', 'Не вызывают синхронизацию: запросы роли money, изменения только STO (<code>sto_id</code>, <code>sto_status</code>, <code>terminal_name</code>), только <code>agency_id</code>, сохранение без изменений.'],
    ['impl', 'Кампания — существующее членство по классификации пользователя (собственная роль агента → 13567), затем сверка набора членств; флажки жизненного цикла, <code>source</code> и сделки не отправляются. Члены семьи по-прежнему откладываются. Проверка: <code>IDENTITY_EXIST</code> / <code>EMAIL_EXIST</code>, <code>PHONE_INVALID</code>, <code>PHONE_EXIST</code> (в любой эквивалентной форме) — в одном ответе 400 <code>{ errorArray }</code>; телефон хранится так, как отправлен.'],
    ['live', 'Подтверждено пользователем на stage 26.10.2026 («after check stage -> checked, work clean»). Это общее подтверждение: ID, журналы и результаты отдельных случаев не передавались; production не проверялся.'],
    ['open', 'Ограничения: «ожидает подтверждения» или «результат неизвестен» по телефону останавливают отправку данных (одно письмо, без повтора); постоянного состояния, автоповтора и отложенной сверки нет; имена при сверке не сравниваются. Известная несогласованность реализации: блок приглашения берёт личные поля из тела запроса для любой роли, поэтому запрос роли money с такими полями меняет приглашение, хотя строка пользователя не сохраняется; CallMarker это игнорирует.'],
    ['open', '<code>PUT /agent/client-info</code> подключён отдельно, только для трёх полей (см. блок ниже).']
])}

<p><strong>Данные клиента от агента</strong> (<code>PUT /agent/client-info</code>, <code>AGENT_CLIENT_PROFILE_UPDATED</code>):</p>
${li([
    ['impl', '<code>AgentController.updateClientInfo</code> (сайт → клиент агента → окно HMO). Разрешено только для клиента самого агента или клиента, чей родитель принадлежит этому агенту (сравниваются сохранённые <code>agent_id</code>); иначе 403/404, как раньше, до любых записей и событий.'],
    ['impl', 'После успешного сохранения учитываются только изменённые <code>hmo_id</code>, <code>hmo_plan_id</code> и <code>fathers_name</code>; событие уходит одно, в <code>finally</code> обработчика. Отправляются только изменённые непустые значения: HMO — ' + cf(16874) + ' (stage — <code>custom_field_16957</code>), план — ' + cf(16875) + ' (stage — <code>custom_field_16958</code>), имя отца — <code>custom_field_17022</code> (stage — <code>custom_field_17023</code>).'],
    ['impl', 'HMO и план — только названия на иврите из каталога, без ID; неизвестный ID пропускается с диагностикой. Имя отца берётся из собственной записи редактируемого пользователя, с обрезкой пробелов. Пустые значения не очищают значения в CRM; если отправлять нечего — ни поиска, ни POST.'],
    ['impl', 'Обязательные <code>number</code> и <code>campaign</code> — от существующей привязанной карточки и её подходящего существующего членства. Полный маппинг клиента, флажки жизненного цикла, <code>source</code> и сделки не отправляются. Члены семьи по-прежнему откладываются (<code>FAMILY_PROFILE_PENDING_DECISION</code>).'],
    ['impl', 'Если тот же запрос сохранил настоящую смену телефона, синхронизация блокируется (<code>PROFILE_PHONE_CHANGE_UNCONFIRMED</code>, одно письмо); этот маршрут <code>number_change</code> не отправляет. Если исходное значение не удалось прочитать или его нет, CallMarker пропускается (<code>AGENT_CLIENT_BASELINE_READ_FAILED</code> / <code>AGENT_CLIENT_BASELINE_MISSING</code>), а сама бизнес-операция выполняется как раньше.'],
    ['live', 'Подтверждено пользователем на stage 26.10.2026 («checked in stage, work clean»). Это общее подтверждение: ID, журналы и результаты отдельных случаев не передавались; production не проверялся.'],
    ['open', 'Сверка после записи проверяет идентичность карточки, членства и флажки; сами три значения автоматически не сравниваются. Не проверено отдельно, оставляет ли POST без <code>name</code>/<code>email</code> эти поля без изменений. Постоянного состояния, автоповтора и дедупликации нет. Неограниченный <code>user.merge</code> в обработчике — существующее ограничение, не исправлено.'],
    ['open', '<code>GET /agent/clients</code>: параметр запроса может подменить ID агента — отдельная отложенная проблема безопасности вне миграции CallMarker, не исправлена.']
])}

<p><strong>Ограниченные обновления</strong> (общий нейтральный конвейер: свежая загрузка, очередь пользователя, проверки API v2, существующее членство по классификации, сверка членств и флажков, приватные письма; только изменённые непустые поля из списка контекста, пустые значения не очищают CRM):</p>
${table(['Маршрут и контекст', 'Кто может', 'Поля', 'Подтверждение'], [
    ['<code>PATCH /user/update-hmo-plans</code>, <code>ADMIN_HMO_PLANS_UPDATED</code>', 'admin / moderator / editor / developer (без изменений)', 'HMO, план — названия на иврите', 'Пользователь, stage, 26.10.2026'],
    ['<code>PATCH /registration/hmo</code>, <code>REGISTRATION_HMO_UPDATED</code>', 'свой <code>user_id</code> или admin / moderator / editor / developer; иначе 403', 'HMO, план, имя отца', 'Пользователь, stage, 26.10.2026'],
    ['<code>PUT /registration/user</code>, <code>REGISTRATION_IDENTITY_UPDATED</code>', 'только свой <code>user_id</code>; иначе 403', 'identity (текст с ведущими нулями), birthday <code>DD-MM-YYYY</code>', 'Пользователь, stage, 26.10.2026'],
    ['<code>POST /registration</code> (ветки существующего пользователя), <code>SHORT_REGISTRATION_UPDATED</code>', 'только <code>auth.user</code>', 'identity; либо birthday, HMO, план', 'Пользователь, stage, 26.10.2026'],
    ['<code>PATCH /user/add-client-email</code>, <code>CLIENT_EMAIL_UPDATED</code>', 'только <code>auth.user</code>', 'стандартный <code>email</code> (сверяется после записи)', 'Пользователь, stage, 26.10.2026'],
    ['<code>POST /address</code> тип CLIENT, <code>CLIENT_ADDRESS_UPDATED</code>', 'свой пользователь или агент своего клиента; иначе 403', cf(16898) + ' (тот же читаемый текст)', 'Пользователь, stage, 26.10.2026'],
    ['<code>PUT /change-agent</code>, <code>POST /create-inv-by-ref-link</code>, <code>PATCH /agent/invite-cli</code>, <code>AGENT_REASSIGNED</code>', 'без изменений', 'поля агента и агентства (кроме parent_agency_name)', PEND],
    ['<code>PUT /agent/block</code> / <code>unblock</code> и ежедневный запуск 07:45, <code>AGENT_BLOCK_UPDATED</code>', 'admin / moderator', cf(16880) + ' (только собственная роль агента)', PEND],
    ['Фактическое архивирование (<code>DELETE /user/client</code>, <code>/user/agent</code>, <code>/agent/delete-client</code>), <code>USER_DELETED</code>', 'без изменений', cf(16878) + ' = <code>"1"</code>', PEND]
])}
${li([
    ['impl', 'Событие уходит один раз, после успешного сохранения, в <code>finally</code> обработчика — и при более позднем сбое; при отказе, неизменных значениях или неудачном сохранении — нет. Удаление отправляется только после фиксации транзакции архивирования; телефон для поиска захватывается до архивирования и только в памяти.'],
    ['impl', 'Агентство и наставник: <code>PUT /user/main-agent</code> и <code>PUT /agent/update-mentor</code> событий не отправляют; поля обновятся при следующей подходящей синхронизации клиента. Рассылка по всем клиентам агента отложена.'],
    ['open', 'Сверка после записи сравнивает идентичность, членства и флажки, а также email и blocked_agent; остальные значения (HMO, identity, birthday, имя отца, адрес, поля агента) автоматически не сравниваются.']
])}
<p><strong>Создание отсутствующей карточки и начальная загрузка</strong>:</p>
${li([
    ['impl', 'Если оба поиска API v2 (по номеру и <code>crm_id</code>) прошли полностью и карточки нет, подключённое событие живого независимого пользователя создаёт карточку <strong>полным</strong> маппингом — и для ограниченных контекстов. Существующая карточка по-прежнему получает только разрешённые поля. Ошибка поиска, неполная выборка, конфликт или несвязанный лид создания не вызывают.'],
    ['impl', 'Кампании и начальные флажки — по классификации: собственная роль агента → 13567; личная ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → 13566 (is_customer); иначе CANCELED → 13568 (is_former_customer); иначе 13569 (is_registered_without_subscription).'],
    ['impl', 'Агент с личной подпиской — одна карточка в двух кампаниях: первый POST, затем проверка карточки и её членства через API v2, затем второй запрос только с <code>number</code> и <code>campaign</code>; после него оба членства должны быть активны. Добавляет ли второй запрос членство или переносит карточку, не подтверждено: перенос сообщается как <code>CREATE_MEMBERSHIP_UNCONFIRMED</code> и не исправляется.'],
    ['impl', 'Смена телефона: если карточки нет ни по <code>crm_id</code>, ни по старому, ни по новому номеру, карточка создаётся с текущим номером (<code>PHONE_CHANGE_BOOTSTRAP</code>), <code>number_change</code> не отправляется. Новый родственник: сначала создаётся карточка независимого главы семьи (<code>FAMILY_HEAD_BOOTSTRAP</code>), затем один раз отправляется запись <code>family_details</code>.'],
    ['open', 'Не создаётся: при удалении пользователя (<code>USER_DELETED</code>; отложено), для удалённого пользователя и для члена семьи — отдельных карточек родственников нет, родственники остаются записями модели 208.']
])}

<p><strong>Новый член семьи</strong> (<code>family_details</code>, запись в модели 208 ${he('בני משפחה')}):</p>
${li([
    ['impl', 'При создании <strong>нового</strong> родственника через <code>POST /agent/reg-family-member</code> (<code>AgentController.regFamilyMember</code>) и <code>POST /family</code> (<code>RegistrationController.regAnotherUser</code>, кроме ветки <code>isAgent</code>) уходит один POST на экспериментальный маршрут <code>POST https://app.callmarker.com/api/simple/customers/external-change</code> с <code>webhook=family_details</code>. <code>number</code> — телефон <strong>главы семьи</strong> (израильский локальный вид); <code>f_name</code>, <code>id_name</code>, <code>birthday</code> и <code>Reference</code> — данные <strong>родственника</strong> (имя и фамилия, удостоверение, дата рождения, связь); <code>crm_id</code> — MediWho <code>users.id</code> родственника. <code>Reference</code> из <code>related_as</code>: PARTNER → ' + he('בן זוג') + ', CHILD → ' + he('ילד') + ', PARENT → ' + he('הורה') + '; другое значение не отправляется (<code>RELATION_UNKNOWN</code>). Маршрут получен от поддержки CallMarker; в снимках документации поставщика его нет.'],
    ['live', 'Подтверждено пользователем на stage 26.10.2026 («stage checked, all work»): создание нового родственника через <code>POST /agent/reg-family-member</code> и <code>POST /family</code>. Это общее подтверждение пользователя: проверенные пользователи, ID записей, журналы и результаты по отдельным веткам не передавались; не каждый негативный случай, ветка с капчей, тип связи или сценарий параллельной работы проверены отдельно.'],
    ['impl', 'Только создание: приглашения существующих пользователей и их принятие, изменение и удаление родственников, дозаливка не подключены. Поддержка CallMarker подтвердила поддержку <code>crm_id</code> и исправление лишних пустых записей (отчёт пользователя, 25.10.2026).'],
    ['open', '<code>Data received</code> означает «принято», а не подтверждённое через API создание: модель 208 сейчас не читается через поддерживаемый публичный API. Автоматического повтора и постоянной защиты от дубликатов нет — повторная отправка может создать дубль. Иностранные телефоны главы семьи не поддерживаются и не проверены. Интеграция смены телефона — отдельная будущая задача.'],
    ['open', '<code>family_details</code> только создаёт запись в модели 208: покупки членов семьи и другие события сделок к нему не подключены; поведение сделок для членов семьи отложено.']
])}

<p><strong>Смена телефона администратором</strong> (<code>PUT /user/admin/change-phone</code>, <code>number_change</code>):</p>
${li([
    ['impl', 'Только <code>UserController.changePhone</code>: после успешного сохранения нового телефона уходит отдельный запрос на экспериментальный маршрут <code>POST https://app.callmarker.com/api/simple/customers/external-change</code> с <code>webhook=number_change</code> (<code>name</code>, <code>number</code> — старый телефон карточки, <code>new_number</code>). Обычная загрузка клиента с новым номером для смены телефона не используется. Требуется та же существующая карточка, привязанная по <code>crm_id</code>; маршрут получен от поддержки CallMarker и в снимках документации поставщика отсутствует.'],
    ['live', 'Подтверждено пользователем на stage 26.10.2026 («check done»). Это общее подтверждение: проверенные пользователи, ID карточек, журналы и результаты отдельных случаев, включая негативные проверки, не передавались.'],
    ['impl', 'Одна попытка и одна немедленная проверка чтением карточки по ID. «Принято, но не подтверждено» и «результат неизвестен» не отправляются повторно: карточку нужно проверить вручную только чтением.'],
    ['open', 'Постоянного состояния, надёжной очереди, отложенной сверки, автоматического повтора и общей паузы синхронизации нет (отложено пользователем). Другие маршруты изменения телефона CallMarker не сообщают; <code>PATCH /user/edit-info</code> и <code>PATCH /user/edit-agent-info</code> подключены, см. описание выше.']
])}

<h3 id="st-opportunity">7. Сделки (Opportunity): покупка, отмена, восстановление и проверенное поведение</h3>
<div class="callout">${T.impl} <strong>Сделки отправляются автоматически в пяти контекстах:</strong> <code>SUBSCRIPTION_ACTIVATED</code> — Purchased (кампания 13566), <code>SUBSCRIPTION_CANCELED</code> — отдельная Not purchased с ID причины (статус <code>3</code>, кампания 13568), <code>SUBSCRIPTION_RECOVERED</code> — новая Purchased с отметкой ${he('שחזור מנוי')}, <code>SUBSCRIPTION_BLOCKED</code> — Not purchased с причиной <code>367</code>, <code>SUBSCRIPTION_UNBLOCKED</code> — Purchased с отметкой ${he('הוסדר תשלום')} (последние три — кампания 13566). Поля сделки добавляются в <strong>тот же</strong> POST, что и клиент (без <code>source</code>). Отдельного запроса «открыть, затем закрыть» нет. Другие контексты поля сделки не отправляют. ${T.live} Работа потока на stage подтверждена пользователем в целом.</div>
<p><strong>Поток покупки:</strong></p>
<ol class="status-steps">
<li>${T.impl} Личная <code>user_subscription</code> переходит в ACTIVE (оплата картой или бесплатная, подтверждение банка, активация из CARD_BLOCKED; строка при загрузке была не ACTIVE) или создаётся коллективная покупка.</li>
<li>${T.impl} Событие несёт <code>user_id</code> владельца и точный <code>user_subscription_id</code>.</li>
<li>${T.impl} Обработка в очереди по пользователю заново читает данные; собственные (не AGENT) подписки агентов обрабатываются с сохранением членств (см. ниже).</li>
<p><strong>Собственные (не AGENT) подписки агентов</strong> (<code>agent</code> / <code>insurance_agent</code>; причина <code>AGENT_MEMBERSHIP_PENDING_SUPPORT</code> больше не используется):</p>
${table(['Событие', 'Кампания', 'Сделка', 'Примечание'], [
    ['Покупка', '13566', 'Purchased <code>2</code>', 'Подтверждено пользователем на stage 29.10.2026 (до сетевой политики; общее сообщение «stage проверка сделана, всё ок», объём выведен из сопровождавшей задачи)'],
    ['Блокировка', '13566', 'Not purchased <code>3</code>, причина <code>367</code>', PEND],
    ['Разблокировка', '13566', 'Purchased <code>2</code>, <code>product_field_1060</code> = ' + he('הוסדר תשלום'), PEND],
    ['Отмена', '13568', 'Not purchased <code>3</code>, причина точного запроса или <code>378</code>; прежние правила 1060 / 1061', PEND],
    ['Восстановление', '13566', 'Purchased <code>2</code>, <code>product_field_1060</code> = ' + he('שחזור מנוי'), PEND]
])}
${li([
    ['impl', 'Во всех пяти: <code>is_agent</code> = <code>"1"</code>; активные членства читаются до записи (не прочитаны — ничего не отправляется) и один раз после: 13567 и все прежние членства должны остаться с теми же ID, ровно одно в кампании события, ничего лишнего; иначе одно приватное письмо «не подтверждено» (<code>AGENT_MEMBERSHIP_CHANGED</code> / <code>AGENT_MEMBERSHIP_INCOMPLETE</code>).'],
    ['impl', 'Нет <code>unique</code>, удаления членств, автоматических повторов и исправлений. Свои проверки контекста (владелец, тариф AGENT, устаревший статус, <code>ACTIVE_SUBSCRIPTION_EXISTS</code>, члены семьи) не изменились.'],
    ['impl', 'Нет карточки — общее создание для совмещённой роли: первый POST в кампанию события со сделкой, второй — только <code>number</code> + 13567; сделка отправляется один раз.'],
    ['open', 'Нейтральные обновления профиля совмещённой карточки по-прежнему могут остановиться с <code>CLASSIFICATION_AMBIGUOUS</code>; выбор кампании отложен.']
])}
<li>${T.impl} Проверяется строка (<code>loadPurchase</code>): владелец, статус ACTIVE, тариф существует и не AGENT. Иначе ничего не пишется, письмо пользователю 84.</li>
<li>${T.impl} Поиск клиента и проверки конфликтов через API v2; чтение сделок клиента до записи.</li>
<li>${T.impl} Тариф → <code>subscriptions.callmarker_product_id</code>; готовятся поля клиента и сделки (<code>buildOpportunityFields</code>).</li>
<li>${T.impl} Один POST: клиент + сделка Purchased (если сопоставление готово).</li>
<li>${T.impl} Проверка после записи — только чтение через API v2; без повторной отправки.</li>
</ol>
<p><strong>Текущее сопоставление полей сделки:</strong></p>
${table(['Параметр', 'Значение', 'Если чего-то нет'], oppFields, 'extable')}
<p><strong>Колонки, добавленные вручную</strong> (миграции в репозитории нет): <code>subscriptions.callmarker_product_id</code> — <code>BIGINT UNSIGNED NULL</code>, внутренний ID продукта в каталоге настроенного аккаунта CallMarker (отдельные ID для stage и production нужны не всегда: при общем каталоге ID могут совпадать). Продукт должен быть активен, иметь открытую цену и быть настроен для кампании 13566, куда идёт автоматическая покупка; просмотр в браузере подтвердил связь <code>7794</code> с тестовой кампанией 13565, а связь с 13566 явно не подтверждена — настройку этой кампании нужно проверить. Успешная проверка на stage подтверждена пользователем; какие изменения настройки к ней привели, здесь не фиксируется. <code>users.callmarker_agent_name</code> — <code>VARCHAR(255) NULL</code>: точное Name пользователя CallMarker <strong>или</strong> настроенное у него CRM Name; вживую подтверждено для Name «Yuval Kopel REP», а сопоставление по CRM Name и проверка личности ограничены — API v2 отдаёт только id и Name пользователя. В SQL-артефакте передано 137 соответствий «тариф → продукт CallMarker», например <code>subscriptions.id</code> 192 / SKU I-0004 → 7794. Документация их по отдельности не запрашивала и не проверяла.</p>
${li([
    ['impl', 'Не путать: <code>custom_field_16876</code> (active_product_id) клиента — это <code>products.id</code> MediWho; <code>product_id</code> сделки — внутренний ID продукта CallMarker; <code>opportunity_crm_id</code> — тариф; <code>product_field_1059</code> — конкретная строка покупки.'],
    ['impl', 'Нет или некорректно сопоставление продукта, некорректна цена → клиент записывается <strong>без</strong> полей сделки, пользователю 84 — одно письмо «opportunity skipped». Нет поставщика, имени поставщика, названия продукта или <code>callmarker_agent_name</code> → пропускается только это значение. Если сама запись упала или ушла в тайм-аут, обычное письмо синхронизации отмечает, что поля сделки были в запросе и результат неизвестен.']
])}
<p><strong>Отмена</strong> (<code>SUBSCRIPTION_CANCELED</code>, кампания 13568 <code>FORMER_CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'Отмена из ACTIVE, BLOCKED или AWAITING_BANK_TRANSFER в CANCELED в трёх подключённых местах: ручная отмена (<code>canceledSubscription</code>), отмена Galil (<code>cancelUserSubscription_Galil</code>) и выполнение плановой отмены (<code>FutureCancellationRunner.runOne</code>; отменяет только ACTIVE). Исходный статус фиксируется до записи CANCELED; тариф не AGENT. Событие несёт <code>cancellation_request_id</code> — запрос, который использовала сама операция (Galil, плановая отмена); ручная отмена запроса не передаёт. Сбой отправки события отмену не меняет.'],
    ['impl', 'При запуске: член семьи — пропуск <code>FAMILY_MEMBER_PENDING_DECISION</code>; строка должна существовать, принадлежать пользователю и оставаться CANCELED (иначе письмо пользователю 84); если у пользователя уже есть ACTIVE личная подписка — пропуск <code>ACTIVE_SUBSCRIPTION_EXISTS</code>, устаревшее событие не возвращает клиента назад.'],
    ['impl', 'Клиент: кампания 13568, is_former_customer = <code>"1"</code>, is_customer, is_lead и is_registered_without_subscription = <code>"0"</code>, ' + cf(16879) + ' = <code>"0"</code>; ID custom fields выбираются по окружению («(S)» на dev/stage). is_agent и is_test не отправляются и не меняются; <code>source</code> нет.'],
    ['impl', 'Отдельная сделка Not purchased в том же POST: <code>opportunity_status</code> = <code>"3"</code>, продукт и цена — из точной отменённой строки, <code>opportunity_not_purchased_reason_id</code> — по причине запроса (таблица ниже) или <code>378</code>, <code>opportunity_agent_name</code> — если настроено, поля 1057–1059 — как при покупке. <code>product_field_1060</code> не отправляется. Статус 3 здесь — новая запись, а не отмена существующей продажи.'],
    ['impl', '<strong>Причина.</strong> Запрос — только тот, что пришёл в событии; он читается на сервере и должен ссылаться на эту строку <code>user_subscriptions</code> и её владельца (<code>requested_for</code>). Последний запрос никогда не подставляется. Сохранённая <code>request_reason</code> переводится по таблице; вызывающий код причину не передаёт. Нет запроса (<code>CANCELLATION_REQUEST_UNKNOWN</code>; ручная отмена — всегда), запрос не найден (<code>CANCELLATION_REQUEST_NOT_FOUND</code>), чужая строка или владелец (<code>CANCELLATION_REQUEST_MISMATCH</code>), пустая (<code>NOT_PURCHASED_REASON_MISSING</code>) или неизвестная причина (<code>NOT_PURCHASED_REASON_UNMAPPED</code>; <code>UPGRADED</code> — не псевдоним <code>UPGRADE</code>) → <code>378</code> (' + he('לא ידוע') + ').'],
    ['impl', 'Чтение запроса необязательное: при ошибке — <code>378</code> с диагностикой <code>CANCELLATION_REQUEST_READ_FAILED</code>; синхронизация клиента и сделки не прерывается.'],
    ['impl', '<strong>Примечание о взыскании</strong> (<code>product_field_1061</code>) — только при отмене <strong>из</strong> BLOCKED или AWAITING_BANK_TRANSFER, по тому же проверенному запросу с причиной <code>RETURNED_CHARGE</code>, <code>DENIAL_OF_TRANSACTION</code> или <code>BLOCKING_PAYMENT_METHOD</code>: <code>msg</code> <strong>первого</strong> сообщения запроса, текст как хранится (иврит и переносы строк сохраняются, без обрезки и данных автора). Неизвестный, отсутствующий, чужой или нечитаемый запрос, другая причина, пустое или неверное первое сообщение → 1061 не отправляется (<code>COLLECTION_NOTE_MESSAGE_MISSING</code> / <code>COLLECTION_NOTE_MESSAGE_INVALID</code>), отмена продолжается. На практике примечание приходит от отмен Galil.'],
    ['open', 'После отмены активного продукта нет: ' + cf(16876) + ' и ' + cf(16877) + ' пропускаются, а не очищаются, поэтому прежнее значение в CRM может остаться — способ очистки не согласован и не проверен. ' + cf(16899) + ' пересчитывается снимком (например, ' + he('לקוח לשעבר') + ').']
])}
<p><strong>ID причин Not purchased</strong> (<code>CALLMARKER_NOT_PURCHASED_REASONS</code>, <code>CALLMARKER_BLOCKING_REASON</code>, <code>CALLMARKER_UNKNOWN_REASON</code> в <code>app/Constants/Enums.js</code>). Один каталог аккаунта CallMarker: ID не зависят от окружения и не являются ID custom fields. Приём Simple API не проверялся.</p>
${table(['<code>request_reason</code>', 'ID', 'Название в CallMarker'], npReasons, 'extable')}
<p><strong>Блокировка и разблокировка</strong> (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>, кампания 13566 <code>CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'BLOCKED и AWAITING_BANK_TRANSFER означают ' + cf(16879) + ' = <code>"1"</code>; <code>CARD_BLOCKED</code> сам по себе его не ставит. Клиент с заблокированной подпиской остаётся клиентом.'],
    ['impl', '<strong>Блокировка</strong> — ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, а также CANCELED → BLOCKED (восстановление с <code>blocked_cancel</code>): is_customer = <code>"1"</code>, остальные три — <code>"0"</code>, is_blocked = <code>"1"</code>; отдельная сделка Not purchased (<code>"3"</code>) с причиной <code>367</code> (' + he('חסימת מנוי') + '); без <code>product_field_1060</code> и <code>product_field_1061</code>.'],
    ['impl', '<strong>Разблокировка</strong> — BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE через административное изменение статуса (не покупка): is_customer = <code>"1"</code>, остальные три — <code>"0"</code>, is_blocked = <code>"0"</code>; отдельная сделка Purchased (<code>"2"</code>) с <code>product_field_1060</code> = ' + he('הוסדר תשלום') + '; <code>opportunity_not_purchased_reason_id</code> не отправляется.'],
    ['impl', 'Не синхронизируются: переход между BLOCKED и AWAITING_BANK_TRANSFER, неизменный статус, CARD_BLOCKED и прочие изменения. Подтверждение банка (AWAITING_BANK_APPROVAL → ACTIVE через <code>updateBankApprovalStatus</code>; admin-panel вызывает его для строк AWAITING_BANK_APPROVAL, сам метод исходный статус не ограничивает, событие уходит, если строка не была ACTIVE) и активация из CARD_BLOCKED остаются покупками (<code>SUBSCRIPTION_ACTIVATED</code>). Разблокировка — это BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE через <code>updateUserSubscriptionStatus</code> (<code>SUBSCRIPTION_UNBLOCKED</code>, отметка ' + he('הוסדר תשלום') + ').'],
    ['impl', 'При запуске строка перечитывается: если она уже не в ожидаемом статусе (<code>SUBSCRIPTION_NOT_BLOCKED</code> / <code>SUBSCRIPTION_NOT_ACTIVE</code>) или тариф AGENT — событие устарело и пропускается (только журнал).'],
    ['impl', cf(16879) + ' во всех полных синхронизациях — собственный расчёт CallMarker (<code>blockingSubscriptionsQuery</code>); флаг снимка Kaveret (только BLOCKED) не используется.']
])}
<p><strong>Восстановление</strong> (<code>SUBSCRIPTION_RECOVERED</code>, кампания 13566 <code>CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'Только <code>userSubscriptionRecovery</code> (<code>PUT /subscription-recovery</code>): строка при загрузке CANCELED, сохранена как ACTIVE, тариф известен и не AGENT, подписка личная и обычная. Восстановление в BLOCKED (CANCELED → BLOCKED) идёт как блокировка, без сделки восстановления. Агенты с собственной ролью, члены семьи и Fly/RDG — вне объёма.'],
    ['impl', 'Клиент: is_customer = <code>"1"</code>, остальные три флажка жизненного цикла — <code>"0"</code>; is_agent не снимается, is_test не отправляется.'],
    ['impl', '<strong>Новая</strong> сделка Purchased: <code>opportunity_status</code> = <code>"2"</code>, <code>product_field_1060</code> = ' + he('שחזור מנוי') + '; то же сопоставление продукта, цены, необязательного настроенного агента и полей 1057–1059; причина не отправляется. Прежние сделки намеренно не меняются; <code>product_field_1061</code> не используется.'],
    ['impl', '<strong>Не путать с разблокировкой:</strong> восстановление — CANCELED → ACTIVE через <code>PUT /subscription-recovery</code>, отметка ' + he('שחזור מנוי') + '; разблокировка — BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE через изменение статуса, отметка ' + he('הוסדר תשלום') + ' и is_blocked = <code>"0"</code>.']
])}
<p><strong>Общие защиты</strong> (отмена, восстановление, блокировка и разблокировка):</p>
${li([
    ['impl', 'Simple API закрывает открытую сделку по продукту вместо создания отдельной записи. Поэтому до записи читаются сделки существующего клиента: открытая (статус 1) сделка с этим <code>product_id</code> → <code>OPEN_OPPORTUNITY_EXISTS</code>; список не прочитан → <code>OPEN_OPPORTUNITY_UNKNOWN</code>.'],
    ['impl', 'В обоих случаях все поля сделки не отправляются, кампания и флажки клиента всё равно записываются, пользователю 84 уходит одно письмо; ничего не закрывается, автоматического повтора нет. Открытая сделка по другому продукту не мешает.'],
    ['impl', 'Нет или некорректно сопоставление продукта или цена — сделка тоже не отправляется, запись клиента сохраняется, пользователю 84 — письмо.'],
    ['impl', 'Обычная покупка не меняется: защита к ней <strong>не</strong> применяется; при открытой сделке покупка закроет её, а проверка после записи сообщит <code>VERIFY_PRE_EXISTING_ONLY</code>.'],
    ['impl', 'Исключения агентов и членов семьи и покрытие триггеров прежние.'],
    ['open', 'Чтение перед записью не атомарно: оно не защищает от параллельных изменений и не предотвращает все дубликаты.']
])}
<p><strong>Подтверждено пользователем на stage</strong> (до добавления блокировки и ID причин; не тесты, выполненные при подготовке документации; отдельные клиенты, время и запросы не передавались):</p>
${li([
    ['live', 'Отмена: кампания 13568 и флажки жизненного цикла проверены. Покрытие всех трёх точек входа отмены не подтверждено.'],
    ['live', 'Отмена создаёт новую сделку Not purchased.'],
    ['live', 'Восстановление создаёт новую сделку Purchased с отметкой восстановления (<code>product_field_1060</code>).'],
    ['live', 'Прежние сделки остаются без изменений.']
])}
<p><strong>Живая проверка не выполнена</strong> (сетевой доступ со stage отключён текущей политикой; перечисленное ниже вживую не подтверждено; подтверждённый пользователем поток <code>family_details</code> сюда не входит):</p>
${li([
    ['open', 'ID причин 367–370 и 372–378 (включая запасной <code>378</code>) принимаются Simple API и возвращаются через API v2 (<code>not_purchased_reason_id</code>). Причина <code>371</code> (<code>CUSTOMER_REQUEST</code>) уже подтверждена тестом; это не подтверждает остальные ID.'],
    ['open', 'Ручная отмена отправляет <code>378</code>; отмена по запросу — ID своей причины.'],
    ['open', 'Блокировка: 13566, is_customer(S) = <code>"1"</code>, is_blocked(S) = <code>"1"</code>, Not purchased с причиной <code>367</code>.'],
    ['open', 'Разблокировка: is_blocked(S) = <code>"0"</code>, Purchased с отметкой ' + he('הוסדר תשלום') + '.'],
    ['open', 'Отмена из BLOCKED / AWAITING_BANK_TRANSFER: 13568, is_blocked(S) = <code>"0"</code>, правильное <code>product_field_1061</code>.'],
    ['open', 'Восстановление по-прежнему с отметкой ' + he('שחזור מנוי') + '; прежние сделки во всех этих сценариях не меняются.'],
    ['open', 'Коллективная покупка (13566, is_customer(S) = <code>"1"</code>, Purchased с ценой покупки, <code>product_field_1059</code> = новый <code>user_subscriptions.id</code>).'],
    ['open', cf(16899) + ' простым текстом.'],
    ['live', "HMO / план: только названия на иврите. Подтверждено пользователем на stage 26.10.2026; общее подтверждение без доказательств по каждой ветке. Production не проверен."],
    ['open', 'Остальные сценарии профиля: production, параллельные изменения членств и непроверенные негативные ветки. Проверка значений полей на stage подтверждена пользователем 26.10.2026.'],
])}
<p><strong>Проверка после записи</strong> (только чтение, ограниченная, без повторной отправки): до записи и один раз после читается <code>GET /api/v2/opportunities?filter[customer_id]=…&amp;include=user,product_fields&amp;product_fields_format=map</code> (все страницы, не больше 10 × 100). Совпадение — <code>product_id</code> + <code>product_field_1059</code> = точный <code>user_subscriptions.id</code>; ровно одна <strong>новая</strong> такая сделка с отправленным статусом (2 — покупка, восстановление, разблокировка; 3 — отмена, блокировка) и отправленными значениями, включая ID причины (поле API v2 <code>not_purchased_reason_id</code>; вживую ещё не наблюдалось), 1060 и 1061, если они отправлялись, — <code>confirmed</code>. Иначе пользователю 84 — письмо «opportunity unconfirmed» (<code>VERIFY_ABSENT</code>, <code>VERIFY_AMBIGUOUS</code>, <code>VERIFY_MISMATCH</code>, <code>VERIFY_PRE_EXISTING_ONLY</code>, <code>VERIFY_LOOKUP_FAILED</code> и др.). HTTP 200 и «Customer has been added successfully» сделку не подтверждают.</p>
${table(['Оценка агента', 'Что значит'], [
    ['<code>CONFIRMED</code>', 'Вернувшееся Name пользователя равно <code>callmarker_agent_name</code> — подтверждённое совпадение по Name. Если настроено CRM Name, отличное от Name, оценка будет <code>IDENTITY_UNVERIFIED</code>.'],
    ['<code>AGENT_NOT_ASSIGNED</code>', 'У сделки нет пользователя — назначения нет; письмо пользователю 84.'],
    ['<code>IDENTITY_UNVERIFIED</code>', 'Назначен пользователь с другим Name; настроенное значение может быть его CRM Name. Сделка подтверждается, но то, что это правильный агент, <strong>не доказано</strong> (API v2 не отдаёт CRM Name).'],
    ['<code>NOT_SENT</code>', '<code>callmarker_agent_name</code> не задан — имя не отправлялось.']
])}
<p><strong>Проверенное поведение</strong> (исторические контролируемые тесты на stage, 14–15.10.2026, тестовый клиент 24622736 в кампании 13565; отдельно от автоматического потока):</p>
${table(['Что проверялось', 'Результат'], oppVerified)}
<p>Историческая последовательность «открыть, затем закрыть» (отчёт пользователя):</p>
${table(['№', 'Запрос', 'Результат'], oppTests)}
${li([
    ['impl', 'Статус <code>3</code> — <strong>не</strong> отмена существующей продажи: без открытой сделки он создаёт новую закрытую запись. Так отмена и создаёт отдельную сделку Not purchased; существующая Purchased не меняется.'],
    ['open', '<strong>Постоянной защиты от дубликатов нет</strong> — явное решение пользователя (отложено). Без открытой сделки каждый Purchased POST создаёт новую сделку; повторные или параллельные события, два пода при обновлении или ручная повторная отправка после тайм-аута могут создать дубли. Проверка порядка статусов подавляет только последовательные повторные колбэки. Повторные события отмены, восстановления, блокировки или разблокировки тоже могут создать дополнительные закрытые сделки. <code>product_field_1059</code> — корреляция со строкой подписки, а не принудительный уникальный ключ (у всех сделок одной строки оно общее); помогает найти дубли, но не предотвращает их. Идемпотентность платежей тоже отложена.'],
    ['open', 'Создание Purchased без <code>opportunity_agent_name</code> живым тестом не проверялось.']
])}
<p><strong>Настройка агента в CallMarker</strong> (для <code>users.callmarker_agent_name</code>):</p>
<ol class="status-steps">
<li>${T.next} Найти правильного существующего пользователя-агента в CallMarker.</li>
<li>${T.next} Записать в <code>users.callmarker_agent_name</code> его точное Name <strong>или</strong> настроенное у него CRM Name. Вживую подтверждено только сопоставление по Name; CRM Name через API v2 не проверить, и если оно отличается от Name, оценка будет <code>IDENTITY_UNVERIFIED</code>.</li>
<li>${T.next} Не связывать агента MediWho с посторонним пользователем CallMarker; если подходящего нет, его создание — отдельное административное решение.</li>
<li>${T.next} Проверять назначение по <code>user_id</code> сделки (API v2) и в интерфейсе; <code>IDENTITY_UNVERIFIED</code> не считать доказанным совпадением.</li>
</ol>
<p class="note">Не воспроизводить платёжные колбэки как тест: идемпотентность платежей и комиссий не решена.</p>

<h3 id="st-fields">8. Сопоставление полей</h3>
<p>Все custom fields необязательны; полный набор отправляют тест клиента и синхронизация пользователей, Contact Us — только env и флажки жизненного цикла. В первом столбце — ID production и «(S)»-ID для dev/stage. Пустые значения не отправляются. Полное описание — в карточках разделов <a href="#customers">4</a> и <a href="#custom">5</a>. Столбец «Живой тест» различает: <em>включено и принято</em> (поле было в запросе, CallMarker ответил успехом) и <em>значение сверено в интерфейсе</em> (отмечено ✓).</p>
${table(['Параметр', 'Источник', 'Реализовано', 'Живой тест', 'Решение'], fieldRows, 'fieldmap')}
<p class="note"><strong>Состав теста 5.</strong> Отправлены: ${cfs([16868, 16874, 16875, 16876, 16877, 16880, 16881, 16887, 16888, 16889, 16890, 16891])}. Не отправлены, потому что у тестового пользователя пусто (<code>EMPTY</code>): ${cfs([16873, 16882, 16883, 16884, 16885, 16886, 16892, 16894, 16895, 16896, 16898])}. Не отправлены по другим причинам: ${cf(16893)} — <code>PENDING_CONFIRMATION</code>; ${cf(16869)} — <code>BIRTHDAY_FORMAT_NOT_CONFIGURED</code>; ${cf(16878)} и ${cf(16879)} — <code>SELECT_MAP_NOT_CONFIGURED</code>; ${cf(16867)} — <code>NOT_USED</code>. Верхнеуровневый <code>env=dev</code> тоже был отправлен и проигнорирован. Значения полей теста 5 в интерфейсе по отдельности не сверялись. Сохранение опции «dev» в ${cf(16901)} не подтверждает тексты опций ${cf(16878)} и ${cf(16879)}.</p>
${li([
    ['dec', 'Бизнес-правило: у клиента ожидается только одна ACTIVE-подписка. Ограничения в базе данных нет.'],
    ['impl', 'Если у клиента несколько собственных ACTIVE-строк <code>user_subscriptions</code> с разными продуктами, строки снимка расходятся: все шесть ключей снимка (в том числе 16876/16877) пропускаются как <code>AMBIGUOUS</code>, синхронизация пользователей ничего не пишет (письмо <code>AMBIGUOUS_SOURCE_DATA</code>), тест клиента отвечает 409. Учитываются только строки с <code>user_id = users.id</code>, без семейного членства.']
])}

<h3 id="st-live">9. Живые тесты и состояние проверки</h3>
<p><strong>Тест клиента</strong> (исторические записи): пользователь <code>11111483</code>, кампания <code>13565</code>, окружение dev (<code>NODE_ENV=development</code>), 11.10.2026. Источник — отчёты пользователя; журнал в репозитории описывает шаги 1–6 (расхождения — в <a href="#st-diff">разделе 14</a>).</p>
${table(['№', 'Номер / формат', 'Состав запроса', 'HTTP', 'Ответ CallMarker', 'Наблюдение'], liveRows)}
${li([
    ['live', 'Приняты протестированные поля (состав теста 5 — в <a href="#st-fields">разделе 8</a>), но не все возможные поля.'],
    ['live', 'Израильский номер в локальном виде без <code>international</code> и <code>region</code> сработал в этой конфигурации.'],
    ['live', 'Selectbox принимает текст опции: «dev» в ' + cf(16901) + ' сохранено (тест 7).'],
    ['open', 'Текст успешного ответа одинаков при создании и обновлении: различить их можно только по интерфейсу CRM.'],
    ['open', 'HTTP 200 сам по себе не означает бизнес-успеха: отказы 1 и 2 тоже пришли с HTTP 200.'],
    ['open', 'Текст ответа CallMarker на тест 7 не записан.'],
    ['open', 'E.164 + <code>international=1</code> на валидном номере не проверялся.'],
    ['open', 'Отклонённые номера были непригодными тестовыми данными. Это не значит, что любой ответ «Invalid number format» означает невыделенный диапазон.']
])}
<p><strong>Contact Us:</strong> сайт — тест на stage подтверждён пользователем (детали не переданы); приложение +60 — только просмотр кода и мок-тесты. Даты развёртывания и результаты в production не сообщались и здесь не приводятся.</p>
<p><strong>Автоматические проверки</strong> (это <em>не</em> живая проверка): мок-тесты, запущенные мной 15.10.2026 без сети, БД и <code>.env</code> — Contact Us 34 из 34, тест клиента 43 из 43, синхронизация пользователей 67 из 67, активация подписки 17 из 17. ESLint в этой задаче не запускался; последняя известная ошибка — неиспользуемая <code>isCard</code> в <code>KaveretController.js</code> (14.10.2026).</p>

<p><strong>Реализованный поток на stage:</strong> пользователь подтвердил, что развёрнутый поток проверен успешно. Отдельные случаи, ID ответов и даты не передавались; проверки в production не было. <strong>Сделки и флажки:</strong> проверенное поведение — в <a href="#st-opportunity">разделе 7</a> и <a href="#st-lifecycle">разделе 6</a>; подтверждённые пользователем результаты отмены и восстановления — в разделе 7. Мок-тесты отмены, восстановления и блокировки (<code>tests/callmarker-subscription-cancellation-regressions.js</code>, <code>tests/callmarker-subscription-blocking-regressions.js</code>) при подготовке документации не запускались; блокировка, разблокировка и ID причин вживую не проверены.</p>

<h3 id="st-unverified">10. Непроверенные поля и случаи</h3>
<ul class="status-list">
<li>${T.open} Проверка в production (реализованный поток проверен только на stage).</li>
<li>${T.open} Отдельная проверка Contact Us из приложения +60 на stage.</li>
<li>${T.open} Создание сделки Purchased без <code>opportunity_agent_name</code>.</li>
<li>${T.open} Коллективная покупка на stage.</li>
<li>${T.open} Покрытие всех трёх точек входа отмены (ручная, Galil, плановая): подтверждение пользователя его не включает.</li>
<li>${T.open} ${cf(16899)} простым текстом после развёртывания.</li>
<li>${T.open} Очистка ${cf(16876)} / ${cf(16877)} после отмены.</li>
<li>${T.open} Блокировка, разблокировка, ID причин 367–378 кроме подтверждённой 371 (включая 378), отмена из BLOCKED / AWAITING_BANK_TRANSFER с примечанием 1061.</li>
<li>${T.open} Принимают ли ${cf(16878)} и ${cf(16879)} (и их «(S)»-версии) значения <code>1</code>/<code>0</code>; тексты опций «stage»/«prod» в ${cf(16901)}.</li>
<li>${T.live} Birthday: DD-MM-YYYY; подтверждено пользователем на stage 26.10.2026; production не проверен.</li>
<li>${T.open} Реальные пределы длины полей CallMarker для ${cf(16898)} (в интеграции предварительно 255 кодовых точек) и ${cf(16899)} (предела в коде нет).</li>
<li>${T.open} Поля родителя и агентства и ${cf(16873)} на пользователе, у которого они заполнены.</li>
<li>${T.open} Иностранные номера телефонов; отправка валидного номера в E.164.</li>
<li>${T.open} Как очищаются ранее сохранённые поля при пропуске или пустом значении.</li>
<li>${T.open} Смена номера телефона и общий номер.</li>
<li>${T.open} Добавление клиента во вторую кампанию без переноса; статусы и назначения агентов в разных кампаниях.</li>
</ul>

<h3 id="st-deferred">11. Отложенная функциональность</h3>
<p>Ничего из списка не подключено. Contact Us, синхронизация пользователей и автоматические сделки покупки, отмены и восстановления сюда не относятся — они реализованы (разделы 2, 6 и 7). Успешная проверка на stage эти ограничения не снимает.</p>
${table(['Функциональность', 'Состояние'], deferred)}

<h3 id="st-temp">12. Временные элементы реализации</h3>
<p>Состояние проверено по коду 14.10.2026.</p>
${table(['Пункт', 'Текущее состояние', 'Что нужно сделать'], tempRows)}

<h3 id="st-next">13. Рекомендуемые шаги</h3>
<ol class="status-steps">
<li>${T.next} Решить, когда и как проверять реализованный поток в production; успешная проверка на stage её не заменяет.</li>
<li>${T.next} Заполнить <code>users.callmarker_agent_name</code> для поставщиков (правильные пользователи CallMarker) и проверить создание Purchased без имени агента.</li>
<li>${T.next} Отдельно утвердить правило замены неясных флажков при покупке.</li>
<li>${T.next} Получить от поддержки CallMarker способ добавить клиента во вторую кампанию без переноса; до этого покупка, отмена и восстановление у агентов остаются пропущенными.</li>
<li>${T.open} Коллективная покупка и ${cf(16899)} простым текстом: ${PEND}. Включать stage через <code>NODE_ENV=production</code> нельзя; способ живой проверки решает пользователь.</li>
<li>${T.next} Согласовать очистку ${cf(16876)} / ${cf(16877)} после отмены.</li>
<li>${T.open} Блокировка, разблокировка, ID причин 367–378 (кроме подтверждённой 371) и примечание 1061: ${PEND} (список — в <a href="#st-opportunity">разделе 7</a>).</li>
<li>${T.next} Бизнес-решение: какую кампанию выбирать для нейтрального обновления, если агент активен и в 13567, и в 13566 (сейчас <code>CLASSIFICATION_AMBIGUOUS</code>, записи нет; приоритет не придумывается).</li>
<li>${T.next} Быстрая цепочка смен телефона (вторая смена до применения первой) завершается ошибкой (<code>PHONE_MISMATCH</code> / <code>PHONE_SUPERSEDED</code>); постоянное состояние отложено. <code>unique</code> не используется; автоповторов и дедупликации нет; модель 208 — только создание; автоматической сверки всех полей нет.</li>
<li>${T.next} Когда команда решит, вернуться к постоянной защите сделок от дубликатов и хранению состояния синхронизации.</li>
<li>${T.next} Подключить оставшиеся ветки регистрации и решить поведение членов семьи, смены телефона через другие маршруты (кроме <code>PUT /user/admin/change-phone</code>) и общего номера.</li>
<li>${T.next} Закрыть вопросы по Selectbox (1/0, тексты env), пределу длины текста и иностранным телефонам.</li>
</ol>
<p class="note">Платёжные колбэки как способ тестирования не использовать: идемпотентность платежей и комиссий не решена.</p>

<h3 id="st-diff">14. Расхождения между источниками</h3>
${table(['Тема', 'Источник A', 'Источник B', 'Как отражено'], diffRows)}

<h3 id="st-decisions">15. Таблица решений</h3>
${table(['Тема', 'Что известно сейчас', 'Открытый вопрос', 'Следующее действие'], decisions)}
<p><a class="top-link" href="#top">↑ Наверх</a></p>
</section>`
