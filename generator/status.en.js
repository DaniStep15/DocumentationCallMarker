'use strict'
// Section "CallMarker: integration status and open questions" (English), rendered into the same page.
// Sources: API repository code (inspected 2026-10-14), docs/instructions/callmarker_*.md,
// docs/audits/kaveret-flow-scan-2026-10-07.md, frontend source (/new-client flow), and the user's reports.
const { he } = require('./data.en')

const PEND = 'live verification pending; stage network access disabled by current policy'
const T = {
    impl: '<span class="tag t-impl">Implemented</span>',
    live: '<span class="tag t-live">Verified by live test</span>',
    dec: '<span class="tag t-dec">Confirmed decision</span>',
    open: '<span class="tag t-open">Open question</span>',
    next: '<span class="tag t-next">Proposed step</span>',
    exist: '<span class="tag t-exist">Existing flow</span>',
    notimpl: '<span class="tag t-open">NOT IMPLEMENTED</span>',
    lim: '<span class="tag t-exist">Accepted limitation</span>'
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
const T5 = 'Sent in test 5, accepted'
const EMPTY = 'No (empty for the test user)'

const SUB = [
    ['st-scope', '1. Integration scope and triggers'],
    ['st-contactus', '2. Contact Us: website and +60 app'],
    ['st-newclient', '3. Existing mediwho.com/new-client flow'],
    ['st-flow', '4. Customer test endpoint'],
    ['st-ident', '5. Customer identification and campaigns'],
    ['st-lifecycle', '6. Sync, campaigns and lifecycle checkboxes'],
    ['st-opportunity', '7. Opportunities: purchase, cancellation, recovery'],
    ['st-fields', '8. Field mapping'],
    ['st-live', '9. Live tests and verification status'],
    ['st-unverified', '10. Unverified fields and cases'],
    ['st-deferred', '11. Deferred functionality'],
    ['st-temp', '12. Temporary implementation items'],
    ['st-next', '13. Recommended steps'],
    ['st-diff', '14. Discrepancies between sources'],
    ['st-decisions', '15. Decision table']
]

// Kaveret snapshot triggers: docs/audits/kaveret-flow-scan-2026-10-07.md §3, re-checked against code on 2026-10-11.
const triggers = [
    ['<code>CREATE_USER</code>', '<code>auth/RegistrationController.js</code>: <code>regAgent:265</code>, <code>regAnotherUser:787</code>, <code>createUser:927</code>; <code>Agent/AgentRegClient.js</code>: <code>addNewFamilyMember:287</code>'],
    ['<code>UPDATE_USER</code>', '<code>auth/RegistrationController.js</code>: <code>updateIdentityWithBirthday:89</code>, <code>updateUserHmo:990</code>; <code>auth/UserController.js</code>: <code>editUser:968</code>, <code>editAgentInfo:1102</code>, <code>editUserInfo:1407</code>, <code>changePhone:2556</code>; <code>auth/RoleUserController.js</code>: <code>updateUserRoles:39</code>; <code>AddressController.js</code>: <code>createAddress:94</code>; <code>AgentController.js</code>: <code>updateClientInfo:1524</code>, <code>regFamilyMember:1879</code>'],
    ['<code>DELETE_USER</code>', '<code>auth/UserController.js</code>: <code>removeFamilyMember:1502, 1515, 1527, 1536</code>, <code>deleteClient:1595</code>. According to the audit, the event is also sent when a member is detached from a family while the account remains and is not marked DELETED.'],
    ['<code>CREATE_SUBSCRIPTION</code>', '<code>AgentController.js</code>: <code>sendPlusSubSms:1438</code>; <code>UserSubscriptionController.js</code>: <code>__updateCommision:1776</code>, <code>_sendPlusSubSmsFromAgentController:2120</code>; <code>PaymentController.js</code>: <code>updateBankApprovalStatus:2473</code>'],
    ['<code>UPDATE_SUBSCRIPTION</code>', '<code>UserSubscriptionController.js</code>: <code>updateUserSubscriptionStatus:1457</code>, <code>__applyCardBlockStatusChange:1863</code>, <code>userSubscriptionRecovery:2260</code>; <code>Agent/AgentRegClient.js</code>: <code>addNewMemberToSubscription:413</code> (for the parent); <code>GalilRequestsController.js</code>: <code>blockUserSubscription_Galil:330</code>; <code>TranzilaWebhookController.js</code>: <code>applyAutomationActions:659</code>; <code>ReplacedController.js</code>: <code>applyActions:696</code>; <code>Modules/Scheduler.js</code>: <code>autoPrepaymentBlock:208</code>'],
    ['<code>CANCEL_SUBSCRIPTION</code>', '<code>UserSubscriptionController.js</code>: <code>canceledSubscription:649</code>; <code>GalilRequestsController.js</code>: <code>cancelUserSubscription_Galil:252</code>; <code>Services/FutureCancellationRunner.js</code>: <code>runPostCommitSideEffects:331</code>']
].map(([e, w]) => [e, w, 'Sends a snapshot to the Make webhook (only when <code>NODE_ENV</code> → prod)', 'Not connected directly; CallMarker has its own events — see section 6'])

// ---- Contact Us
const contactEntry = [
    ['<code>SITE</code>', '<code>POST /kaveret/contact-us</code> — public route (as before)', 'Body <code>{params:{name, phone}}</code>. The name is split on whitespace: the first word → <code>name</code>, everything else → <code>last_name</code>; both parts are required. Name ≤ 200 characters, phone ≤ 30.', he('אתר Mediwho'), 'Kaveret landing page for the website (<code>contactUsKaveret</code>), previous source spelling <code>אתר MediWho</code>'],
    ['<code>APP</code>', '<code>POST /app-users/kaveret-contact</code> — <code>appSession</code> group; the controller re-validates <code>jwtAppUser</code>', 'The request body is not read: <code>name</code>, <code>last_name</code> and <code>phone</code> are taken from the authenticated <code>app_users</code> row. <code>first_name</code> is not split; an empty last name is allowed and is sent as <code>\'\'</code>.', he('אפליקציית +60'), 'Separate Kaveret landing page for the app (<code>contactUsKaveretApp</code>); <code>birthday</code> is passed only to this Kaveret branch']
]
const contactResponses = [
    ['Website: valid input', '<code>200 {STATUS:\'OK\'}</code> immediately, before CRM delivery completes.'],
    ['Website: invalid input', '<code>400 {error:\'INVALID_CONTACT_US\'}</code>, no event is fired.'],
    ['App: no <code>jwtAppUser</code> session', '<code>401</code>; an exception during validation or the read → <code>500</code>. This is separate from data validation.'],
    ['App: account phone equals <code>APP_REVIEW_PHONE</code>', '<code>200 {STATUS:\'OK\'}</code> before any validation or sending: no event, no CRM, no email.'],
    ['App: no <code>first_name</code> or phone', '<code>400 {error:\'INVALID_CONTACT_US\'}</code>, no event is fired.'],
    ['App: valid data', '<code>200 {STATUS:\'OK\'}</code> immediately, before CRM delivery completes.'],
    ['Failure to fire the event (both sources)', 'Logged (code only); the response to the client is unchanged; there is no fallback email.']
]
const contactPayload = [
    ['<code>name</code>, <code>last_name</code>', 'From the controller (see above).'],
    ['<code>number</code>', '<code>normalizePhone(phone, \'972\')</code> + <code>callMarkerNumber</code>: an Israeli number → local form <code>0…</code> (the same temporary format as in the customer test); an explicitly foreign number (<code>+</code>/<code>00</code>) → E.164 plus <code>international=\'1\'</code>. A number that cannot be normalized is not sent to CallMarker (<code>PHONE_NOT_SENDABLE</code>).'],
    ['<code>source</code>', 'Set by the server according to the origin.'],
    ['<code>campaign</code>', 'By environment (table below).'],
    ['<code>ignore_duplicates</code>', '<code>\'1\'</code> — set explicitly in the Contact Us fields; not added globally to all requests.'],
    ['custom_field_16901 (env)', 'From <code>NODE_ENV</code>; the ID is shared across all environments.'],
    ['Lifecycle checkboxes', 'Before the write, the card is looked up by number via API v2 (<code>CALLMARKER_ACCESS_TOKEN</code>). New number → is_lead <code>"1"</code> and the other three <code>"0"</code>; one card → promotion only (registered, customer, former customer and agent-customer are not reset to lead); several cards, no token or an error → checkboxes are not sent. is_agent and is_test are never sent.'],
    ['<code>token</code>', 'Added inside <code>CallMarker.sendCustomer</code>.']
]
const contactEnv = [
    ['<code>development</code>', 'Not called', 'Not called', 'No (mocks only)'],
    ['<code>stage</code>', 'Not called (network policy; 13565 is only the mapping for dry runs)', 'Not called', 'No'],
    ['<code>production</code> + <code>CALLMARKER_ENABLED=true</code>', camp('LEADS_CAMPAIGN', '13558', 'לידים'), 'Landing page by origin: <code>SITE</code> → website, <code>APP</code> → app', 'On failure of either CRM'],
    ['<code>production</code>, <code>CALLMARKER_ENABLED</code> not exactly <code>true</code>', 'Not called (<code>CALLMARKER_DISABLED</code>, not a failure)', 'As before, independently', 'On Kaveret failure only'],
    ['Another <code>NODE_ENV</code> that Kaveret reads as production (<code>prod</code>, <code>test</code>, absent)', 'Not called (network policy)', 'As before (Kaveret rule unchanged)', 'On Kaveret failure only']
]
const reasons = [
    ['<code>DUPLICATE</code>', 'Body contains “Duplicate customer”: the CRM rejected it as a duplicate; the data was not updated by this operation. Also observed for a number from another campaign.'],
    ['<code>INVALID_NUMBER</code>', 'Body contains “Invalid number format”: verify the number value, country and format.'],
    ['<code>HTTP_ERROR</code>', 'Non-2xx status (CallMarker or Kaveret): success not confirmed.'],
    ['<code>TIMEOUT</code>', 'No response within 15 s: delivery is <strong>uncertain</strong> (the CRM may have processed the request); no retry.'],
    ['<code>NETWORK_ERROR</code>', 'Network error: delivery is uncertain; no retry.'],
    ['<code>NOT_CONFIGURED</code>', 'No <code>CALLMARKER_TOKEN</code>: nothing was sent.'],
    ['<code>PHONE_NOT_SENDABLE</code>', 'The phone could not be normalized: CallMarker was not called.'],
    ['<code>UNEXPECTED_RESPONSE</code>', 'Any other response: success not confirmed.'],
    ['<code>INTERNAL</code>', 'Unexpected exception during delivery: success not confirmed.']
]

// ---- lifecycle (approved, not implemented)
const syncContexts = [
    ['<code>AGENT_REGISTRATION</code>', '<code>RegistrationController.regAgent</code> (via the helper <code>fireCallMarkerSync</code> in <code>RegistrationController.js</code>): OTP branch — new agent and repeat registration (200); login branch — after the roles are saved (200). Does not fire: an existing agent on the login branch (206), agency not found, wrong code, save error, the code-sending step.', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), he('אתר Mediwho')],
    ['<code>CUSTOMER_CREATION</code>', '<code>regUser</code> (<code>POST /registration</code>, the branch with a verified OTP) and <code>createUser</code> (<code>POST /registration/user</code>). Does not fire: OTP sending, wrong code, identity/birthday steps, login, agent registration, family members, creation by an administrator, <code>app_users</code> registration.', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), he('אתר Mediwho')],
    ['<code>AGENT_CUSTOMER_CREATION</code>', '<code>AgentController.regClient</code> (<code>POST /agent/reg-client</code>, <code>AgentController.js:1751</code>), new-customer branch only (201). Not connected: agent as a customer, existing Fly lead, family member, <code>POST /agent/reg-non-resident-client</code>.', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), he('אתר Mediwho')],
    ['<code>USER_PROFILE_UPDATED</code>', 'Only <code>UserController.editUser</code> (<code>PUT /user/user-data</code>), after a successful save, when a mapped field changed (<code>first_name</code>, <code>last_name</code>, <code>email</code>, <code>birthday</code>, <code>hmo_id</code>, <code>hmo_plan_id</code>, <code>fathers_name</code>). PATCH /user/edit-info is connected separately; a family member is skipped (<code>FAMILY_PROFILE_PENDING_DECISION</code>).', 'One existing active membership matching MediWho classification', 'not sent'],
    ['<code>AGENT_ADDRESS_UPDATE</code>', '<code>AddressController.createAddress</code> (<code>POST /address</code>, type AGENT, <code>AddressController.js:99</code>), only when the user has their own agent role.', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), 'not sent'],
    ['<code>SUBSCRIPTION_ACTIVATED</code>', '<code>PaymentController.addSubscriptionPayment</code> (<code>POST/PUT /payment-info</code>), <code>PaymentController.updateBankApprovalStatus</code> and <code>UserSubscriptionController.updateBlockedCardUserSubscriptionStatus</code>: a row that was <strong>not</strong> ACTIVE when loaded is saved as ACTIVE; <code>UserSubscriptionController.createCollectiveSubscription</code> (<code>POST /user-subscription/collective</code>): a new collective purchase after a successful <code>addSubscriptionPayment</code>. All through the local helper <code>fireCallMarkerSubscriptionActivated</code> (a separate copy in each of the two controllers). Not connected: manual activation of other statuses, import, administrative tariff replacement, group creation (unblocking is a separate context), STO renewals, Fly/RDG, family members.', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'not sent'],
    ['<code>SUBSCRIPTION_CANCELED</code>', 'An ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED cancellation: <code>UserSubscriptionController.canceledSubscription</code> (<code>POST /user-subscription/canceled-subscription</code>), <code>GalilRequestsController.cancelUserSubscription_Galil</code> (<code>POST /galil/cancel-user-subscription</code>) and <code>FutureCancellationRunner.runOne</code> (scheduled future cancellation execution; the cron runs in production only and cancels ACTIVE only) — through the local helper <code>fireCallMarkerSubscriptionCanceled</code>; the event carries <code>cancellation_request_id</code> (except manual cancellation). At run time a family member (<code>FAMILY_MEMBER_PENDING_DECISION</code>) and a stale event when an ACTIVE personal subscription already exists (<code>ACTIVE_SUBSCRIPTION_EXISTS</code>) are skipped. Not connected: other statuses → CANCELED (CARD_BLOCKED, AWAITING_BANK_APPROVAL), old rows canceled by a purchase or tariff replacement, arbitrary status updates, agent subscriptions, Fly/RDG.', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), 'not sent'],
    ['<code>SUBSCRIPTION_RECOVERED</code>', '<code>UserSubscriptionController.userSubscriptionRecovery</code> (<code>PUT /subscription-recovery</code>) through <code>fireCallMarkerSubscriptionRecovered</code>: only a CANCELED row saved as ACTIVE, with a known non-AGENT tariff. A restoration to BLOCKED goes as <code>SUBSCRIPTION_BLOCKED</code>; a family member is skipped (<code>FAMILY_MEMBER_PENDING_DECISION</code>).', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'not sent'],
    ['<code>SUBSCRIPTION_BLOCKED</code>', 'ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER and CANCELED → BLOCKED (recovery with <code>blocked_cancel</code>), through <code>app/Utils/callMarkerEvents.js</code>: <code>UserSubscriptionController.updateUserSubscriptionStatus</code> (<code>PUT /update-subscription-status</code>, individual and collective branches), <code>GalilRequestsController.blockUserSubscription_Galil</code>, <code>Scheduler.autoPrepaymentBlock</code>, <code>ReplacedController.applyActions</code>, <code>TranzilaWebhookController.applyAutomationActions</code>, <code>UserSubscriptionController.userSubscriptionRecovery</code>. Not connected: CARD_BLOCKED, a move between BLOCKED and AWAITING_BANK_TRANSFER.', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'not sent'],
    ['<code>SUBSCRIPTION_UNBLOCKED</code>', 'BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE through <code>UserSubscriptionController.updateUserSubscriptionStatus</code> (an administrative status update, not a purchase; note ' + he('הוסדר תשלום') + '). Bank approval (AWAITING_BANK_APPROVAL → ACTIVE through <code>updateBankApprovalStatus</code>) and activation from CARD_BLOCKED stay purchases (<code>SUBSCRIPTION_ACTIVATED</code>).', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'not sent']
]
const routing = [
    ['Contact Us', camp('TESTS_CAMPAIGN', '13565', 'בדיקות'), camp('LEADS_CAMPAIGN', '13558', 'לידים')],
    ['Agent registration and agent address', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), camp('AGENTS_CAMPAIGN', '13567', 'סוכנים')],
    ['Customer creation (website and agent)', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי')],
    ['Subscription activation (customer + opportunity)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Cancellation (customer + Not purchased opportunity)', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר')],
    ['Recovery (customer + Purchased opportunity)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Blocking and unblocking (customer + opportunity)', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות')],
    ['Customer test', camp('TESTS_CAMPAIGN', '13565', 'בדיקות'), 'Closed (404)']
]
const lifeFlags = [
    [cf(16987), '<code>custom_field_16988</code> (is_lead(S))', 'Contact Us: new number; promotion only'],
    [cf(16997), '<code>custom_field_16999</code> (is_registered_without_subscription(S)), not 16998', 'Customer creation (website and agent); promotion only'],
    [cf(16991), '<code>custom_field_16992</code> (is_customer(S))', 'Activation, recovery, blocking and unblocking; confirmed transition'],
    [cf(16995), '<code>custom_field_16996</code> (is_former_customer(S))', '<code>"1"</code> only on cancellation (<code>SUBSCRIPTION_CANCELED</code>); confirmed transition'],
    [cf(16993), '<code>custom_field_16994</code> (is_agent(S))', 'Independent; <code>"1"</code> only for the user’s own agent role'],
    [cf(16989), '<code>custom_field_16990</code> (is_test(S))', 'No flow sends it; only explicitly authorized tests']
]
const lifecycle = [
    ['Contact Us (website or app)', camp('LEADS_CAMPAIGN', '13558', 'לידים'), 'is_lead (promotion only)', '<strong>Implemented</strong> (production; 13565 on stage)'],
    ['User registration on the website and by an agent', camp('REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי'), 'is_registered_without_subscription (promotion only)', '<strong>Implemented</strong>'],
    ['Agent registration and agent address', camp('AGENTS_CAMPAIGN', '13567', 'סוכנים'), 'No transition; is_agent', '<strong>Implemented</strong>'],
    ['A personal subscription became ACTIVE, including repurchase, upgrade and collective purchase', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (confirmed transition)', '<strong>Implemented</strong> together with the automatic Purchased opportunity'],
    ['ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED cancellation (manual, Galil; scheduled — from ACTIVE only)', camp('FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר'), 'is_former_customer (confirmed transition); is_blocked = <code>"0"</code>', '<strong>Implemented</strong> together with a separate Not purchased opportunity and a reason ID'],
    ['Blocking: ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, CANCELED → BLOCKED', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (confirmed transition); is_blocked = <code>"1"</code>', '<strong>Implemented</strong> together with a separate Not purchased opportunity (reason 367)'],
    ['Unblocking: BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (confirmed transition); is_blocked = <code>"0"</code>', '<strong>Implemented</strong> together with a separate Purchased opportunity (' + he('הוסדר תשלום') + ')'],
    ['CANCELED → ACTIVE recovery', camp('CUSTOMERS_CAMPAIGN', '13566', 'לקוחות'), 'is_customer (confirmed transition)', '<strong>Implemented</strong> together with a new Purchased opportunity (<code>product_field_1060</code>)'],
    ['CARD_BLOCKED and AWAITING_BANK_APPROVAL → CANCELED, a move between BLOCKED and AWAITING_BANK_TRANSFER, EXPIRED, etc.', '—', 'Unchanged', 'Not synced; CARD_BLOCKED alone does not set is_blocked (activation from CARD_BLOCKED and bank approval are purchases)'],
    ['Manual activation of other statuses (<code>PUT /update-subscription-status</code>; its blocking and unblocking are connected)', '—', '—', 'Not connected; deferred'],
    ['<code>PUT /user/user-data</code>; <code>PATCH /user/edit-info</code>; <code>PATCH /user/edit-agent-info</code>', 'Existing eligible membership by MediWho classification', 'No checkboxes or Opportunity', 'Birthday, fathers_name, HMO: stage confirmed by user, 2026-10-26; <code>PATCH /user/edit-agent-info</code>: stage confirmed by user, 2026-10-26; not every branch verified, production not verified'],
    ['<code>PUT /agent/client-info</code> (HMO, plan, father’s name)', 'Existing eligible membership by MediWho classification', 'Only the three changed fields; no checkboxes or Opportunity', 'Stage confirmed by user, 2026-10-26; production not verified'],
    ['Purchase, cancellation, recovery, blocking or unblocking of an own (non-AGENT) subscription of a user with their own <code>agent</code>/<code>insurance_agent</code> role', 'The event’s campaign (purchase, blocking, unblocking, recovery — 13566; cancellation — 13568) <strong>plus</strong> 13567 and every earlier active membership preserved', 'As for a customer; <code>is_agent</code> = <code>"1"</code>', '<strong>Implemented</strong> (details in section 6). Purchase: confirmed by the user on stage on 2026-10-29 (overall message, scope inferred from the accompanying task). The other four: ' + PEND + '. Production not verified'],
    ['Cancellation, recovery, blocking or unblocking for a family member (<code>parent_id</code>)', '—', '—', 'Intentionally skipped (<code>FAMILY_MEMBER_PENDING_DECISION</code>, log only)'],
    ['Fly / RDG', '—', '—', 'Excluded']
]
const oppFields = [
    ['<code>product_id</code>', '<code>subscriptions.callmarker_product_id</code> of the tariff of the exact event row — the internal CallMarker product ID', 'No value or not a positive integer → <code>PRODUCT_MAPPING_MISSING</code> / <code>PRODUCT_MAPPING_INVALID</code>: the opportunity is not sent, the customer is written without opportunity fields, email to user 84'],
    ['<code>opportunity_crm_id</code>', '<code>user_subscriptions.subscription_id</code> — the tariff, not the purchase', 'Not an idempotency key'],
    ['<code>opportunity_price</code>', '<code>user_subscriptions.price</code> of the exact row as stored', 'Invalid price → <code>PRICE_INVALID</code>: the opportunity is not sent. If the product price is closed, CallMarker uses the catalog price'],
    ['<code>opportunity_status</code>', '<code>"2"</code> — purchase, recovery, unblocking; <code>"3"</code> — cancellation, blocking', 'Always a separate new opportunity; the existing opportunity is not changed'],
    ['<code>opportunity_agent_name</code>', 'Trimmed <code>users.callmarker_agent_name</code> of the user from <code>provided_by</code>: the exact CallMarker user Name or that user’s configured CRM Name', 'Only if not empty (<code>AGENT_NAME_NOT_CONFIGURED</code>); the MediWho name is not substituted'],
    ['<code>product_field_1057</code>', 'Provider: <code>first_name</code> + <code>last_name</code> + “ - ” + <code>users.id</code>, plain text without a link', 'No provider or name — the value is skipped'],
    ['<code>product_field_1058</code>', '<code>products.name</code> of the purchased tariff: <code>MIN(product_subscriptions.id)</code>, <code>products.active = 1</code>', 'Not found — skipped (<code>PRODUCT_NAME_UNRESOLVED</code>)'],
    ['<code>product_field_1059</code>', '<code>user_subscriptions.id</code>', 'Links to the subscription row, not to the event: all opportunities of the same row share the value; not a unique key'],
    ['<code>product_field_1060</code>', he('שחזור מנוי') + ' — recovery; ' + he('הוסדר תשלום') + ' — unblocking', 'Not sent on purchase, cancellation or blocking'],
    ['<code>product_field_1061</code>', 'The <code>msg</code> of the first message of the exact verified request — only a cancellation from BLOCKED / AWAITING_BANK_TRANSFER with reason <code>RETURNED_CHARGE</code>, <code>DENIAL_OF_TRANSACTION</code> or <code>BLOCKING_PAYMENT_METHOD</code>', 'Unknown, missing, foreign or unreadable request, another reason, an empty or malformed message — not sent'],
    ['<code>opportunity_not_purchased_reason_id</code>', 'Only with status 3: blocking — <code>367</code>; cancellation — by the exact request’s reason, otherwise <code>378</code>', 'Table below; Simple API acceptance is not verified']
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
    ['— (blocking)', '<code>367</code>', he('חסימת מנוי')],
    ['— (unknown, fallback)', '<code>378</code>', he('לא ידוע')]
]
const oppVerified = [
    ['An internal CallMarker product ID is required', '<code>7794</code> created an opportunity; <code>user_subscriptions.id</code>, <code>subscriptions.id</code> and the table row number did not'],
    ['Direct creation as Purchased', 'Works'],
    ['Agent assignment', 'Live matching was confirmed for the Name “Yuval Kopel REP” (CallMarker agent 13619). Unknown or unmatched names did not prevent closing, but the assignment stayed empty. CRM Name matching was not tested'],
    ['Closing an open opportunity', 'Opened → Purchased and Opened → Not purchased updated the <strong>same</strong> open opportunity'],
    ['Status without an open opportunity', '<code>status</code> 2 or 3 without an open opportunity created <strong>another</strong> closed opportunity'],
    ['Duplicates', 'Repeated <code>opportunity_crm_id</code> values did not prevent duplicates'],
    ['Product fields', '1057/1058/1059 were preserved on closing']
]
const oppTests = [
    ['1', 'POST: <code>product_id=7794</code>, <code>opportunity_crm_id=192</code>, <code>opportunity_price=90</code>', 'Created opportunity <code>1441001</code>: status 1 / Opened, price 90, <code>campaign_id = null</code>, <code>user_id = null</code>.'],
    ['2', 'Next POST: the same + <code>opportunity_status=2</code>, <code>opportunity_agent_name=' + he('אבישי קס') + '</code>', 'The <strong>same</strong> opportunity <code>1441001</code>: status 2 / Purchased, <code>campaign_id = 13565</code>, <code>user_id = null</code>; no additional opportunity appeared.']
]

// ---- existing /new-client flow (frontend repo @ 0b94d80c9, API repo)
const FE = s => `<code>frontend/src/${s}</code>`
const newClientSteps = [
    ['Parameter capture', `${FE('pages/_app.js:20–30, 97–103')}. If the URL contains one of the marker strings (<code>isNewClient</code> among them) and parsing found at least one pair, all pairs are saved to <code>authStore.serviceUrlDetails</code> together with <code>ref_url</code> (the full URL). There is no dedicated <code>/new-client</code> route in the source code: the path falls into the generic <code>PublicRouter</code> (${FE('pages/routes.js:129')}), and the behavior is determined by the parameters.`],
    ['URL parsing', `${FE('utils/urlChecker.js:14–26')}, function <code>getUrlParams</code>. The regular expression <code>[?&amp;]+([^=&amp;]+)=([^?&amp;]*)</code> treats both <code>?</code> and <code>&amp;</code> as separators, so a link with repeated <code>?</code> is parsed the same way as one with regular <code>&amp;</code>. Values go through <code>decodeURIComponent</code>; <code>+</code> is not turned into a space; an unescaped <code>?</code> or <code>&amp;</code> inside a value truncates it. Line 18 (<code>url.replace(/^[?&amp;]+/, '')</code>) does not store its result and effectively does nothing. Standard parsing (<code>URLSearchParams</code>, the server, logs) would interpret a link with repeated <code>?</code> differently: everything after the first <code>?</code> would become a single value of the first parameter.`],
    ['Agent not logged in', `${FE('pages/index.js:60–66')} → <code>myServicesUrlLogin</code> (${FE('utils/urlChecker.js:62–68')}): if <code>isNewClient</code> is non-empty — redirect to the agent login <code>/auth/login/agent/step1</code>. The phone from the link is not prefilled on the login page when <code>isNewClient</code> is present (${FE('pages/AuthRouter/Login/index.js:28–31')}).`],
    ['Agent logged in', `<code>myServicesUrl</code> (${FE('utils/urlChecker.js:143–154')}): no <code>agent</code> or <code>insurance_agent</code> role → <code>logout(history, ref_url)</code>; role present → <code>/agent/client-list</code>. The truthiness of the <code>isNewClient</code> string is evaluated, so an empty value (<code>isNewClient=</code>) does not pass this step.`],
    ['Popup opening', `${FE('pages/AgentRouter/ClientList/index.js:85–87, 113–115')}: if the <code>isNewClient</code> key is present, the <code>agentAddClient</code> popup opens with <code>payload = {…link parameters, status: 'VALIDATE'}</code>.`],
    ['Prefill', `${FE('components/Popup/AgentAddClient/index.js:67–120')}: when <code>status === 'VALIDATE'</code>, the following are filled from the link: <code>firstName</code> and <code>lastName</code> (via <code>safeDecode</code>), <code>registerIdentity</code>, <code>registerEmail</code>, <code>registerPhone</code>, <code>registerBirthday</code>. For email, phone and identity an error flag is set first, until validation clears it. If a value matches the agent’s own data, the form substitutes the agent’s data (<code>onFieldChange</code>, lines 395–428).`],
    ['Validation', `${FE('forms/fieldsHelper.js')}: first and last name — <code>required|string</code>; identity — <code>required|digits:9|identityExists</code>; birth date — <code>required</code>; phone — <code>required|phoneExists</code> (on input only digits are kept, must start with 0 or 5, at most 10 digits); email — <code>required|email|string|emailExists</code>. The <code>*Exists</code> validators call <code>POST agent/validate-field</code> (${FE('forms/plugins.js')}).`],
    ['User creation', `<code>agentService.addClient</code> → <code>POST agent/reg-client</code> (${FE('utils/api.js:134')}). Body: identity, email (lowercased), phone (<code>phoneGenerator</code> strips leading <code>0</code>, <code>+</code> and <code>972</code>), first_name, last_name, birthday, lng and, if needed, portfolio_manager. For a non-resident, <code>POST agent/reg-non-resident-client</code> is used with passport and country code; these fields are not filled from the link.`],
    ['API processing', '<code>start/routes/agent.js:66</code> (<code>auth</code>, <code>is:(agent)</code>) → <code>AgentController.regClient:1694</code>. The birth date must be in <code>dd/MM/yyyy</code> format (<code>AgentRegClient.validateBirthdayReg:61</code>). If the identity matches the agent’s identity, the agent is registered as a customer. If an existing user (by identity or phone) with the <code>customer_fly</code> role is found, the data is merged, <code>regExistClient</code> is called, response 201. Otherwise <code>AgentRegClient.regNewClient:109</code>: email and phone duplicate validation, <code>User.create</code> (status <code>INCOMPLETE</code>, <code>agent_id</code> — the agent), an <code>Invitation</code> record (BLOCKED), event <code>incompleteByAgent::user</code>, response 201.'],
    ['MyBusiness', '<code>incompleteByAgent::user</code> → <code>Crm/Registration.createNewUserCrmByAgent</code>: looks up a MyBusiness lead (<code>api.mbapps.co.il</code>, Accounts class) by <code>PhoneNumber</code> and <code>Env</code>. If there is no lead, creates one (id_client, phone, name, identity, email, birthday, agent, etc.); if a lead named <code>CREATE_NEW_VISA_CAL</code> is found, updates it. This method has no <code>NODE_ENV</code> condition; the environment is passed in the <code>Env</code> field.'],
    ['Kaveret', '<strong>No customer snapshot is sent to Kaveret on this path</strong>: <code>regClient</code>, <code>regNewClient</code> and <code>regExistClient</code> do not call <code>kaveretSetDataBeforeSend::user</code>. Kaveret learns about the customer only from subsequent events, e.g. <code>CREATE_SUBSCRIPTION</code> when a subscription is placed (<code>AgentController.sendPlusSubSms:1438</code>), and only in prod.'],
    ['After creation', `${FE('components/Popup/AgentAddClient/index.js:197–250')}: new user (201) → product selection popup (<code>selectProduct</code> / <code>subModeSwitcher</code>); existing user (200) → <code>existingUser</code> message; already linked family member (202) → warning.`]
]

const fieldRows = [
    ['<code>campaign</code>', 'Customer test: constant <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> = <code>13565</code> (' + he('בדיקות') + ')', 'Yes; not changed by environment or request', OK + ' test 3: customer visible in the campaign', 'Confirmed'],
    ['<code>number</code>', '<code>users.phone</code> (+ <code>country_code</code> for normalization)', 'Yes; Israeli number temporarily in local form (<code>IL_LOCAL_TEMP</code>)', OK + ' local form, test 3', 'Identification key; normalization policy <strong>not decided</strong>'],
    ['<code>name</code>', '<code>users.first_name</code>', 'Yes', OK + ' test 4: change visible in the UI', 'Confirmed'],
    ['<code>last_name</code>', '<code>users.last_name</code>', 'Yes', 'Included, accepted (test 3)', 'Confirmed'],
    ['<code>email</code>', '<code>users.email</code>', 'Yes', 'Included, accepted (test 4)', 'Confirmed'],
    ['<code>crm_id</code>', '<code>users.id</code>', 'Yes', 'Included, accepted (test 4)', 'Confirmed; reference value, <strong>not</strong> a matching key'],
    ['<code>source</code>', 'Contact Us: by origin; sync: registration contexts', 'Customer test does not send it', 'Website: stage test confirmed by the user (details not provided)', 'Confirmed for Contact Us'],
    ['<code>ignore_duplicates</code>', 'Contact Us only: <code>\'1\'</code>', 'Customer test and sync do not send it', '“Duplicate customer” for a number from another campaign (the user’s report)', 'Confirmed for Contact Us'],
    ['<code>env</code> (top level)', '—', 'Not sent', 'Tests 4–5: accepted without error, ignored; test 7: removed', 'Not supported; replaced by field 16901'],
    [cfS(16867), '—', 'Not sent (<code>NOT_USED</code>)', 'Not sent', 'Currently unused'],
    [cfS(16868), '<code>users.identity</code>', 'Yes, as a string', T5, 'Confirmed'],
    [cfS(16869), '<code>users.birthday</code>', 'DD-MM-YYYY', 'API v2: YYYY-MM-DD', "Stage confirmed by user, 2026-10-26; overall confirmation, not per-branch evidence. Production not verified."],
    [cfS(17022), '<code>users.fathers_name</code>', 'Text; own user; trimmed', 'Empty → omitted', "Stage confirmed by user, 2026-10-26; overall confirmation, not per-branch evidence. Production not verified."],
    [cfS(16873), '<code>users.passport</code>, if present', 'Yes (any non-NULL value)', 'Not verified: empty for the selected user', 'Confirmed; see the column type discrepancy'],
    [cfS(16874), 'Enums; Hebrew name only', 'Unknown ID → omitted', 'No ID or parentheses', "Stage confirmed by user, 2026-10-26; overall confirmation, not per-branch evidence. Production not verified."],
    [cfS(16875), 'Enums; Hebrew name only', 'Unknown ID → omitted', 'No ID or parentheses', "Stage confirmed by user, 2026-10-26; overall confirmation, not per-branch evidence. Production not verified."],
    [cfS(16876), 'Kaveret snapshot: <code>products.id</code>', 'Yes', T5 + ' (with the previous value at the time)', 'Confirmed (since 2026-10-14)'],
    [cfS(16877), 'Kaveret snapshot: <code>products.name</code>', 'Yes', T5 + ' (with the previous value at the time)', 'Confirmed (since 2026-10-14)'],
    [cfS(16878), 'Kaveret logic: <code>users.status = DELETED</code>', 'Yes, <code>"1"</code>/<code>"0"</code>', 'No', 'Confirmed; Selectbox acceptance of 1/0 not verified'],
    [cfS(16879), 'Own calculation: BLOCKED or AWAITING_BANK_TRANSFER, including family; CARD_BLOCKED does not count', 'Yes, <code>"1"</code>/<code>"0"</code>; explicitly in the blocking, unblocking and cancellation contexts', 'No', 'Confirmed; Selectbox acceptance of 1/0 and blocking on stage not verified'],
    [cfS(16880), 'Kaveret logic: <code>blocked_users</code>', 'Agents only, <code>"1"</code>/<code>"0"</code>', T5, 'Confirmed'],
    [cfS(16881), '<code>users.created_at</code>', 'Yes, <code>YYYY-MM-DD HH:mm:ss</code> without time zone', T5, 'Confirmed; time zone open'],
    [cfS(16882), '<code>users.parent_id</code>', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16883), 'Parent first_name + last_name', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16884), 'Parent phone', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16885), 'Parent email', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16886), 'Customer <code>related_as</code>, Kaveret translations', 'Yes; otherwise placeholder ' + he('לא הוזן'), EMPTY, 'Translations confirmed'],
    [cfS(16887), 'Own agent, otherwise the parent’s agent', 'Yes', T5, 'Confirmed'],
    [cfS(16888), 'Agent first_name + last_name', 'Yes', T5, 'Confirmed; informational only'],
    [cfS(16889), 'Agent phone', 'Yes', T5, 'Confirmed'],
    [cfS(16890), 'Agent email', 'Yes', T5, 'Confirmed'],
    [cfS(16891), 'Agent mentor', 'Yes', T5, 'Confirmed'],
    [cfS(16892), 'Agent <code>parent_agency_id</code>', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16893), 'Proposed: agency user name', 'Not sent (<code>PENDING_CONFIRMATION</code>)', 'No', '<strong>Not confirmed</strong>: source and approval open'],
    [cfS(16894), 'Agency user phone', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16895), 'Agency user email', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16896), 'Agency user mentor', 'Yes', EMPTY, 'Confirmed'],
    [cfS(16897), '—', 'Not sent (<code>NOT_USED</code>): one value came back truncated at 255 characters', OK + ' test 6 (sent at the time)', 'Not used'],
    [cfS(16898), 'Customer and parent addresses', 'Yes, readable text; provisional 255-code-point integration cap', EMPTY + '; see discrepancy', 'Confirmed'],
    [cfS(16899), 'Kaveret role labels in Hebrew', 'Yes, plain text joined with “, ” (in the code since 2026-10-18; previously JSON)', OK + ' test 6 (JSON): display confirmed', 'Format approved; ' + PEND],
    [cfS(16901), '<code>NODE_ENV</code>: development → dev, stage → stage, otherwise prod', 'Yes, in all flows; shared ID', OK + ' test 7, option “dev”', 'Confirmed; “stage”/“prod” not verified separately'],
    [cfS(16900), '—', 'Not sent', '—', 'Not used'],
    [cfS(16987), 'Contact Us', 'Yes', 'Verified (the user’s report)', 'Confirmed'],
    [cfS(16997), 'Customer creation', 'Yes', 'Verified (the user’s report)', 'Confirmed'],
    [cfS(16991), 'Activation, recovery, blocking, unblocking', 'Yes', 'Verified (the user’s report)', 'Current implementation behavior'],
    [cfS(16995), 'ACTIVE → CANCELED cancellation', 'Yes, <code>"1"</code> on cancellation, otherwise <code>"0"</code>', 'Confirmed by the user on stage', 'Confirmed'],
    [cfS(16993), 'Own agent role', 'Yes, only <code>"1"</code>', 'Verified (the user’s report)', 'Confirmed'],
    [cfS(16989), 'Authorized tests only', 'Not sent by the flows', 'Verified (the user’s report)', 'Confirmed'],
]

const liveRows = [
    ['1', '<code>+972550824042</code> + <code>international=1</code>', 'Full set', '200', '“Invalid number format”', 'Rejected. The number is unsuitable as test data.'],
    ['2', '<code>0540824042</code>, local form', 'Full set', '200', '“Invalid number format”', 'Rejected. The number is unsuitable as test data.'],
    ['3', '<code>0502345678</code>, local form', 'Minimal: campaign, number, name, last_name', '200', '“Customer has been added successfully”', 'Customer created (visible in the UI).'],
    ['4', 'Same number', '+ <code>crm_id</code>, <code>email</code>, top-level <code>env</code>, changed <code>name</code>', '200', 'Same text', 'Existing customer updated, no duplicate. Top-level <code>env</code> ignored.'],
    ['5', 'Same number', '+ simple custom fields (contents in <a href="#st-fields">section 8</a>); top-level <code>env=dev</code>', '200', 'Same text', 'Accepted. Top-level <code>env</code> ignored again.'],
    ['6', 'Same number', 'Test 5 set + ' + cf(16897) + ' (361 characters / 393 bytes) and ' + cf(16899) + '; ' + cf(16898) + ' empty and not sent', '200', 'Same text', 'Accepted; the user confirmed the JSON display.'],
    ['7', 'Same number', 'Full set; top-level <code>env</code> removed; added ' + cf(16901) + ' = <code>dev</code>', 'Not recorded', 'Not recorded', 'The user confirmed in the UI: env option “dev” is saved and displayed.']
]

const deferred = [
    ['Other status transitions (CARD_BLOCKED and AWAITING_BANK_APPROVAL → CANCELED, a move between BLOCKED and AWAITING_BANK_TRANSFER, expiry)', 'Not connected'],
    ['Manual activation, import, administrative tariff replacement, group creation, STO renewals', 'Not connected'],
    ['Fly / RDG', 'Excluded'],
    ['Clearing ' + cf(16876) + ' / ' + cf(16877) + ' after a cancellation', 'Unresolved'],
    ['Simple API acceptance of reason IDs 367–378 and their return through API v2', 'Not verified'],
    ['Remaining registration branches (agent as a customer, existing Fly lead, a family member’s customer card, non-resident; a new relative goes only to model 208 through <code>family_details</code>)', 'Not connected'],
    ['Permanent opportunity duplicate protection and payment idempotency', 'Deferred by the user'],
    ['Family-member behavior (own, shared or missing phone); in the cancellation, recovery, blocking and unblocking contexts — skipped with <code>FAMILY_MEMBER_PENDING_DECISION</code>', 'Deferred'],
    ['Persistence of campaign membership and sync state', 'Deferred'],
    ['Multi-campaign operations', 'Unresolved; waiting for an answer from CallMarker support'],
    ['Neutral updates of a combined agent + customer card', 'Can stop with <code>CLASSIFICATION_AMBIGUOUS</code>; the campaign choice is deferred (agents’ subscriptions are supported, section 6)'],
    ['Payment and commission concurrency', 'Unresolved'],
    ['Customer profile edits through other routes (except <code>PUT /user/user-data</code>, <code>PATCH /user/edit-info</code>, <code>PATCH /user/edit-agent-info</code>, <code>PUT /agent/client-info</code> (three fields only) and the agent address)', 'Not synced'],
    ['<code>source_medium</code> / <code>source_campaign</code>', 'Not connected'],
    ['Standard <code>agent_name</code> (assigning an agent to a customer)', 'Not connected'],
    ['<code>note</code>, <code>followup_*</code>, <code>funnel_id</code>, <code>campaign_funnel_id</code>, <code>reset</code>, <code>unique</code>, <code>status</code>, <code>not_interested_reason_id</code>, <code>min_hour</code>, <code>max_hour</code>, <code>blacklisted</code>, <code>duplicate_days</code>, <code>remove</code>, <code>attachment</code>', 'Not connected'],
    ['CallMarker-side generation of <a href="#st-newclient">/new-client</a> links', 'Not approved'],
    ['Appointment parameters (<a href="#appointments">section 7</a>)', 'Deferred entirely'],
    ['Inbound Messages (<a href="#messages">section 8</a>)', 'Deferred entirely']
]


const tempRows = [
    ['Test endpoint protection <code>auth</code> + <code>is:(admin or developer)</code>', '<strong>Present</strong>: <code>start/routes/call-marker.js:9</code>, since commit <code>ac3ecdd09</code> (2026-10-12). History: on 2026-10-11 it was commented out.', '—'],
    ['Temporary handling of Israeli phone numbers', '<strong>Active</strong>: <code>callMarkerNumber</code> in <code>app/Utils/callMarkerCustomer.js:262</code> (<code>IL_LOCAL_TEMP</code>); used by all flows', 'Decide the phone policy, then make the temporary branch permanent or remove it.'],
    ['Option values of ' + cf(16901), '“dev” confirmed by test 7; “stage”/“prod” not verified separately (comment in <code>callMarkerCustomer.js:451–452</code>)', 'Reconcile the option texts with the field settings.'],
    ['255 cap for the address', 'Provisional integration cap for the address only (based on one subscriptions value that came back truncated at 255 characters). <code>roles</code> has no cap in the code', 'Confirm the actual field limits in CallMarker.'],
    ['Test customer data', 'Changed during live tests', 'Whether to restore it is the user’s decision. This documentation does not change it.']
]

const diffRows = [
    ['API v2 return value of a ticked checkbox', 'Code comment (<code>checkboxState</code>) and <code>callmarker_instructions.md</code>: a ticked checkbox is returned as the option text (any non-empty string)', 'The user’s report: a ticked checkbox came back as the string <code>"1"</code>', 'Compatible: the code treats any non-empty string as ticked. Both sources are reflected.'],
    ['Phone description in API docs', '<code>callmarker_instructions.md</code> and the contract: “E.164 + <code>international=1</code>”', 'Code: Israeli numbers in local form (<code>IL_LOCAL_TEMP</code>)', 'The code is correct; the main text of the API docs is outdated.'],
    ['Customer matching', '<code>callmarker_instructions.md</code>: matching by <code>crm_id</code> / number is an open question', 'Confirmed by the user: the customer is identified by number', 'The user’s confirmation is accepted.'],
    [cf(16898), 'Repository log: “JSON-string fields 16897-16899” in test 6', 'The user’s report: in test 6 the field was empty and not sent', 'The user’s report is accepted; the field is now readable text.'],
    ['Cause of “Invalid number format”', 'Log: 054-0/055-0 numbers “appear to be unallocated ranges”', 'The user’s report: the numbers were unsuitable test data', 'Conclusion limited to the two specific numbers.'],
    ['Customer test environment', '<code>callmarker_instructions.md</code>: the manual test is described for stage', 'The user’s report: tests 1–7 were run in dev', 'The procedure in the document does not match the actual test environment.'],
    ['Type of <code>users.passport</code>', 'Migration <code>1573719515331</code> and <code>docs/models/users.yml</code>: <code>tinyint(1)</code>', 'Decision: send the passport number if present', 'The actual column type must be verified.'],
    ['Kaveret handover document', 'The audit references <code>docs/instructions/kaveret_crm_developer_handover.docx</code>', 'The file is not in the API repository', 'The /new-client flow is described from the source code.'],
    ['Status 3 in the API document', '<code>callmarker_instructions.md</code>, Lifecycle checkboxes section: “<code>opportunity_status=3</code> is never sent”', 'The code and the cancellation section of the same document: a cancellation sends <code>"3"</code> as a separate Not purchased opportunity', 'The code is right; the sentence in the API document is outdated.'],
    ['Earlier on this page (first revision of 2026-10-18)', 'Cancellation from ACTIVE only; no reason ID and no ' + 'product_field_1061; blocking and unblocking not connected; is_blocked from the Kaveret snapshot (BLOCKED only); ' + cf(16899) + ' as an uncommitted change', 'Commits <code>98ecc453f</code> and <code>dabf47e63</code> (2026-10-18)', 'Fixed; the earlier descriptions were replaced.'],
    ['API document on cancellation and recovery', '<code>callmarker_instructions.md</code>: Lifecycle table — “ACTIVE → CANCELED only”; recovery section — CANCELED → BLOCKED “customer and is_blocked only”', 'The code and the blocking table of the same document: cancellation also from BLOCKED / AWAITING_BANK_TRANSFER; CANCELED → BLOCKED sends Not purchased with reason 367 (no recovery opportunity)', 'The code is right; the API document wording is outdated or ambiguous.'],
    ['Earlier on this page (before 2026-10-18)', 'Cancellation and recovery not implemented, is_former_customer only <code>"0"</code>; the <code>AGENT_MEMBERSHIP_PENDING_SUPPORT</code> reason not emitted on cancellation; collective purchases not connected; ' + cf(16899) + ' as JSON', 'Commits <code>2282e8548</code>, <code>04b1126a5</code> and the API working tree (2026-10-18)', 'Fixed on 2026-10-18; historical test records are kept.'],
    ['Earlier on this page', 'Before 2026-10-15: opportunities “only prepared / delivery disabled”, <code>product_id</code> = <code>user_subscriptions.id</code>, field cards without “(S)” IDs and lifecycle checkboxes, “16900 does not exist”', 'Current code and the user’s confirmation', 'Fixed on 2026-10-15; the earlier statements are kept only as historical test records.']
]

const decisions = [
    ['Implemented flow', 'Contact Us, user sync and automatic opportunities (purchase, cancellation, recovery) are implemented; a successful stage verification is confirmed by the user', 'Production verification', 'Separate decision'],
    ['Campaigns', 'Contact Us → 13565/13558; agents → 13567; customer creation → 13569; purchase, recovery, blocking and unblocking → 13566; cancellation → 13568; test → 13565', 'Other (unconnected and manual) status transitions, manual activation of other statuses; campaign selection for neutral profile updates of a combined agent + customer card (<code>CLASSIFICATION_AMBIGUOUS</code>, deferred)', 'Approve the remaining transitions one by one; the campaign choice for combined cards is a business decision'],
    ['Multiple campaigns', 'Historically observed (test of 2026-10-14): a write with another campaign moved the customer — a risk, not a general current contract. Own (non-AGENT) subscriptions of agents (<code>agent</code> / <code>insurance_agent</code>) support purchase, cancellation, blocking, unblocking and recovery: the event’s campaign — 13566, 13568 for cancellation; <code>is_agent</code> and every earlier active membership are preserved and verified after the write; a moved or changed membership is reported as unconfirmed, with no automatic repair or retry; <code>unique</code> is prohibited', 'Neutral updates of a combined agent + customer card can stop with <code>CLASSIFICATION_AMBIGUOUS</code>', 'Campaign choice deferred (business decision)'],
    ['Lifecycle checkboxes', 'Implemented; API behavior verified (the user’s report)', 'Rule for replacing unclear checkboxes on purchase, cancellation and recovery', 'Approve separately'],
    ['Opportunities', 'Purchase, cancellation (Not purchased with a reason ID), blocking (Not purchased, 367), recovery (Purchased, ' + he('שחזור מנוי') + ') and unblocking (Purchased, ' + he('הוסדר תשלום') + ') are sent automatically; the open-opportunity guard applies to all except the purchase; post-write verification', 'Duplicate protection and payment idempotency (deferred); creation without agent_name; reason ID acceptance', 'Team decision; ' + PEND],
    ['Not purchased reasons', 'Cancellation — by the exact verified request, otherwise 378; blocking — 367; one account catalog', 'Simple API acceptance of 367–378 and return through API v2', PEND],
    [cf(16899), 'Plain text joined with “, ” is agreed; in the code since 2026-10-18', 'Deployment and live verification are not confirmed', PEND],
    ['Active product after cancellation', cf(16876) + ' / ' + cf(16877) + ' are omitted, not cleared', 'Clearing method', 'Agree and verify'],
    ['Opportunity agents', 'A Name is matched (confirmed live for “Yuval Kopel REP”); a CRM Name is also allowed but cannot be checked through API v2; an unknown name leaves the assignment empty', 'Filling in <code>users.callmarker_agent_name</code> for all providers', 'Administrator configuration'],
    ['Customer identification', 'Key — number; <code>crm_id</code> is a reference', 'Phone change; shared phone', 'Business decision'],
    ['Family members; membership and sync state', 'Deferred, except new-relative creation (<code>family_details</code>; confirmed by the user on stage on 2026-10-26)', 'Invitations, edits, removals, backfill; phone change; family-member opportunities (family_details does not connect them)', 'Decision later'],
    ['Payments', 'Sequential repeated callbacks are suppressed; concurrent ones are not', 'Payment and commission idempotency', 'Do not replay callbacks as a test'],
    ['Phone format', 'Israeli local form without flags accepted', 'E.164 with a valid number; foreign numbers', 'Separately authorized test'],
    ['Selectbox and dates', 'is_deleted/is_blocked are sent as 1/0; env “dev” confirmed', 'Acceptance of 1/0; “stage”/“prod” (birthday DD-MM-YYYY confirmed)', 'Controlled verification'],
    ['/new-client flow', 'Customer creation by an agent is synced (13569)', 'CallMarker-side link generation', 'Team decision'],
    ['Appointments and messages', 'Deferred', '—', 'Separate task']
]

module.exports = () => `
<section id="status" class="status-page">
<h2>CallMarker: integration status and open questions</h2>
<p class="meta-line">Summary as of 2026-10-18. Implementation — from reading the current API repository code; live tests — from the user’s reports and the log in <code>callmarker_instructions.md</code> (not reproduced here); Kaveret triggers — from the audit <code>docs/audits/kaveret-flow-scan-2026-10-07.md</code>; /new-client flow — from the frontend and API source code.</p>
<div class="legend status-legend">
  <div>${T.impl} present in the code now.</div>
  <div>${T.live} confirmed by a request to CallMarker.</div>
  <div>${T.dec} Mediwho business decision (may not be implemented yet).</div>
  <div>${T.open} no answer or no verification.</div>
  <div>${T.next} recommendation, nothing done yet.</div>
  <div>${T.exist} an existing Mediwho flow, not related to CallMarker.</div>
  <div>${T.lim} the user decided to leave it as is.</div>
</div>
<nav class="subtoc" aria-label="Summary sections"><strong>In this summary:</strong> ${SUB.map(([id, t]) => `<a href="#${id}">${t}</a>`).join(' · ')}</nav>

<div class="callout"><strong>Network policy (since 2026-11-02): CallMarker is production-only.</strong> Every CallMarker request — Simple API writes (customers; <code>number_change</code> and <code>family_details</code> through external-change) and API v2 reads (card lookup, read-back after a write, Opportunity and membership verification) — is allowed <strong>only</strong> when the raw values are exactly <code>NODE_ENV=production</code> <strong>and</strong> <code>CALLMARKER_ENABLED=true</code> (<code>callMarkerNetworkAllowed()</code> in <code>app/Utils/callMarkerAccess.js</code>, strict comparison of <code>process.env</code>). A missing or any other value disables CallMarker; <strong>the default is disabled</strong>. <code>NODE_ENV=prod</code>, <code>test</code> or an absent <code>NODE_ENV</code> do <strong>not</strong> authorize CallMarker (although the field mapping reads them as prod), nor does <code>CALLMARKER_ENABLED</code> = <code>1</code> / <code>TRUE</code>.</div>
${table(['Environment', '<code>NODE_ENV</code>', '<code>CALLMARKER_ENABLED</code>', 'CallMarker requests'], [
    ['Production', '<code>production</code>', '<code>true</code>', 'Yes; the two existing tokens are also required (values are not shown here)'],
    ['Stage', '<code>stage</code>', '<code>false</code>', 'No; even <code>CALLMARKER_ENABLED=true</code> cannot enable stage'],
    ['Local', '<code>development</code>', '<code>false</code>', 'No']
])}
${li([
    ['impl', 'The check runs at the start of every automatic flow (Contact Us, every sync context, <code>family_details</code>, <code>number_change</code>, the admin edit) and again in the transport (<code>postSimple</code>, <code>listV2</code>, <code>getV2Customer</code>). Disabled → <code>{ skipped: true, reason: \'CALLMARKER_DISABLED\' }</code> and one log line: no token read, lookup, write, verification, alert email or retry.'],
    ['impl', 'A configuration change takes effect only after the process is restarted or redeployed. To switch CallMarker off in production, set <code>CALLMARKER_ENABLED=false</code> (or remove the variable).'],
    ['impl', 'The stage custom-field IDs and campaign 13565 remain for dry runs, mock tests and historical records; the application currently has no network access from stage. The user’s stage confirmations below are dated and were made <strong>before</strong> this policy.'],
    ['impl', 'Kaveret keeps its existing rule (production = any <code>NODE_ENV</code> other than <code>development</code> and <code>stage</code>); the new strict CallMarker check did not change its environment classification. A disabled CallMarker in production does not disable Contact Us delivery to Kaveret.'],
    ['open', 'Enabling production (configuration, deployment, a live check) is not confirmed by this documentation: only the code is described here.']
])}
<h3 id="st-scope">1. Integration scope and triggers</h3>
${li([
    ['dec', 'Kaveret is gradually being replaced with CallMarker. MyBusiness stays in use.'],
    ['impl', 'Implemented: Contact Us (website and app); full syncs on agent registration, customer creation on the website and by an agent and the agent address; personal subscription activation with the <strong>automatic Purchased opportunity</strong>; cancellation (ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED, a separate Not purchased with a reason ID); recovery; blocking and unblocking; the neutral profile update (<code>PUT /user/user-data</code>, <code>PATCH /user/edit-info</code>, <code>PATCH /user/edit-agent-info</code>); restricted updates (<code>PUT /agent/client-info</code>, <code>PATCH /user/update-hmo-plans</code>, <code>PATCH /registration/hmo</code>, <code>PUT /registration/user</code>, the existing-user branches of <code>POST /registration</code>, <code>PATCH /user/add-client-email</code>, <code>POST /address</code> CLIENT); agent reassignment, agent blocking and user deletion; the phone change (<code>number_change</code>); a new relative (<code>family_details</code>); creation of a missing card with the full mapping. Kaveret is not replaced.'],
    ['live', 'Confirmed by the user on stage (overall confirmations without IDs, logs or per-case results): ordinary cancellation and recovery; <code>family_details</code>, <code>PUT /user/admin/change-phone</code>, <code>PATCH /user/edit-agent-info</code>, <code>PUT /agent/client-info</code>, <code>PATCH /user/update-hmo-plans</code>, <code>PATCH /registration/hmo</code>, <code>PUT /registration/user</code>, <code>POST /registration</code> (existing-user branches), <code>PATCH /user/add-client-email</code>, <code>POST /address</code> CLIENT, the birthday format, father’s name and HMO — 2026-10-26; missing-card creation (api-prod port audit, 2026-10-26); reason 371 (<code>CUSTOMER_REQUEST</code>). Production was not verified.'],
    ['open', 'Not connected: other status transitions, manual activation of other statuses, other profile and phone routes, the remaining registration branches, relatives’ cards and edits, Fly/RDG. Live verification pending; stage network access disabled by current policy: agent reassignment and blocking, user deletion, the collective purchase, reason IDs other than 371 and the other items of section 7.']
])}
<p>Inventory of customer snapshot events in Kaveret (<code>Event.fire('kaveretSetDataBeforeSend::user', id, KAVERET_UPD_KEYS.*)</code>). Source: audit <code>docs/audits/kaveret-flow-scan-2026-10-07.md</code>, section 3 (base commit <code>81a30af</code>); <code>file:line</code> references verified against the code on 2026-10-11. Paths are relative to <code>app/Controllers/Http/</code>, except <code>Agent/</code>, <code>Modules/</code> and <code>Services/</code>, which are in <code>app/</code>.</p>
${table(['Kaveret event', 'Where it is called', 'Kaveret now', 'CallMarker'], triggers)}
<p class="note">According to the audit: events are asynchronous, sending to Kaveret happens only in prod, there is no queue, no retries and no delivery record; each event sends the current user snapshot. Request and file flows (<code>saveRequestToKaveret::user</code>) are not part of the customer integration. Contact Us is not a snapshot event: it is a separate lead (section 2).</p>

<h3 id="st-contactus">2. Contact Us: website and +60 app</h3>
<div class="callout">${T.impl} <strong>Connected.</strong> Both entry points use one event: <code>callmarker::contactUs</code> → <code>CallMarkerListener.contactUs</code> (<code>app/Listeners/CallMarkerListener.js</code>, registered in <code>start/events.js:88</code>) → <code>CallMarker.processContactUs</code> (<code>app/Modules/CallMarker.js</code>). Controllers — <code>KaveretController.kaveretContactUs</code> and <code>kaveretContactUsApp</code>; the Kaveret branch is the existing <code>app/Modules/Kaveret.js</code>. This differs from the customer test: Contact Us sends only a minimal lead with the <code>source</code> and <code>ignore_duplicates</code> flags, while the customer test sends the full mapping without these flags.</div>
${table(['Origin', 'Entry point and protection', 'Input data', 'CallMarker <code>source</code>', 'Kaveret (production only)'], contactEntry)}
<p><strong>Responses to the client</strong> — before CRM delivery completes:</p>
${table(['Situation', 'Response'], contactResponses)}
<p><strong>Minimal request to CallMarker</strong> (form-urlencoded, same <code>sendCustomer</code> transport):</p>
${table(['Field', 'Value'], contactPayload)}
<p class="note">Not sent: <code>crm_id</code>, <code>email</code>, <code>birthday</code> and the full customer custom fields; no data is read from the database. Example in <a href="#examples">section 12</a> of the reference.</p>
<p><strong>Environments:</strong></p>
${table(['<code>NODE_ENV</code>', 'CallMarker', 'Kaveret', 'Alert email'], contactEnv)}
${li([
    ['impl', 'In production with <code>CALLMARKER_ENABLED=true</code> both CRMs are called <strong>in parallel and independently</strong>: a failure of one does not affect the other. Timeout — 15 s for each, <strong>no retries</strong>.'],
    ['impl', 'CallMarker success is only a 2xx status <strong>and</strong> the exact text “Customer has been added successfully”. HTTP 200 by itself is not considered success. The success text is the same for create and update. On timeout, delivery is uncertain.'],
    ['impl', 'On an error from either CRM or a duplicate — <strong>one</strong> combined email per submission to the user with ID 84 (<code>send::emailListener</code>, type <code>CallMarker</code>): first and last name, submitted and outgoing number, origin and source, environment, campaign ID and name (e.g. <code>13565 (בדיקות)</code>), time in Asia/Jerusalem and UTC, and for each CRM — result, HTTP status, response body (up to 500 characters, token stripped) and explanation. All values are HTML-escaped; the email subject contains no customer data. Logs contain only the CRM, the reason and the status.']
])}
${table(['Reason in the email', 'Explanation'], reasons)}
<p><strong>Accepted limitations</strong> (the user decided not to change them):</p>
${li([
    ['lim', 'The event is processed in the same process; this is not a durable queue: a restart before delivery loses the lead without an alert.'],
    ['lim', 'A failure to fire the event is only logged; there is no fallback email.'],
    ['lim', 'The existing <code>EmailListener</code> does not verify delivery statuses returned by the mail provider (and sends emails only on stage and in production).'],
    ['lim', 'Sending an alert does not prove the email reached the mailbox.']
])}
<p><strong>Verification status:</strong></p>
${li([
    ['live', 'Website: stage testing confirmed by the user; the operation of the whole deployed flow on stage was confirmed by the user overall. Individual results were not provided.'],
    ['open', 'A separate controlled verification of Contact Us from the +60 app on stage is not described in the documents.'],
    ['impl', 'Mock tests run by me on 2026-10-15 (without network, DB or <code>.env</code>): Contact Us — 34 of 34, customer test — 43 of 43, user sync — 67 of 67, subscription activation — 17 of 17.']
])}

<h3 id="st-newclient">3. Existing mediwho.com/new-client flow (migration context)</h3>
<div class="callout"><strong>${T.exist} This is an EXISTING Mediwho flow that must be assessed during the migration.</strong> It is not an implemented CallMarker flow: link generation on the CallMarker side and connecting to this path are <strong>not approved and not implemented</strong>. The Kaveret handover document referenced by the audit is missing from the repository, so this description is based on source code: frontend (<code>/Users/Danil/WebstormProjects/frontend</code>, commit <code>0b94d80c9</code>) and API.</div>
<p>Synthetic example of a link with repeated <code>?</code> (fictitious data):</p>
<pre>https://mediwho.com/new-client?isNewClient=1?first_name=%D7%93%D7%A0%D7%94?last_name=%D7%9C%D7%95%D7%99?phone=0501234567?identity=012345674?birthday=17/05/1990?email=dana.levi@example.test</pre>
<p>The same link with regular separators: <code>…/new-client?isNewClient=1&amp;first_name=…&amp;last_name=…&amp;phone=0501234567&amp;identity=012345674&amp;birthday=17/05/1990&amp;email=dana.levi@example.test</code>. The frontend parses both forms identically. Incoming parameters: <code>first_name</code>, <code>last_name</code>, <code>phone</code>, <code>identity</code>, <code>birthday</code>, <code>email</code>, <code>isNewClient</code>. The API expects the birth date in <code>dd/MM/yyyy</code> format.</p>
${table(['Step', 'What happens (per the code)'], newClientSteps)}
<p class="note">Migration observations: no middleware is declared on the <code>agent/reg-non-resident-client</code> route (<code>start/routes/agent.js:72</code>). Personal data (identity, phone, email) is passed in the link URL and may end up in browser history and logs. How Kaveret builds the link is not visible from the repository.</p>
${li([
    ['impl', 'Creating a new customer by an agent (the <code>regNewClient</code> branch of <code>AgentController.regClient</code>) now fires <code>callmarker::syncUser</code> with context <code>AGENT_CUSTOMER_CREATION</code> (<code>AgentController.js:1751</code>) → campaign 13569. The other branches of this path (agent as a customer, existing Fly lead, non-resident) are not connected.'],
    ['open', 'CallMarker-side generation of /new-client links is not approved. If introduced: repeated <code>?</code> work only thanks to the custom frontend parser; the format must be agreed.']
])}

<h3 id="st-flow">4. Customer test endpoint</h3>
${li([
    ['impl', '<code>POST /call-marker/test/customer</code> with <code>user_id</code> and <code>dry_run</code> (dry run by default); protected by <code>auth</code> + <code>is:(admin or developer)</code>; 404 in production. Outside production the live send is blocked by the network policy (<code>403 CALLMARKER_DISABLED</code> before the token is read), and <code>CALLMARKER_TEST_ENABLED=true</code> cannot override it; the dry run remains available. The live tests below are historical and currently unavailable.'],
    ['impl', 'Files: <code>CallMarkerController.js</code> (HTTP validation, dry run, live send conditions), <code>app/Modules/CallMarker.js</code> (<code>loadCustomer</code> — reads the user and related records; <code>sendCustomer</code> — HTTP send), <code>app/Utils/callMarkerCustomer.js</code> (pure mapping). <code>CONTRACT_FIELDS</code> (formerly <code>ALLOWED_FIELDS</code>) describes the contract and is verified by a test, but does not filter fields at runtime.'],
    ['impl', 'The campaign is always <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (<code>13565</code>); neither the environment nor a request parameter changes it. <code>CALLMARKER_TEST_CAMPAIGN_ID</code> is a legacy variable.'],
    ['impl', 'A dry run returns a preview: <code>fields</code>, <code>omitted</code> with reasons, <code>warnings</code>, <code>ambiguities</code>, <code>phone</code>, <code>config_complete_for_live</code>. This flag is kept for compatibility and equals <code>Boolean(campaign)</code>: it reflects only the presence of a campaign (currently always <code>true</code>) and does <strong>not</strong> mean readiness for a live send.'],
    ['impl', 'A live send is a POST to the Simple Customers API (<code>https://app.callmarker.com/api/simple/customers</code>, form-urlencoded, 15 s timeout, no retries). Response: the HTTP status and CallMarker body as is, <code>creation_confirmed: false</code>.']
])}
${table(
    ['Protection', 'Code', 'State'],
    [
        ['Authentication and role <code>auth</code> + <code>is:(admin or developer)</code>', '<code>start/routes/call-marker.js:9</code>', 'Enabled.'],
        ['Production block', '<code>CallMarkerController.js:31</code>', 'When <code>NODE_ENV</code> → prod, response 404.'],
        ['<code>user_id</code> / <code>dry_run</code> validation', 'lines 36, 39', '400.'],
        ['Live test enablement', 'line 76', 'First the network policy (otherwise <code>403 CALLMARKER_DISABLED</code>), then <code>CALLMARKER_TEST_ENABLED</code> = <code>true</code> (otherwise 403); together the live mode is currently unavailable.'],
        ['Ambiguous source data', 'line 79', '409 <code>AMBIGUOUS_SOURCE_DATA</code>.'],
        ['Token', 'line 83', 'Without it, 503 <code>CALLMARKER_NOT_CONFIGURED</code>.'],
        ['Secret in responses and logs', '<code>CallMarker.sendCustomer</code>', 'The token is added only when sending; an echo in the response is replaced with <code>[REDACTED]</code>; logs contain only error codes.']
    ]
)}

<h3 id="st-ident">5. Customer identification and campaigns</h3>
${li([
    ['dec', 'CallMarker identifies the customer <strong>by phone number</strong>.'],
    ['dec', '<code>crm_id</code> stores <code>users.id</code> as reference information. A different number with the same <code>crm_id</code> creates another CRM row (confirmed by the user; not verified in the recorded tests).'],
    ['dec', 'Updating customer data through one campaign changes the shared customer data in other campaigns as well (confirmed by the user). This must not be extended without evidence to statuses and agent assignments that belong to a specific campaign.'],
    ['live', 'Resending with the same number updated the existing customer in campaign 13565; no duplicate appeared (test 4; tests 5–7 used the same number).'],
    ['live', 'With <code>ignore_duplicates=1</code>, CallMarker responded “Duplicate customer” for a number that was already in <strong>another</strong> campaign (the user’s report). So the duplicate detection is not necessarily limited to the target campaign; this does not prove that a customer cannot belong to several campaigns.'],
    ['impl', 'The <code>ignore_duplicates</code> flag is set explicitly only in Contact Us; the customer test does not send it, and it is not added globally to requests. The code has no duplicate or retry protection of its own.'],
    ['open', 'Phone change and shared number are open questions; family member behavior is deferred.']
])}

<h3 id="st-lifecycle">6. Sync, campaigns and lifecycle checkboxes</h3>
${li([
    ['impl', 'Event <code>callmarker::syncUser</code> → <code>CallMarkerListener.syncUser</code> → <code>CallMarker.processUserSync</code> (<code>start/events.js:89</code>). Runs on stage and in production; in development there is no automatic external sending. The per-user queue lives in the memory of one Node process, not across pods; every run reloads MediWho data. The customer is first looked up through the read-only API v2 (by number and <code>crm_id</code>); on a conflict (<code>CRM_ID_CONFLICT</code>, <code>PHONE_CHANGED</code>, <code>MULTIPLE_MATCHES</code>, etc.) nothing is written and user 84 gets an email. Then one Simple API POST without <code>ignore_duplicates</code>, <code>unique</code>, <code>remove</code>, <code>reset</code>; a timeout leaves the result uncertain, and there are no retries.'],
    ['live', 'The operation of the deployed flow on stage was confirmed by the user overall; there was no production verification.']
])}
<p><strong>Sync contexts</strong> (verified against the API code on 2026-10-18):</p>
${table(['Context', 'Where it fires and exceptions', 'Campaign (stage and production)', '<code>source</code>'], syncContexts, 'extable')}
<p><strong>Routing by environment:</strong></p>
${table(['Flow', 'stage', 'production'], routing)}
<p class="note">development: no automatic external sending (mock tests only). Custom fields: dev/stage use the “(S)” IDs, production uses the original ones; env is the shared ${cf(16901)}. These sets do <strong>not</strong> isolate the standard customer data or the actual campaign membership: the customer is matched by number, and a write from stage can change a customer that production uses.</p>
<p><strong>Lifecycle checkboxes</strong> (Checkbox; values <code>"1"</code>/<code>"0"</code>):</p>
${table(['Checkbox (production)', 'dev/stage', 'Who sets it'], lifeFlags)}
${li([
    ['impl', 'Only one regular lifecycle checkbox is set at a time (is_lead, is_registered_without_subscription, is_customer, is_former_customer): the selected one is <code>"1"</code>, the other three are <code>"0"</code>. is_agent is independent and can be combined with the customer state.'],
    ['impl', 'is_test is set only by explicitly authorized test scripts; regular flows never send it, regardless of environment and campaign.'],
    ['impl', 'Registration and Contact Us only promote the state and keep a more advanced or ambiguous classification. Agent registration and agent address do not invent a personal customer status.'],
    ['impl', 'A purchase, recovery, blocking and unblocking set is_customer, a cancellation sets is_former_customer, replacing unclear and contradictory checkboxes as well. This is the <strong>current implementation behavior</strong>, not a separately approved policy.'],
    ['live', 'Confirmed by the user on stage: an ordinary cancellation moved the customer to 13568, set is_former_customer(S) = <code>"1"</code>, cleared is_customer(S), is_lead(S) and is_registered_without_subscription(S) and left is_agent(S) and is_test(S) unchanged. This does not confirm that all three cancellation entry points were verified.'],
    ['live', 'Verified (the user’s report): <code>fields[customers]</code> works with <code>include=custom_fields&amp;custom_fields_format=map</code>; a ticked checkbox came back as the string <code>"1"</code>, an unticked one as <code>null</code>; sending <code>"0"</code> unticks the checkbox; the “lead → registered → customer” test preserved the production checkboxes, the agent checkbox, the test markers and env.']
])}
<p><strong>Campaign rules and their status:</strong></p>
${table(['Event', 'Campaign', 'Checkbox', 'Status'], lifecycle)}
${li([
    ['live', 'Live test 2026-10-14 (customer 24625344, POST with <code>campaign=13567</code> without <code>unique</code>): the Simple API <strong>moved</strong> the customer into the new campaign instead of adding a second one. A sync write can therefore take a customer out of its previous campaign.'],
    ['open', 'How to add an existing customer to a second campaign without moving it is a question for CallMarker support. Agents’ own subscriptions are now written without <code>unique</code>: memberships are preserved and checked after the write (section 6).'],
    ['open', '<code>unique</code> is <strong>not</strong> a general campaign transfer solution: it can remove the customer from the agents campaign.'],
    ['open', 'Persistence of campaign membership and sync state is deferred; a campaign cannot be derived from a single status snapshot.']
])}

<p><strong>Reading campaign membership and a customer by ID through API v2</strong> (read-only):</p>
${li([
    ['live', 'Verified live: <code>GET /api/v2/customers</code> with <code>include=custom_fields,campaign_customers</code>, <code>fields[customers]=id,name,number,email,crm_id</code> and <code>custom_fields_format=map</code> works. Active memberships are embedded as <code>campaign_customers[]</code>: membership ID, <code>campaign_id</code>, <code>status</code>/<code>status_name</code> and <code>disabled</code>; campaign names are not embedded. Only active memberships in non-deleted campaigns are embedded.'],
    ['live', 'Active and disabled memberships with campaign names are read separately: <code>GET /api/v2/campaign-customers</code> with <code>filter[customer_id]={id}</code>, <code>filter[disabled]=0,1</code>, <code>include=campaign</code> and <code>fields[campaign]=id,name</code>.'],
    ['live', 'Waiting is the customer’s status within the campaign, not the campaign’s activity status. The membership <code>updated_at</code> alone does not prove the exact time of removal from a campaign.'],
    ['open', 'According to the updated API specification, membership and custom field changes do not update the customer’s <code>updated_at</code> (not tested separately), so such changes cannot be detected through it.'],
    ['impl', 'In the code (commit <code>ad3939070</code>, later ported to api-prod/stage): the API v2 lookups embed <code>campaign_customers</code>. Memberships are used: neutral and restricted updates write to the existing membership of the campaign of the user’s classification and read back the complete membership set; card creation verifies the resulting memberships. The api-prod/stage port (commit <code>cf19603ff</code>, 2026-10-26) does not mean production deployment or verification.'],
    ['live', 'Verified live: reading by the internal CallMarker ID without the <code>number</code> and <code>crm_id</code> parameters — <code>GET /api/v2/customers/24622736</code> with <code>include=custom_fields,campaign_customers</code> and <code>custom_fields_format=map</code> returned a single customer object with both includes.'],
    ['open', 'Documented alternative — <code>GET /api/v2/customers?filter[id]=24622736&amp;include=custom_fields,campaign_customers&amp;custom_fields_format=map</code>; not tested live. <code>filter[number]</code> is a phone lookup: the value 24622736 returned an empty list.'],
    ['open', 'These are API v2 read capabilities. They do not establish that the Simple API can write by ID instead of phone, nor that a write preserves several campaigns: in the test of 2026-10-14 a write with another campaign moved the customer. That is why the agent flows verify memberships after the write (section 6).']
])}

<p><strong>Profile and admin editing</strong></p>
${li([['impl', "Existing PUT /user/user-data and PATCH /user/edit-info send the full fresh mapping after persisted mapped changes. fathers_name is included. Admin edits dispatch after persistence steps, including partial failures after successful writes. A genuine phone change uses separate number_change first; profile sync proceeds only after phone confirmation (or format-only handling). An existing bound card is updated; a proven-absent card is created with the full mapping (see below); family profiles stay deferred. No lifecycle checkboxes, source or Opportunity are sent. Campaign selection uses the user’s classification: own agent role → 13567; personal ACTIVE/BLOCKED/AWAITING_BANK_TRANSFER → 13566; otherwise CANCELED → 13568; otherwise 13569. Exactly one existing eligible membership is required; unrelated memberships are allowed; an agent with eligible memberships in both agent and customer classifications remains ambiguous. Read-back compares identity, sent email, six checkboxes and the complete membership ID/campaign set; it does not compare names, birthday, fathers_name or HMO values. Changes are detected, not rolled back; no automatic resend. Birthday, fathers_name and Hebrew-only HMO values were stage confirmed by the user on 2026-10-26; no per-branch or production evidence is implied."]])}<p class="note">Customer custom-field availability: the browser runner reported all 75 then-existing fields set to Use in all campaigns, with all 75 reopened for verification. This is account configuration evidence, not proof of API writes; the later fields 17022/17023 are separately confirmed by the user on stage.</p>
<p><strong>Admin agent info edit</strong> (<code>PATCH /user/edit-agent-info</code>):</p>
${li([
    ['impl', '<code>UserController.editAgentInfo</code> (admin or money; admin-panel → an agent page → the <code>EditAgentInfo</code> popup) uses the same single event <code>callmarker::adminUserEdit</code> and the same task in the user’s queue (<code>processAdminUserEdit</code> → <code>runAdminUserEdit</code>) as <code>PATCH /user/edit-info</code>. The event is fired once, after the handler steps have settled (user save, STO, invitation, legacy CRM, Kaveret), also when a later step answers 400 or throws after a successful save. Never on a 404, a validation error or a failed user save.'],
    ['impl', 'Trigger: an admin change of <code>first_name</code>, <code>last_name</code>, <code>identity</code> or <code>email</code> that was persisted — then the full fresh neutral mapping (<code>ADMIN_PROFILE_UPDATED</code>) is sent, reloaded from the database, never the request body. A genuine phone change is a separate <code>number_change</code>; profile data follow only after the phone is confirmed on the same card or was already applied. A formatting-only phone change sends no <code>number_change</code>.'],
    ['impl', 'No sync for: money-role requests, STO-only changes (<code>sto_id</code>, <code>sto_status</code>, <code>terminal_name</code>), <code>agency_id</code>-only changes, an unchanged save.'],
    ['impl', 'Campaign: the existing membership by the user’s classification (own agent role → 13567), then the membership-set read-back; no lifecycle checkboxes, <code>source</code> or opportunity writes. Family members stay deferred. Validation: <code>IDENTITY_EXIST</code> / <code>EMAIL_EXIST</code>, <code>PHONE_INVALID</code>, <code>PHONE_EXIST</code> (in any equivalent form) — in one 400 <code>{ errorArray }</code>; the phone is stored as sent.'],
    ['live', 'Confirmed by the user on stage on 2026-10-26 (“after check stage -> checked, work clean”). This is an overall confirmation: IDs, logs and per-case results were not provided; production was not verified.'],
    ['open', 'Limitations: a “pending confirmation” or “outcome unknown” phone result stops the data part (one email, no retry); there is no durable state, automatic retry or delayed reconciliation; names are not compared by the read-back. Known implementation inconsistency: the invitation block takes personal fields from the request body for any role, so a money request carrying them updates the invitation although the users row is not saved; CallMarker ignores it.'],
    ['open', '<code>PUT /agent/client-info</code> is connected separately, for three fields only (see the block below).']
])}

<p><strong>Agent client info</strong> (<code>PUT /agent/client-info</code>, <code>AGENT_CLIENT_PROFILE_UPDATED</code>):</p>
${li([
    ['impl', '<code>AgentController.updateClientInfo</code> (website → the agent’s client → the HMO popup). Allowed only for the acting agent’s own customer or a customer whose parent belongs to that agent (the stored <code>agent_id</code> values are compared); otherwise 403/404 as before, before any write or event.'],
    ['impl', 'After a successful save only changed <code>hmo_id</code>, <code>hmo_plan_id</code> and <code>fathers_name</code> are tracked; one event is fired in the handler’s <code>finally</code>. Only changed, non-empty values are sent: HMO — ' + cf(16874) + ' (stage — <code>custom_field_16957</code>), plan — ' + cf(16875) + ' (stage — <code>custom_field_16958</code>), father’s name — <code>custom_field_17022</code> (stage — <code>custom_field_17023</code>).'],
    ['impl', 'HMO and plan are Hebrew catalog names only, without IDs; an unknown ID is omitted with a diagnostic. The father’s name comes from the edited user’s own record, trimmed. Empty values do not clear CRM values; with nothing to send there is no lookup and no POST.'],
    ['impl', 'The required <code>number</code> and <code>campaign</code> come from the existing bound card and its eligible existing membership. No full customer mapping, lifecycle checkboxes, <code>source</code> or opportunity. Family members stay deferred (<code>FAMILY_PROFILE_PENDING_DECISION</code>).'],
    ['impl', 'A genuine phone change saved by the same request blocks this sync (<code>PROFILE_PHONE_CHANGE_UNCONFIRMED</code>, one email); this route sends no <code>number_change</code>. A failed or missing baseline read skips CallMarker (<code>AGENT_CLIENT_BASELINE_READ_FAILED</code> / <code>AGENT_CLIENT_BASELINE_MISSING</code>) while the business operation runs as before.'],
    ['live', 'Confirmed by the user on stage on 2026-10-26 (“checked in stage, work clean”). This is an overall confirmation: IDs, logs and per-case results were not provided; production was not verified.'],
    ['open', 'The read-back checks the card identity, memberships and checkboxes; the three values themselves are not compared automatically. Whether a POST without <code>name</code>/<code>email</code> leaves those fields unchanged is not verified separately. No durable state, automatic retry or deduplication. The unrestricted <code>user.merge</code> in the handler is an existing limitation, not fixed.'],
    ['open', '<code>GET /agent/clients</code>: a request parameter can override the agent ID — a separate deferred security issue outside the CallMarker migration, not fixed.']
])}

<p><strong>Restricted updates</strong> (the shared neutral pipeline: fresh load, the user’s queue, API v2 checks, the existing membership of the user’s classification, membership and checkbox read-back, private emails; only the context’s changed, non-empty allowlisted fields; empty values never clear CRM values):</p>
${table(['Route and context', 'Who may call', 'Fields', 'Confirmation'], [
    ['<code>PATCH /user/update-hmo-plans</code>, <code>ADMIN_HMO_PLANS_UPDATED</code>', 'admin / moderator / editor / developer (unchanged)', 'HMO, plan — Hebrew names', 'User, stage, 2026-10-26'],
    ['<code>PATCH /registration/hmo</code>, <code>REGISTRATION_HMO_UPDATED</code>', 'own <code>user_id</code> or admin / moderator / editor / developer; otherwise 403', 'HMO, plan, father’s name', 'User, stage, 2026-10-26'],
    ['<code>PUT /registration/user</code>, <code>REGISTRATION_IDENTITY_UPDATED</code>', 'own <code>user_id</code> only; otherwise 403', 'identity (text with leading zeros), birthday <code>DD-MM-YYYY</code>', 'User, stage, 2026-10-26'],
    ['<code>POST /registration</code> (existing-user branches), <code>SHORT_REGISTRATION_UPDATED</code>', '<code>auth.user</code> only', 'identity; or birthday, HMO, plan', 'User, stage, 2026-10-26'],
    ['<code>PATCH /user/add-client-email</code>, <code>CLIENT_EMAIL_UPDATED</code>', '<code>auth.user</code> only', 'standard <code>email</code> (read back)', 'User, stage, 2026-10-26'],
    ['<code>POST /address</code> type CLIENT, <code>CLIENT_ADDRESS_UPDATED</code>', 'own user or an agent for its customer; otherwise 403', cf(16898) + ' (the same readable text)', 'User, stage, 2026-10-26'],
    ['<code>PUT /change-agent</code>, <code>POST /create-inv-by-ref-link</code>, <code>PATCH /agent/invite-cli</code>, <code>AGENT_REASSIGNED</code>', 'unchanged', 'agent and agency fields (except parent_agency_name)', PEND],
    ['<code>PUT /agent/block</code> / <code>unblock</code> and the daily 07:45 run, <code>AGENT_BLOCK_UPDATED</code>', 'admin / moderator', cf(16880) + ' (own agent role only)', PEND],
    ['Actual archive (<code>DELETE /user/client</code>, <code>/user/agent</code>, <code>/agent/delete-client</code>), <code>USER_DELETED</code>', 'unchanged', cf(16878) + ' = <code>"1"</code>', PEND]
])}
${li([
    ['impl', 'The event is fired once, after a successful save, in the handler’s <code>finally</code> — also after a later failure; never on a denial, unchanged values or a failed save. A deletion is sent only after the archive transaction commits; the lookup phone is captured before the archive and kept in memory only.'],
    ['impl', 'Agency and mentor: <code>PUT /user/main-agent</code> and <code>PUT /agent/update-mentor</code> fire no event; the fields refresh on the customer’s next relevant sync. Fan-out to all of an agent’s customers is deferred.'],
    ['open', 'The read-back compares identity, memberships and checkboxes, plus email and blocked_agent; the other values (HMO, identity, birthday, father’s name, address, agent fields) are not compared automatically.']
])}
<p><strong>Missing-card creation and bootstrap</strong>:</p>
${li([
    ['impl', 'When both API v2 lookups (by number and <code>crm_id</code>) completed and found no card, a connected event of a living, independent user creates the card with the <strong>full</strong> mapping — also for restricted contexts. An existing card still gets only the allowlisted fields. A lookup error, incomplete paging, a conflict or an unbound lead never creates.'],
    ['impl', 'Campaigns and initial flags by classification: own agent role → 13567; personal ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → 13566 (is_customer); otherwise CANCELED → 13568 (is_former_customer); otherwise 13569 (is_registered_without_subscription).'],
    ['impl', 'An agent with a personal subscription gets one card in two campaigns: the first POST, then the card and its membership are verified through API v2, then a second request with only <code>number</code> and <code>campaign</code>; afterwards both memberships must be active. Whether the second request adds a membership or moves the card is not confirmed: a move is reported as <code>CREATE_MEMBERSHIP_UNCONFIRMED</code> and not repaired.'],
    ['impl', 'Phone change: with no card by <code>crm_id</code>, the old or the new number, the card is created with the current number (<code>PHONE_CHANGE_BOOTSTRAP</code>) and no <code>number_change</code> is sent. New relative: the independent family head’s card is created first (<code>FAMILY_HEAD_BOOTSTRAP</code>), then the <code>family_details</code> record is sent once.'],
    ['open', 'Never created: on a user deletion (<code>USER_DELETED</code>; deferred), for a deleted user and for a family member — there are no separate relative cards; relatives stay model-208 records.']
])}

<p><strong>New family member</strong> (<code>family_details</code>, a record in model 208 ${he('בני משפחה')}):</p>
${li([
    ['impl', 'When a <strong>new</strong> relative is created through <code>POST /agent/reg-family-member</code> (<code>AgentController.regFamilyMember</code>) and <code>POST /family</code> (<code>RegistrationController.regAnotherUser</code>, except the <code>isAgent</code> branch), one POST goes to the experimental route <code>POST https://app.callmarker.com/api/simple/customers/external-change</code> with <code>webhook=family_details</code>. <code>number</code> is the <strong>family head’s</strong> phone (Israeli local form); <code>f_name</code>, <code>id_name</code>, <code>birthday</code> and <code>Reference</code> are the <strong>relative’s</strong> data (first and last name, identity, birthday, relationship); <code>crm_id</code> is the relative’s MediWho <code>users.id</code>. <code>Reference</code> from <code>related_as</code>: PARTNER → ' + he('בן זוג') + ', CHILD → ' + he('ילד') + ', PARENT → ' + he('הורה') + '; any other value is not sent (<code>RELATION_UNKNOWN</code>). The route was supplied by CallMarker support; it is not in the vendor documentation snapshots.'],
    ['live', 'Confirmed by the user on stage on 2026-10-26 (“stage checked, all work”): new-relative creation through <code>POST /agent/reg-family-member</code> and <code>POST /family</code>. This is the user’s overall confirmation: tested users, record IDs, logs and per-branch results were not provided; not every negative case, captcha branch, relationship type or concurrency scenario was individually verified.'],
    ['impl', 'Create-only: existing-user invitations and their acceptance, relative edits and removals, and backfill are not connected. CallMarker support confirmed <code>crm_id</code> support and the fix for extra empty records (user’s report, 2026-10-25).'],
    ['open', '<code>Data received</code> means accepted, not API-verified creation: model 208 cannot currently be read through the supported public API. There is no automatic retry and no durable deduplication — a repeated delivery can create a duplicate. Foreign family-head phones remain unsupported and unverified. Phone-change integration is a separate future task.'],
    ['open', '<code>family_details</code> only creates a model-208 record: family purchases and other opportunity events are not connected to it; opportunity behavior for family members is deferred.']
])}

<p><strong>Admin phone change</strong> (<code>PUT /user/admin/change-phone</code>, <code>number_change</code>):</p>
${li([
    ['impl', 'Only <code>UserController.changePhone</code>: after the new phone is saved, a separate request goes to the experimental route <code>POST https://app.callmarker.com/api/simple/customers/external-change</code> with <code>webhook=number_change</code> (<code>name</code>, <code>number</code> — the card’s old phone, <code>new_number</code>). An ordinary customer upload with the new number is never used for a phone change. The same existing card bound by <code>crm_id</code> is required; the route was supplied by CallMarker support and is not in the vendor documentation snapshots.'],
    ['live', 'Confirmed by the user on stage on 2026-10-26 (“check done”). This is an overall confirmation: tested users, card IDs, logs and per-case results, including the negative checks, were not provided.'],
    ['impl', 'One attempt and one immediate verification by reading the card by ID. “Accepted but unconfirmed” and “outcome unknown” are never resent: the card must be checked manually, read-only.'],
    ['open', 'There is no persistent state, durable queue, delayed reconciliation, automatic retry or global sync pause (deferred by the user). Other phone-change routes do not notify CallMarker; <code>PATCH /user/edit-info</code> and <code>PATCH /user/edit-agent-info</code> are connected as described above.']
])}

<h3 id="st-opportunity">7. Opportunities: purchase, cancellation, recovery and verified behavior</h3>
<div class="callout">${T.impl} <strong>Opportunities are sent automatically in five contexts:</strong> <code>SUBSCRIPTION_ACTIVATED</code> — Purchased (campaign 13566), <code>SUBSCRIPTION_CANCELED</code> — a separate Not purchased with a reason ID (status <code>3</code>, campaign 13568), <code>SUBSCRIPTION_RECOVERED</code> — a new Purchased with the note ${he('שחזור מנוי')}, <code>SUBSCRIPTION_BLOCKED</code> — Not purchased with reason <code>367</code>, <code>SUBSCRIPTION_UNBLOCKED</code> — Purchased with the note ${he('הוסדר תשלום')} (the last three — campaign 13566). The opportunity fields are added to the <strong>same</strong> POST as the customer (without <code>source</code>). There is no separate “open, then close” request. Other contexts do not send opportunity fields. ${T.live} The operation of the flow on stage was confirmed by the user overall.</div>
<p><strong>Purchase flow:</strong></p>
<ol class="status-steps">
<li>${T.impl} A personal <code>user_subscription</code> transitions to ACTIVE (card or free payment, bank approval, activation from CARD_BLOCKED; the row was not ACTIVE when loaded) or a collective purchase is created.</li>
<li>${T.impl} The event carries the owner’s <code>user_id</code> and the exact <code>user_subscription_id</code>.</li>
<li>${T.impl} Queued processing per user reloads the data; agents’ own (non-AGENT) subscriptions are processed with their memberships preserved (see below).</li>
<p><strong>Own (non-AGENT) subscriptions of agents</strong> (<code>agent</code> / <code>insurance_agent</code>; the <code>AGENT_MEMBERSHIP_PENDING_SUPPORT</code> reason is no longer used):</p>
${table(['Event', 'Campaign', 'Opportunity', 'Note'], [
    ['Purchase', '13566', 'Purchased <code>2</code>', 'Confirmed by the user on stage on 2026-10-29 (before the network policy; an overall message, “stage check done, all OK” in Russian, scope inferred from the accompanying task)'],
    ['Blocking', '13566', 'Not purchased <code>3</code>, reason <code>367</code>', PEND],
    ['Unblocking', '13566', 'Purchased <code>2</code>, <code>product_field_1060</code> = ' + he('הוסדר תשלום'), PEND],
    ['Cancellation', '13568', 'Not purchased <code>3</code>, the exact request’s reason or <code>378</code>; existing 1060 / 1061 rules', PEND],
    ['Recovery', '13566', 'Purchased <code>2</code>, <code>product_field_1060</code> = ' + he('שחזור מנוי'), PEND]
])}
${li([
    ['impl', 'In all five: <code>is_agent</code> = <code>"1"</code>; active memberships are read before the write (unreadable — nothing is sent) and once after: 13567 and every earlier membership must stay with the same IDs, exactly one in the event’s campaign, nothing extra; otherwise one private “unconfirmed” email (<code>AGENT_MEMBERSHIP_CHANGED</code> / <code>AGENT_MEMBERSHIP_INCOMPLETE</code>).'],
    ['impl', 'No <code>unique</code>, membership removal, automatic retry or repair. The context’s own checks (owner, AGENT tariff, stale status, <code>ACTIVE_SUBSCRIPTION_EXISTS</code>, family members) are unchanged.'],
    ['impl', 'No card — the shared combined-role creation: the first POST to the event’s campaign with the Opportunity, the second only <code>number</code> + 13567; the Opportunity is sent once.'],
    ['open', 'Neutral profile updates of a combined-role card can still stop with <code>CLASSIFICATION_AMBIGUOUS</code>; the campaign choice is deferred.']
])}
<li>${T.impl} The row is validated (<code>loadPurchase</code>): owner, ACTIVE status, the tariff exists and is not AGENT. Otherwise nothing is written; email to user 84.</li>
<li>${T.impl} Customer lookup and conflict checks via API v2; the customer’s opportunities are read before the write.</li>
<li>${T.impl} Tariff → <code>subscriptions.callmarker_product_id</code>; customer and opportunity fields are prepared (<code>buildOpportunityFields</code>).</li>
<li>${T.impl} One POST: customer + Purchased opportunity (if the mapping is ready).</li>
<li>${T.impl} Post-write verification — read-only via API v2; no resend.</li>
</ol>
<p><strong>Current opportunity field mapping:</strong></p>
${table(['Parameter', 'Value', 'If something is missing'], oppFields, 'extable')}
<p><strong>Manually added columns</strong> (no migration in the repository): <code>subscriptions.callmarker_product_id</code> — <code>BIGINT UNSIGNED NULL</code>, the internal product ID in the catalog of the configured CallMarker account (separate stage and production IDs are not always required: a shared catalog may use the same IDs). The product must be active, have an open price and be configured for campaign 13566, where the automatic purchase goes; browser inspection confirmed that <code>7794</code> is associated with test campaign 13565, while association with 13566 is not explicitly confirmed — that campaign’s configuration must be checked. The successful stage verification is confirmed by the user; the configuration changes behind it are not recorded here. <code>users.callmarker_agent_name</code> — <code>VARCHAR(255) NULL</code>: the exact CallMarker user Name <strong>or</strong> that user’s configured CRM Name; confirmed live for the Name “Yuval Kopel REP”, while CRM Name matching and identity verification are limited — API v2 exposes only the user id and Name. The SQL artifact provided 137 “tariff → CallMarker product” mappings, e.g. <code>subscriptions.id</code> 192 / SKU I-0004 → 7794. This documentation did not query or verify them individually.</p>
${li([
    ['impl', 'Do not confuse: the customer’s <code>custom_field_16876</code> (active_product_id) is the MediWho <code>products.id</code>; the opportunity <code>product_id</code> is the internal CallMarker product ID; <code>opportunity_crm_id</code> is the tariff; <code>product_field_1059</code> is the specific purchase row.'],
    ['impl', 'Missing or invalid product mapping, or an invalid price → the customer is written <strong>without</strong> opportunity fields, and user 84 gets one “opportunity skipped” email. No provider, provider name, product name or <code>callmarker_agent_name</code> → only that value is skipped. If the write itself failed or timed out, the regular sync email notes that the opportunity fields were in the request and the result is unknown.']
])}
<p><strong>Cancellation</strong> (<code>SUBSCRIPTION_CANCELED</code>, campaign 13568 <code>FORMER_CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'Cancellation from ACTIVE, BLOCKED or AWAITING_BANK_TRANSFER to CANCELED in three connected places: manual cancellation (<code>canceledSubscription</code>), Galil cancellation (<code>cancelUserSubscription_Galil</code>) and scheduled future cancellation execution (<code>FutureCancellationRunner.runOne</code>; cancels ACTIVE only). The original status is captured before the CANCELED write; the tariff is not AGENT. The event carries <code>cancellation_request_id</code> — the request the operation itself used (Galil, scheduled cancellation); manual cancellation passes no request. A dispatch failure does not change the cancellation.'],
    ['impl', 'At run time: a family member — skipped with <code>FAMILY_MEMBER_PENDING_DECISION</code>; the row must exist, belong to the user and still be CANCELED (otherwise an email to user 84); if the user already has an ACTIVE personal subscription — skipped with <code>ACTIVE_SUBSCRIPTION_EXISTS</code>, so a stale event never moves the customer back.'],
    ['impl', 'Customer: campaign 13568, is_former_customer = <code>"1"</code>, is_customer, is_lead and is_registered_without_subscription = <code>"0"</code>, ' + cf(16879) + ' = <code>"0"</code>; custom field IDs are chosen by environment (“(S)” on dev/stage). is_agent and is_test are not sent and not changed; no <code>source</code>.'],
    ['impl', 'A separate Not purchased opportunity in the same POST: <code>opportunity_status</code> = <code>"3"</code>, product and price from the exact canceled row, <code>opportunity_not_purchased_reason_id</code> by the request’s reason (table below) or <code>378</code>, <code>opportunity_agent_name</code> when configured, fields 1057–1059 as for a purchase. <code>product_field_1060</code> is not sent. Status 3 here is a new record, not a cancellation of an existing sale.'],
    ['impl', '<strong>Reason.</strong> The request is only the one in the event; it is read server-side and must reference this <code>user_subscriptions</code> row and its owner (<code>requested_for</code>). The latest request is never substituted. The stored <code>request_reason</code> is mapped by the table; the caller never supplies a reason. No request (<code>CANCELLATION_REQUEST_UNKNOWN</code>; manual cancellation — always), request not found (<code>CANCELLATION_REQUEST_NOT_FOUND</code>), another row or owner (<code>CANCELLATION_REQUEST_MISMATCH</code>), an empty (<code>NOT_PURCHASED_REASON_MISSING</code>) or unmapped reason (<code>NOT_PURCHASED_REASON_UNMAPPED</code>; <code>UPGRADED</code> is not an alias for <code>UPGRADE</code>) → <code>378</code> (' + he('לא ידוע') + ').'],
    ['impl', 'The request read is optional: on failure — <code>378</code> with the diagnostic <code>CANCELLATION_REQUEST_READ_FAILED</code>; the customer and opportunity sync is not aborted.'],
    ['impl', '<strong>Collection note</strong> (<code>product_field_1061</code>) — only on a cancellation <strong>from</strong> BLOCKED or AWAITING_BANK_TRANSFER, from the same verified request with reason <code>RETURNED_CHARGE</code>, <code>DENIAL_OF_TRANSACTION</code> or <code>BLOCKING_PAYMENT_METHOD</code>: the <code>msg</code> of the request’s <strong>first</strong> message, text as stored (Hebrew and line breaks kept, no truncation and no author data). An unknown, missing, foreign or unreadable request, another reason, an empty or malformed first message → 1061 is omitted (<code>COLLECTION_NOTE_MESSAGE_MISSING</code> / <code>COLLECTION_NOTE_MESSAGE_INVALID</code>); the cancellation continues. In practice the note comes from Galil cancellations.'],
    ['open', 'After a cancellation there is no active product: ' + cf(16876) + ' and ' + cf(16877) + ' are omitted, not cleared, so the previous value may remain in the CRM — a clearing method is not agreed or tested. ' + cf(16899) + ' is recomputed by the snapshot (e.g. ' + he('לקוח לשעבר') + ').']
])}
<p><strong>Not purchased reason IDs</strong> (<code>CALLMARKER_NOT_PURCHASED_REASONS</code>, <code>CALLMARKER_BLOCKING_REASON</code>, <code>CALLMARKER_UNKNOWN_REASON</code> in <code>app/Constants/Enums.js</code>). One CallMarker account catalog: the IDs do not depend on the environment and are not custom field IDs. Simple API acceptance has not been tested.</p>
${table(['<code>request_reason</code>', 'ID', 'Title in CallMarker'], npReasons, 'extable')}
<p><strong>Blocking and unblocking</strong> (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>, campaign 13566 <code>CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'BLOCKED and AWAITING_BANK_TRANSFER mean ' + cf(16879) + ' = <code>"1"</code>; <code>CARD_BLOCKED</code> alone does not set it. A customer with a blocked subscription stays a customer.'],
    ['impl', '<strong>Blocking</strong> — ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, and CANCELED → BLOCKED (recovery with <code>blocked_cancel</code>): is_customer = <code>"1"</code>, the other three — <code>"0"</code>, is_blocked = <code>"1"</code>; a separate Not purchased opportunity (<code>"3"</code>) with reason <code>367</code> (' + he('חסימת מנוי') + '); no <code>product_field_1060</code> or <code>product_field_1061</code>.'],
    ['impl', '<strong>Unblocking</strong> — BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE through an administrative status update (not a purchase): is_customer = <code>"1"</code>, the other three — <code>"0"</code>, is_blocked = <code>"0"</code>; a separate Purchased opportunity (<code>"2"</code>) with <code>product_field_1060</code> = ' + he('הוסדר תשלום') + '; <code>opportunity_not_purchased_reason_id</code> is not sent.'],
    ['impl', 'Not synced: a move between BLOCKED and AWAITING_BANK_TRANSFER, an unchanged status, CARD_BLOCKED and other changes. Bank approval (AWAITING_BANK_APPROVAL → ACTIVE through <code>updateBankApprovalStatus</code>; the admin panel calls it for AWAITING_BANK_APPROVAL rows, the method itself does not restrict the original status, and the event is sent when the row was not ACTIVE) and activation from CARD_BLOCKED stay purchases (<code>SUBSCRIPTION_ACTIVATED</code>). Unblocking is BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE through <code>updateUserSubscriptionStatus</code> (<code>SUBSCRIPTION_UNBLOCKED</code>, note ' + he('הוסדר תשלום') + ').'],
    ['impl', 'At run time the row is reloaded: if it is no longer in the expected status (<code>SUBSCRIPTION_NOT_BLOCKED</code> / <code>SUBSCRIPTION_NOT_ACTIVE</code>) or the tariff is AGENT, the event is stale and skipped (log only).'],
    ['impl', cf(16879) + ' in every full sync is CallMarker’s own calculation (<code>blockingSubscriptionsQuery</code>); the Kaveret snapshot flag (BLOCKED only) is not used.']
])}
<p><strong>Recovery</strong> (<code>SUBSCRIPTION_RECOVERED</code>, campaign 13566 <code>CUSTOMERS_CAMPAIGN</code>):</p>
${li([
    ['impl', 'Only <code>userSubscriptionRecovery</code> (<code>PUT /subscription-recovery</code>): the row was CANCELED when loaded, is saved as ACTIVE, the tariff is known and not AGENT, the subscription is an ordinary personal one. A restoration to BLOCKED (CANCELED → BLOCKED) goes as a blocking, without a recovery opportunity. Users with their own agent role, family members and Fly/RDG are out of scope.'],
    ['impl', 'Customer: is_customer = <code>"1"</code>, the other three lifecycle flags — <code>"0"</code>; is_agent is not cleared, is_test is not sent.'],
    ['impl', 'A <strong>new</strong> Purchased opportunity: <code>opportunity_status</code> = <code>"2"</code>, <code>product_field_1060</code> = ' + he('שחזור מנוי') + '; the same mapping for product, price, the optional configured agent and fields 1057–1059; no reason is sent. Previous opportunities are intentionally not modified; <code>product_field_1061</code> is not used.'],
    ['impl', '<strong>Not to be confused with unblocking:</strong> recovery is CANCELED → ACTIVE through <code>PUT /subscription-recovery</code>, note ' + he('שחזור מנוי') + '; unblocking is BLOCKED / AWAITING_BANK_TRANSFER → ACTIVE through a status update, note ' + he('הוסדר תשלום') + ' and is_blocked = <code>"0"</code>.']
])}
<p><strong>Shared safeguards</strong> (cancellation, recovery, blocking and unblocking):</p>
${li([
    ['impl', 'The Simple API closes an open opportunity for the product instead of creating a separate record. So the existing customer’s opportunities are read before the write: an open (status 1) opportunity with this <code>product_id</code> → <code>OPEN_OPPORTUNITY_EXISTS</code>; the list could not be read → <code>OPEN_OPPORTUNITY_UNKNOWN</code>.'],
    ['impl', 'In both cases all opportunity fields are omitted, the customer campaign and checkboxes are still written, and user 84 gets one email; nothing is closed and there is no automatic retry. An open opportunity for another product does not block.'],
    ['impl', 'A missing or invalid product mapping or price also prevents opportunity delivery; the customer write is kept and user 84 gets an email.'],
    ['impl', 'Ordinary purchase behavior is unchanged: the guard is <strong>not</strong> applied to it; with an open opportunity, a purchase closes it, and post-write verification reports <code>VERIFY_PRE_EXISTING_ONLY</code>.'],
    ['impl', 'The agent and family-member exclusions and the trigger coverage are unchanged.'],
    ['open', 'The read before the write is not atomic: it does not protect against concurrent changes and does not prevent all duplicates.']
])}
<p><strong>Confirmed by the user on stage</strong> (before blocking and reason IDs were added; not tests performed while preparing this documentation; individual customers, times and requests were not provided):</p>
${li([
    ['live', 'Cancellation: campaign 13568 and the lifecycle flags were verified. Coverage of all three cancellation entry points is not confirmed.'],
    ['live', 'A cancellation creates a new Not purchased opportunity.'],
    ['live', 'A recovery creates a new Purchased opportunity with the recovery note (<code>product_field_1060</code>).'],
    ['live', 'Previous opportunities remain unchanged.']
])}
<p><strong>Live verification pending</strong> (stage network access disabled by current policy; the items below are not confirmed live; the user-confirmed <code>family_details</code> flow is not among them):</p>
${li([
    ['open', 'Reason IDs 367–370 and 372–378 (including the fallback <code>378</code>) are accepted by the Simple API and returned through API v2 (<code>not_purchased_reason_id</code>). Reason <code>371</code> (<code>CUSTOMER_REQUEST</code>) is already confirmed by a test; that does not confirm the other IDs.'],
    ['open', 'Manual cancellation sends <code>378</code>; a request-linked cancellation sends its reason’s ID.'],
    ['open', 'Blocking: 13566, is_customer(S) = <code>"1"</code>, is_blocked(S) = <code>"1"</code>, Not purchased with reason <code>367</code>.'],
    ['open', 'Unblocking: is_blocked(S) = <code>"0"</code>, Purchased with the note ' + he('הוסדר תשלום') + '.'],
    ['open', 'Cancellation from BLOCKED / AWAITING_BANK_TRANSFER: 13568, is_blocked(S) = <code>"0"</code>, the correct <code>product_field_1061</code>.'],
    ['open', 'Recovery still carries the note ' + he('שחזור מנוי') + '; previous opportunities are not changed in any of these scenarios.'],
    ['open', 'The collective purchase (13566, is_customer(S) = <code>"1"</code>, Purchased with the purchase price, <code>product_field_1059</code> = the new <code>user_subscriptions.id</code>).'],
    ['open', cf(16899) + ' as plain text.'],
    ['live', "HMO / HMO plan: Hebrew names only. Stage confirmed by user, 2026-10-26; overall confirmation, not per-branch evidence. Production not verified."],
    ['open', 'Remaining profile scenarios: production, concurrent membership changes and untested negative branches. Stage field-value checks were confirmed by the user on 2026-10-26.'],
])}
<p><strong>Post-write verification</strong> (read-only, bounded, no resend): before the write and once after it, <code>GET /api/v2/opportunities?filter[customer_id]=…&amp;include=user,product_fields&amp;product_fields_format=map</code> is read (all pages, at most 10 × 100). A match is <code>product_id</code> + <code>product_field_1059</code> = the exact <code>user_subscriptions.id</code>; exactly one <strong>new</strong> such opportunity with the sent status (2 — purchase, recovery, unblocking; 3 — cancellation, blocking) and the sent values, including the reason ID (API v2 field <code>not_purchased_reason_id</code>; not yet observed live), 1060 and 1061 when sent → <code>confirmed</code>. Otherwise user 84 gets an “opportunity unconfirmed” email (<code>VERIFY_ABSENT</code>, <code>VERIFY_AMBIGUOUS</code>, <code>VERIFY_MISMATCH</code>, <code>VERIFY_PRE_EXISTING_ONLY</code>, <code>VERIFY_LOOKUP_FAILED</code>, etc.). HTTP 200 and “Customer has been added successfully” do not confirm the opportunity.</p>
${table(['Agent assessment', 'Meaning'], [
    ['<code>CONFIRMED</code>', 'The returned user Name equals <code>callmarker_agent_name</code> — a confirmed match by Name. If a CRM Name different from the Name is configured, the result is <code>IDENTITY_UNVERIFIED</code>.'],
    ['<code>AGENT_NOT_ASSIGNED</code>', 'The opportunity has no user — no assignment; email to user 84.'],
    ['<code>IDENTITY_UNVERIFIED</code>', 'A user with a different Name is assigned; the configured value may be that user’s CRM Name. The opportunity is confirmed, but it is <strong>not proven</strong> that this is the correct agent (API v2 does not return the CRM Name).'],
    ['<code>NOT_SENT</code>', '<code>callmarker_agent_name</code> is not set — no name was sent.']
])}
<p><strong>Verified behavior</strong> (historical controlled tests on stage, 2026-10-14/15, test customer 24622736 in campaign 13565; separate from the automatic flow):</p>
${table(['What was verified', 'Result'], oppVerified)}
<p>Historical “open, then close” sequence (the user’s report):</p>
${table(['#', 'Request', 'Result'], oppTests)}
${li([
    ['impl', 'Status <code>3</code> is <strong>not</strong> a cancellation of an existing sale: without an open opportunity it creates a new closed record. This is how a cancellation creates a separate Not purchased opportunity; the existing Purchased one is not changed.'],
    ['open', '<strong>There is no permanent duplicate protection</strong> — an explicit decision by the user (deferred). Without an open opportunity, every Purchased POST creates a new opportunity; repeated or concurrent events, two pods during a rollout, or a manual resend after a timeout can create duplicates. The status-order validation suppresses only sequential repeated callbacks. Repeated cancellation, recovery, blocking or unblocking events can create additional closed opportunities as well. <code>product_field_1059</code> is a correlation with the subscription row, not an enforced unique key (all opportunities of the same row share it); it helps find duplicates but does not prevent them. Payment idempotency is deferred as well.'],
    ['open', 'Creating Purchased without <code>opportunity_agent_name</code> has not been verified by a live test.']
])}
<p><strong>Agent configuration in CallMarker</strong> (for <code>users.callmarker_agent_name</code>):</p>
<ol class="status-steps">
<li>${T.next} Identify the correct existing CallMarker Agent user.</li>
<li>${T.next} Write its exact Name <strong>or</strong> its configured CRM Name to <code>users.callmarker_agent_name</code>. Only Name matching is confirmed live; a CRM Name cannot be checked through API v2, and the result is <code>IDENTITY_UNVERIFIED</code> when it differs from the Name.</li>
<li>${T.next} Do not associate a MediWho agent with an unrelated CallMarker user; if no suitable user exists, creating one is a separate administrative decision.</li>
<li>${T.next} Validate the assignment through the opportunity <code>user_id</code> (API v2) and in the dashboard; do not treat <code>IDENTITY_UNVERIFIED</code> as a proven match.</li>
</ol>
<p class="note">Do not replay payment callbacks as a test: payment and commission idempotency is unresolved.</p>

<h3 id="st-fields">8. Field mapping</h3>
<p>All custom fields are optional; the full set is sent by the customer test and user sync, while Contact Us sends only env and the lifecycle checkboxes. The first column shows the production ID and the “(S)” ID for dev/stage. Empty values are not sent. Full description in the cards of sections <a href="#customers">4</a> and <a href="#custom">5</a>. The “Live test” column distinguishes: <em>included and accepted</em> (the field was in the request and CallMarker responded with success) and <em>value verified in the UI</em> (marked ✓).</p>
${table(['Parameter', 'Source', 'Implemented', 'Live test', 'Decision'], fieldRows, 'fieldmap')}
<p class="note"><strong>Test 5 contents.</strong> Sent: ${cfs([16868, 16874, 16875, 16876, 16877, 16880, 16881, 16887, 16888, 16889, 16890, 16891])}. Not sent because they are empty for the test user (<code>EMPTY</code>): ${cfs([16873, 16882, 16883, 16884, 16885, 16886, 16892, 16894, 16895, 16896, 16898])}. Not sent for other reasons: ${cf(16893)} — <code>PENDING_CONFIRMATION</code>; ${cf(16869)} — <code>BIRTHDAY_FORMAT_NOT_CONFIGURED</code>; ${cf(16878)} and ${cf(16879)} — <code>SELECT_MAP_NOT_CONFIGURED</code>; ${cf(16867)} — <code>NOT_USED</code>. Top-level <code>env=dev</code> was also sent and ignored. The test 5 field values were not individually verified in the UI. Saving option “dev” in ${cf(16901)} does not confirm the option texts of ${cf(16878)} and ${cf(16879)}.</p>
${li([
    ['dec', 'Business rule: a customer is expected to have only one ACTIVE subscription. There is no database constraint.'],
    ['impl', 'If a customer has several own ACTIVE <code>user_subscriptions</code> rows with different products, the snapshot rows disagree: all six snapshot keys (including 16876/16877) are omitted as <code>AMBIGUOUS</code>, the user sync writes nothing (an <code>AMBIGUOUS_SOURCE_DATA</code> email), the customer test answers 409. Only rows with <code>user_id = users.id</code> are considered, without family membership.']
])}

<h3 id="st-live">9. Live tests and verification status</h3>
<p><strong>Customer test</strong> (historical records): user <code>11111483</code>, campaign <code>13565</code>, dev environment (<code>NODE_ENV=development</code>), 2026-10-11. Source — the user’s reports; the repository log describes steps 1–6 (discrepancies in <a href="#st-diff">section 14</a>).</p>
${table(['#', 'Number / format', 'Request contents', 'HTTP', 'CallMarker response', 'Observation'], liveRows)}
${li([
    ['live', 'The tested fields were accepted (test 5 contents in <a href="#st-fields">section 8</a>), but not all possible fields.'],
    ['live', 'An Israeli number in local form without <code>international</code> and <code>region</code> worked in this configuration.'],
    ['live', 'Selectbox accepts the option text: “dev” in ' + cf(16901) + ' was saved (test 7).'],
    ['open', 'The success response text is the same for create and update: they can be distinguished only in the CRM UI.'],
    ['open', 'HTTP 200 by itself does not mean business success: rejections 1 and 2 also came with HTTP 200.'],
    ['open', 'The CallMarker response text for test 7 was not recorded.'],
    ['open', 'E.164 + <code>international=1</code> with a valid number has not been verified.'],
    ['open', 'The rejected numbers were unsuitable test data. This does not mean that every “Invalid number format” response indicates an unallocated range.']
])}
<p><strong>Contact Us:</strong> website — stage test confirmed by the user (details not provided); +60 app — code review and mock tests only. Deployment dates and production results were not reported and are not listed here.</p>
<p><strong>Automated checks</strong> (this is <em>not</em> live verification): mock tests run by me on 2026-10-15 without network, DB or <code>.env</code> — Contact Us 34 of 34, customer test 43 of 43, user sync 67 of 67, subscription activation 17 of 17. ESLint was not run in this task; the last known error is the unused <code>isCard</code> in <code>KaveretController.js</code> (2026-10-14).</p>

<p><strong>Implemented flow on stage:</strong> the user confirmed that the deployed flow was verified successfully. Individual cases, response IDs and dates were not provided; there was no production verification. <strong>Opportunities and checkboxes:</strong> verified behavior is in <a href="#st-opportunity">section 7</a> and <a href="#st-lifecycle">section 6</a>; the user-confirmed cancellation and recovery results are in section 7. The cancellation, recovery and blocking mock tests (<code>tests/callmarker-subscription-cancellation-regressions.js</code>, <code>tests/callmarker-subscription-blocking-regressions.js</code>) were not run while preparing this documentation; blocking, unblocking and reason IDs have not been tested live.</p>

<h3 id="st-unverified">10. Unverified fields and cases</h3>
<ul class="status-list">
<li>${T.open} Production verification (the implemented flow was verified only on stage).</li>
<li>${T.open} A separate verification of Contact Us from the +60 app on stage.</li>
<li>${T.open} Creating a Purchased opportunity without <code>opportunity_agent_name</code>.</li>
<li>${T.open} The collective purchase on stage.</li>
<li>${T.open} Coverage of all three cancellation entry points (manual, Galil, scheduled): the user’s confirmation does not include it.</li>
<li>${T.open} ${cf(16899)} as plain text after deployment.</li>
<li>${T.open} Clearing ${cf(16876)} / ${cf(16877)} after a cancellation.</li>
<li>${T.open} Blocking, unblocking, reason IDs 367–378 except the confirmed 371 (including 378), cancellation from BLOCKED / AWAITING_BANK_TRANSFER with the 1061 note.</li>
<li>${T.open} Whether ${cf(16878)} and ${cf(16879)} (and their “(S)” versions) accept the values <code>1</code>/<code>0</code>; option texts “stage”/“prod” in ${cf(16901)}.</li>
<li>${T.live} Birthday: DD-MM-YYYY; stage confirmed by user, 2026-10-26; production not verified.</li>
<li>${T.open} The actual CallMarker field length limits for ${cf(16898)} (provisional 255-code-point integration cap) and ${cf(16899)} (no cap in the code).</li>
<li>${T.open} Parent and agency fields and ${cf(16873)} on a user who has them filled in.</li>
<li>${T.open} Foreign phone numbers; sending a valid number in E.164.</li>
<li>${T.open} How previously saved fields are cleared when omitted or sent empty.</li>
<li>${T.open} Phone number change and shared number.</li>
<li>${T.open} Adding a customer to a second campaign without moving it; statuses and agent assignments across campaigns.</li>
</ul>

<h3 id="st-deferred">11. Deferred functionality</h3>
<p>Nothing in this list is connected. Contact Us, user sync and the automatic purchase, cancellation and recovery opportunities do not belong here — they are implemented (sections 2, 6 and 7). A successful stage verification does not lift these limitations.</p>
${table(['Functionality', 'Status'], deferred)}

<h3 id="st-temp">12. Temporary implementation items</h3>
<p>State verified against the code on 2026-10-14.</p>
${table(['Item', 'Current state', 'What needs to be done'], tempRows)}

<h3 id="st-next">13. Recommended steps</h3>
<ol class="status-steps">
<li>${T.next} Decide when and how to verify the implemented flow in production; a successful stage verification does not replace it.</li>
<li>${T.next} Fill in <code>users.callmarker_agent_name</code> for providers (the correct CallMarker users) and verify Purchased creation without an agent name.</li>
<li>${T.next} Separately approve the rule for replacing unclear checkboxes on purchase.</li>
<li>${T.next} Get from CallMarker support a way to add a customer to a second campaign without moving it; until then purchase, cancellation and recovery for agents stay skipped.</li>
<li>${T.open} The collective purchase and ${cf(16899)} as plain text: ${PEND}. Stage must not be enabled through <code>NODE_ENV=production</code>; how to verify live is the user’s decision.</li>
<li>${T.next} Agree on clearing ${cf(16876)} / ${cf(16877)} after a cancellation.</li>
<li>${T.open} Blocking, unblocking, reason IDs 367–378 (except the confirmed 371) and the 1061 note: ${PEND} (list in <a href="#st-opportunity">section 7</a>).</li>
<li>${T.next} Business choice: which campaign a neutral update uses when an agent is active in both 13567 and 13566 (now <code>CLASSIFICATION_AMBIGUOUS</code>, nothing written; no priority is invented).</li>
<li>${T.next} A rapid chain of phone changes (a second change before the first is applied) fails (<code>PHONE_MISMATCH</code> / <code>PHONE_SUPERSEDED</code>); persistent state is deferred. <code>unique</code> is not used; no automatic retries or deduplication; model 208 is create-only; no automatic verification of every field.</li>
<li>${T.next} When the team decides, return to permanent opportunity duplicate protection and sync-state persistence.</li>
<li>${T.next} Connect the remaining registration branches and decide the behavior for family members, phone changes through other routes (except <code>PUT /user/admin/change-phone</code>) and shared numbers.</li>
<li>${T.next} Close the questions on Selectbox (1/0, env texts), text length limit and foreign phones.</li>
</ol>
<p class="note">Do not use payment callbacks as a test method: payment and commission idempotency is unresolved.</p>

<h3 id="st-diff">14. Discrepancies between sources</h3>
${table(['Topic', 'Source A', 'Source B', 'How it is reflected'], diffRows)}

<h3 id="st-decisions">15. Decision table</h3>
${table(['Topic', 'What is known now', 'Open question', 'Next action'], decisions)}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>`
