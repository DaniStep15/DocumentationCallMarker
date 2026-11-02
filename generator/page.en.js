'use strict'
// English page content for callmarker_integration.html; assembled by build.js.
const { customers, customFields, opportunities, appointments, messages, he } = require('./data.en')
const statusSection = require('./status.en')

const SCOPE = {
    now: 'Use now',
    later: 'Considered later',
    notused: 'Not used now',
    deferred: 'Deferred',
    pending: 'Decision pending'
}
const IMPL = {
    match: 'Code matches decision',
    differs: 'Code differs',
    partial: 'Only when configured',
    temp: 'Temporary mode',
    absent: 'Not implemented',
    'absent-ok': 'Not sent (as planned)'
}
const badge = (kind, v) => `<span class="badge ${kind}-${v}">${(kind === 's' ? SCOPE : IMPL)[v]}</span>`
const slug = s => s.replace(/[{}]/g, '').replace(/[^a-z0-9_]+/gi, '-')

// ---- custom fields → common shape
const cfApi = t =>
    t.startsWith('Checkbox')
        ? 'Checkbox: the value must match a field option or be zero (documented). The integration sends <code>"1"</code>/<code>"0"</code>.'
        : t.startsWith('Selectbox')
        ? 'The value must exactly match an option from the field settings (documented for Select). The option list was not provided.'
        : t.startsWith('Date')
        ? 'The input format for Date custom fields is not documented. The follow-up/appointment date formats do not define it.'
        : 'General rule <code>custom_field_{id}</code>. For text fields, the format and length limits are not documented.'
const cf = customFields.map(f =>
    Object.assign({}, f, {
        key: `custom_field_${f.id}`,
        label: `<code>custom_field_${f.id}</code> <span class="bn">(${f.name}${f.alias ? ' / ' + f.alias : ''})</span>`,
        type: 'Optional. ' + f.ftype + '.' + (f.sid === f.id ? ' The ID is shared by all environments (there is no “(S)” version).' : ` ID on dev/stage: <code>custom_field_${f.sid}</code> (${f.name}(S)); in production — <code>custom_field_${f.id}</code> (${f.name}).`),
        api: cfApi(f.ftype)
    })
)

const withLabels = (list, prefix) =>
    list.map(p =>
        Object.assign({}, p, {
            anchor: `${prefix}-${p.key ? slug(p.key) : 'direction'}`,
            label: p.label || (p.key ? `<code>${p.key}</code>` : '<span class="unknown">(unnamed — direction; key unknown)</span>')
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
    ['meaning', 'API key and business meaning', ''],
    ['type', 'Required / type', ''],
    ['source', 'Mediwho source', ''],
    ['transform', 'Transformation and sending rules', ''],
    ['api', 'Documented API behavior', 'k-api'],
    ['current', 'Current implementation', 'k-cur'],
    ['live', 'Live test result 2026-10-11', 'k-live'],
    ['intended', 'Confirmed intended behavior', 'k-int'],
    ['open', 'Open questions / required validation', 'k-open']
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
<thead><tr><th>Parameter</th>${cols.map(x => `<th>${x[0]}</th>`).join('')}<th>Plan</th><th>Code now</th></tr></thead>
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
  <figcaption><strong>${title}</strong><span class="badge s-pending">Example — never sent in this form</span></figcaption>
  <p class="note">${note}</p>
  <div class="tablewrap"><table class="extable"><thead><tr><th>Exact API key</th><th>Example value</th><th>Explanation</th></tr></thead><tbody>
  ${rows.map(([k, v, a]) => `<tr><td><code>${k}</code></td><td><code>${v}</code></td><td>${a}</td></tr>`).join('')}
  </tbody></table></div>
  <pre class="raw" aria-label="Request body, decoded">POST https://app.callmarker.com/api/simple/customers
Content-Type: application/x-www-form-urlencoded   # encoding is a test assumption

${rows.map(([k, v]) => `${k}=${v}`).join('\n&amp;')}</pre>
  ${extra || ''}
</figure>`

const exCustomer = ex(
    'Example 1 — customer test on stage (the body the current code would build)',
    'Fictitious customer. The body is shown decoded, one parameter per line; the real body is a single URL-encoded string (Hebrew and JSON percent-encoded). Birthday uses the fixed DD-MM-YYYY format; some Selectbox values still require verification.',
    [
        ['crm_id', '100501', '<code>users.id</code>'],
        ['name', 'דנה', '<code>users.first_name</code>'],
        ['last_name', 'לוי', '<code>users.last_name</code>'],
        ['email', 'dana.levi@example.test', '<code>users.email</code>'],
        ['number', '0501234567', 'From <code>users.phone</code>. Temporary mode: an Israeli number in local form, without <code>international</code> and <code>region</code>.'],
        ['custom_field_16901', 'stage', 'custom_field_16901 (env): from <code>NODE_ENV=stage</code>; the ID is shared by all environments.'],
        ['custom_field_16954', '012345674', 'custom_field_16954 (identity(S)): leading zero preserved.'],
        ['custom_field_16955', '23-05-1990', 'birthday(S): DD-MM-YYYY; API v2: 1990-05-23.'],
        ['custom_field_17023', 'אבי', 'fathers_name(S): users.fathers_name.'],
        ['custom_field_16957', 'כללית', 'Enums.HMO_COMPANIES; Hebrew name only; unknown ID omitted.'],
        ['custom_field_16958', 'כללית פלטינום', 'custom_field_16958 (hmo_plan(S)): Hebrew name only from <code>users.hmo_plan_id</code>.'],
        ['custom_field_16959', '12', 'custom_field_16959 (active_product_id(S)): <code>products.id</code> per the Kaveret rule (fictitious ID).'],
        ['custom_field_16960', 'Example Product', 'custom_field_16960 (active_product_name(S)): <code>products.name</code>.'],
        ['custom_field_16964', '2024-01-02 03:04:05', 'custom_field_16964 (created_at(S)): “wall-clock” time without a time zone.'],
        ['custom_field_16965', '100400', 'custom_field_16965 (parent_id(S))'],
        ['custom_field_16966', 'אבי לוי', 'custom_field_16966 (parent_name(S))'],
        ['custom_field_16967', '0521111111', 'custom_field_16967 (parent_phone(S)): as stored.'],
        ['custom_field_16969', 'ילד', 'custom_field_16969 (parent_related_as(S)): CHILD → ילד.'],
        ['custom_field_16970', '100900', 'custom_field_16970 (agent_id(S)): inherited from the parent here.'],
        ['custom_field_16971', 'רון כהן', 'custom_field_16971 (agent_name(S)): informational; not the standard <code>agent_name</code>.'],
        ['custom_field_16972', '0541111111', 'custom_field_16972 (agent_phone(S))'],
        ['custom_field_16973', 'ron.cohen@example.test', 'custom_field_16973 (agent_email(S))'],
        ['custom_field_16975', '100950', 'custom_field_16975 (parent_agency_id(S)): <code>parent_agency_id</code> of the resolved agent.'],
        ['custom_field_16977', '0531111111', 'custom_field_16977 (parent_agency_phone(S)): the agency user.'],
        ['custom_field_16961', '0', 'custom_field_16961 (is_deleted(S)): <code>"1"</code>/<code>"0"</code>; whether the Selectbox accepts these values is not verified.'],
        ['custom_field_16962', '0', 'custom_field_16962 (is_blocked(S)): <code>"1"</code>/<code>"0"</code>.'],
        ['custom_field_16981', 'חיפה, הנמל 1, דירה 2, מיקוד 0000000', 'custom_field_16981 (address(S)): readable text, not JSON; at most 255 code points (a provisional integration cap).'],
        ['custom_field_16982', 'לקוח', 'custom_field_16982 (roles(S)): Hebrew labels as plain text joined with “, ”, not slugs (agreed format; in the API code since 2026-10-18, not verified on stage).'],
        ['campaign', '13565', `<code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (${he('בדיקות')}); a constant, added last by the controller.`],
        ['token', '&lt;CALLMARKER_TOKEN&gt;', 'Secret placeholder; <code>CallMarker.sendCustomer</code> appends it at the very end. The real value is never shown.']
    ],
    '<p class="note">On stage, the customer test sends the “(S)” IDs of custom fields; in production the endpoint is closed (404). The customer test does not send the lifecycle checkboxes; custom_field_16963 (blocked_agent(S)) is for agents only; custom_field_16980 (subscriptions(S)) is not sent. Also not sent in this example: missing optional values (for example, custom_field_16956 (passport(S)), custom_field_16968 (parent_email(S)), custom_field_16974 (agent_mentor(S)), custom_field_16978 (parent_agency_email(S)), custom_field_16979 (parent_agency_mentor(S))); custom_field_16976 (parent_agency_name(S)) — <code>PENDING_CONFIRMATION</code>; custom_field_16867 (advertisement / ' +
        he('מודעה') +
        ') — <code>NOT_USED</code>; all standard parameters with the status “Not used now”; top-level <code>env</code>.</p>'
)

const exContact = ex(
    'Example 4 — Contact Us lead from the website (stage)',
    `Fictitious data. The website sent <code>{"params":{"name":"דנה לוי כהן","phone":"050-123-4567"}}</code>: the first word becomes <code>name</code>, all remaining words become <code>last_name</code>. This is an implemented flow; this particular example was not sent.`,
    [
        ['name', 'דנה', 'First word of the name from the form.'],
        ['last_name', 'לוי כהן', 'All remaining words. In the +60 app the name is not split, and an empty last name is sent as an empty string.'],
        ['number', '0501234567', '<code>normalizePhone(phone, \'972\')</code> + <code>callMarkerNumber</code>: an Israeli number in local form. An explicit foreign number (<code>+</code>/<code>00</code>) would be sent in E.164 with <code>international=1</code>.'],
        ['source', 'אתר Mediwho', 'Set by the server from origin <code>SITE</code>; for <code>APP</code> it is <code>אפליקציית +60</code>.'],
        ['campaign', '13565', 'stage — <code>TESTS_CAMPAIGN</code>; production — <code>LEADS_CAMPAIGN</code> = <code>13558</code>; nothing is sent in development.'],
        ['custom_field_16901', 'stage', 'custom_field_16901 (env): from <code>NODE_ENV</code>.'],
        ['custom_field_16988', '1', 'custom_field_16988 (is_lead(S)): only for a new number (the API v2 lookup did not find a card).'],
        ['custom_field_16999', '0', 'custom_field_16999 (is_registered_without_subscription(S)).'],
        ['custom_field_16992', '0', 'custom_field_16992 (is_customer(S)).'],
        ['custom_field_16996', '0', 'custom_field_16996 (is_former_customer(S)).'],
        ['ignore_duplicates', '1', 'Explicit only in Contact Us. A “Duplicate customer” response is possible, including for a number from another campaign.'],
        ['token', '&lt;CALLMARKER_TOKEN&gt;', 'Added inside <code>sendCustomer</code>.']
    ],
    '<p class="note">Not sent: <code>crm_id</code>, <code>email</code>, <code>birthday</code> and the full-customer custom fields. In production, a lead is also sent to Kaveret in parallel and independently through the website landing page.</p>'
)

const exPhone = `
<figure class="example">
  <figcaption><strong>Example 2 — phone transmission variants</strong><span class="badge s-pending">Alternatives, do not combine</span></figcaption>
  <div class="tablewrap"><table class="extable"><thead><tr><th>Mode</th><th>Exact parameters</th><th>Explanation</th></tr></thead><tbody>
  <tr><td>Current code: Israeli number (TEMP)</td><td><code>number=0501234567</code></td><td>No flags. A valid Israeli number in this form was accepted in the live test.</td></tr>
  <tr><td>Current code: foreign number</td><td><code>number=+447911123456&amp;international=1</code></td><td>Fictitious UK number, only with an explicit <code>+</code>/<code>00</code>. Not tested.</td></tr>
  <tr><td>E.164 mode for Israel</td><td><code>number=+972501234567&amp;international=1</code></td><td>Was rejected for a number from an unallocated range; must be repeated with a valid number.</td></tr>
  <tr><td>region mode (not implemented)</td><td><code>number=0501234567&amp;region=IL</code></td><td>ISO alpha-2, not a dialing code. Not tested.</td></tr>
  </tbody></table></div>
</figure>`

const exOpp = ex(
    'Example 3 — automatic Purchased opportunity (current code)',
    'Fictitious data. The opportunity fields travel in the <strong>same</strong> POST as the customer on personal subscription activation (campaign 13566, without <code>source</code>); only the opportunity fields are shown below. The opportunity parameter names are the same in all environments. Cancellation and recovery use the same mapping for their row: cancellation — <code>opportunity_status=3</code> with a reason ID (campaign 13568), blocking — <code>3</code> with reason <code>367</code>, recovery and unblocking — <code>2</code> plus <code>product_field_1060</code> (campaign 13566). Historical manual tests are in the <a href="#st-opportunity">overview</a>.',
    [
        ['product_id', '7794', '<code>subscriptions.callmarker_product_id</code> of the tariff (example: tariff 192 / SKU I-0004). No value — the opportunity is not sent.'],
        ['opportunity_crm_id', '192', '<code>user_subscriptions.subscription_id</code>: the tariff, not the purchase; not an idempotency key.'],
        ['opportunity_price', '90', '<code>user_subscriptions.price</code>; applied only when the product has an open price.'],
        ['opportunity_status', '2', 'Purchased (purchase; the same on recovery and unblocking). Without an open opportunity, a new closed opportunity is created.'],
        ['opportunity_agent_name', '&lt;users.callmarker_agent_name&gt;', 'The exact CallMarker user Name <strong>or</strong> that user’s configured CRM Name; if the column is empty, the parameter is not sent. Confirmed live for the Name “Yuval Kopel REP”; a CRM Name cannot be checked through API v2 (only id and Name).'],
        ['product_field_1057', 'רון כהן - 100900', 'Provider: first name last name - <code>users.id</code>, plain text.'],
        ['product_field_1058', 'Example Product', '<code>products.name</code> of the purchased tariff (Kaveret rule).'],
        ['product_field_1059', '88231', '<code>user_subscriptions.id</code>: a link to the specific purchase, not a unique key.']
    ],
    '<p class="note">There is no persistent duplicate protection (the user’s decision): a repeated event or a retry after a timeout can create a second opportunity. After the write, the opportunity is verified only by reading through API v2.</p>'
)

// ---- risks & differences in the current code
const risks = [
    ['Phone (TEMP)', '<code>callMarkerNumber</code> (shared by all flows): Israeli numbers are sent in local form without <code>international</code>/<code>region</code>; foreign numbers as E.164 + <code>international=1</code>; local non-Israeli numbers are rejected.', 'No mode chosen; neither of the two documented modes is used for Israel.', 'The main phone description in <code>callmarker_instructions.md</code> still refers to E.164 + <code>international=1</code>. The E.164 rejection is proven only for a number from an unallocated range.'],
    ['Opportunities without duplicate protection', 'Purchase, cancellation, recovery, blocking and unblocking opportunities are sent automatically without persistent duplicate protection (an explicit decision by the user).', 'Deferred by the user, as is payment idempotency.', 'Repeated or concurrent events, two pods during a rollout or a manual resend after a timeout can create duplicates. <code>product_field_1059</code> helps find them but does not prevent them; all opportunities of the same row share it. Repeated sends can create additional closed opportunities.'],
    ['Active product after cancellation', 'custom_field_16876 (active_product_id) and custom_field_16877 (active_product_name) are omitted after a cancellation, not cleared.', 'A clearing method is not agreed.', 'The previous product may remain in the CRM.'],
    ['Moving between campaigns', 'A sync write with another campaign moves the customer (test 2026-10-14).', 'Multi-campaign operations are needed.', 'The customer may leave the previous campaign (a test observation, not a general contract); agents’ own subscriptions are now written with membership preservation verified after the write (no <code>unique</code>, repair or retry).'],
    ['custom_field_16873 (passport)', 'Any non-NULL value is sent as a string.', 'Schema in the repository: <code>tinyint(1) NOT NULL DEFAULT 0</code>.', '<code>"0"</code>/<code>"1"</code> may be sent instead of a passport number.'],
    ['custom_field_16886 (parent_related_as)', `The placeholder ${he('לא הוזן')} is sent if <code>related_as</code> is not recognized.`, 'The Kaveret translations are confirmed; there is no explicit decision about the placeholder.', 'The CRM receives the text “not entered”.'],
    ['custom_field_16881 (created_at)', '<code>YYYY-MM-DD HH:mm:ss</code> without a time zone.', 'Current format with the described limitation.', 'Ambiguous time.'],
    ['Active subscription', 'Two own ACTIVE rows with different products — diverging snapshot rows, the send is blocked.', 'The “one active subscription” invariant is a business rule.', 'Family members without their own subscription get empty 16876/16877.'],
    ['Shared Kaveret snapshot', 'Used for active_product_id/name, is_deleted, is_blocked, blocked_agent and roles.', 'The shared SQL is not changed.', 'The defective JOIN can still multiply rows (see section 10).'],
    ['CallMarker responses', 'HTTP 200 and “Customer has been added successfully” do not confirm the opportunity, its price, status or agent.', 'Post-write verification is read-only through API v2.', 'A timeout leaves the result undetermined; there are no retries.'],
    ['Example env file', 'There is no <code>.env.example</code>; placeholders are in <code>callmarker_instructions.md</code>.', '—', 'Variables are set manually (Azure Key Vault for stage).'],
    ['Tests and lint', 'Mock tests I ran on 2026-10-15 (without network, DB or <code>.env</code>): Contact Us — 34, customer test — 43, user sync — 67, subscription activation — 17; all passed. ESLint was not run in this task; the last known error is the unused <code>isCard</code> in <code>KaveretController.js</code> (2026-10-14).', '—', 'Mock tests do not prove compatibility with the CRM.']
]
const fixed = [
    '<code>campaign</code> is sent instead of <code>campaign_id</code>; the test campaign is the constant <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> (13565).',
    'The route has <code>auth</code> + <code>is:(admin or developer)</code> protection (commit <code>ac3ecdd09</code>, 2026-10-12); on 2026-10-11, in the uncommitted version, it was commented out.',
    'The code is consolidated into three main files: <code>CallMarkerController.js</code>, <code>app/Modules/CallMarker.js</code>, <code>app/Utils/callMarkerCustomer.js</code>.',
    '<code>region</code> is no longer sent together with E.164.',
    "HMO and HMO plan: Hebrew catalog names only; unknown IDs omitted. Birthday: fixed DD-MM-YYYY; fathers_name: own user, trimmed (17022 / 17023). Stage confirmed by user, 2026-10-26; production unverified.",
    'custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name) — <code>products.id</code> / <code>products.name</code> per the Kaveret rule (since 2026-10-14).',
    'Custom field IDs are chosen by environment: “(S)” on dev/stage, the original ones in production; env is the shared custom_field_16901 (env).',
    'custom_field_16878 (is_deleted) and custom_field_16879 (is_blocked) are sent as <code>"1"</code>/<code>"0"</code>; option maps are no longer used.',
    'custom_field_16897 (subscriptions) is no longer sent; custom_field_16898 (address) is readable text with a provisional 255-code-point integration cap.',
    'The Purchased opportunity is sent automatically with the internal CallMarker product ID (<code>subscriptions.callmarker_product_id</code>) and is verified by reading after the write.',
    'An ordinary ACTIVE → CANCELED cancellation (manual, Galil, scheduled) and a CANCELED → ACTIVE recovery are synced with separate Not purchased and Purchased opportunities (commits <code>2282e8548</code> and <code>04b1126a5</code>, 2026-10-18); the collective purchase is connected to <code>SUBSCRIPTION_ACTIVATED</code>.',
    'Blocking and unblocking are synced (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>), cancellation covers BLOCKED and AWAITING_BANK_TRANSFER, Not purchased opportunities get a reason ID (367–378), and a cancellation from a blocked state gets the <code>product_field_1061</code> note (commits <code>98ecc453f</code> and <code>dabf47e63</code>, 2026-10-18); custom_field_16899 (roles) is sent as plain text.',
    'The agent and agency are read with separate queries (<code>CallMarker.loadCustomer</code>); the defective JOIN is not used for agency fields.',
    'Ambiguous data blocks the send; the shape of the raw result is validated (<code>readRawRows</code>).',
    'All values are sent as strings; <code>CONTRACT_FIELDS</code> describes the contract and is verified by a test, but does not filter fields at runtime.'
]

// ---- checklist: [text, doneNote]
const checklist = [
    ['Transport and authorization', [
        ['A form-urlencoded POST is accepted; the exact success response text is recorded.', 'done: “Customer has been added successfully”'],
        ['The <code>token</code> parameter in the body is accepted; API v2 is read with a separate Bearer token.', 'done'],
        ['Response for a missing or invalid token.', ''],
        ['<code>auth</code> + <code>is:(admin or developer)</code> protection on the customer test route.', 'done: in the code since the 2026-10-12 commit']]],
    ['Implemented flow on stage', [
        ['The deployed flow was verified on stage.', 'done: confirmed by the user (individual cases and IDs were not provided)'],
        ['Verification in production.', '']]],
    ['Contact Us', [
        ['Website: validation on stage.', 'done: confirmed by the user'],
        ['+60 app: separate controlled validation on stage (lead, campaign 13565, <code>source</code>, empty last name, review account).', ''],
        ['<code>ignore_duplicates=1</code>: “Duplicate customer” response for a number from another campaign.', 'observed (user report)'],
        ['The alert email to user 84 actually arrives (sending the event does not prove delivery).', '']]],
    ['Campaigns', [
        ['A write with another campaign moves the customer.', 'observed: test 2026-10-14'],
        ['Updating data through one campaign changes the customer’s shared data in other campaigns.', 'confirmed by the user'],
        ['How to add a customer to a second campaign without moving it (a question for CallMarker support).', ''],
        ['Effect of <code>unique</code> on the agents campaign; agent statuses and assignments across campaigns.', '']]],
    ['Lifecycle checkboxes', [
        ['<code>fields[customers]</code> with <code>include=custom_fields&amp;custom_fields_format=map</code>; a ticked checkbox is <code>"1"</code>, an unticked one is <code>null</code>.', 'done: the user’s report'],
        ['Sending <code>"0"</code> unticks the checkbox.', 'done: the user’s report'],
        ['The three steps “lead → registered → customer” preserve the production and agent checkboxes, the test marks and env.', 'done: the user’s report'],
        ['Cancellation: campaign 13568, is_former_customer = <code>"1"</code>, the other three — <code>"0"</code>, is_agent and is_test unchanged.', 'done: confirmed by the user on stage (not all entry points)']]],
    ['Phone modes', [
        ['Israel, local form without flags (current TEMP).', 'done: a valid number was accepted'],
        ['Israel, E.164 + <code>international</code>, with a <em>valid</em> number.', ''],
        ['Local number + <code>region=IL</code>; both flags together.', ''],
        ['Foreign numbers (for example, GB, US, IT — the leading-zero case).', ''],
        ['Empty <code>country_code</code>; a non-resident with an Israeli number.', '']]],
    ['birthday format', [
        ['Verify production birthday 16869 with DD-MM-YYYY after deployment; stage 16955 is confirmed.', ''],
        ['Behavior with an invalid format.', '']]],
    ['Selectbox options', [
        ['Selectbox accepts the option text: “dev” in custom_field_16901 (env) is stored and displayed.', 'done: test 7'],
        ['The “stage” and “prod” option texts in custom_field_16901 (env).', ''],
        ['Whether custom_field_16878 (is_deleted) and custom_field_16879 (is_blocked), including the “(S)” versions, accept the values <code>1</code>/<code>0</code>.', '']]],
    ['Text values', [
        ['The leading zero in custom_field_16868 (identity) is preserved in the UI (the code does this, verified by a mock test; not compared in the CRM).', ''],
        ['Display of custom_field_16881 (created_at) and the chosen time zone.', ''],
        ['The actual CallMarker field length limits for custom_field_16898 (address; provisional 255-code-point integration cap) and custom_field_16899 (roles; no cap in the code).', ''],
        ['custom_field_16899 (roles) as plain text after deployment.', '']]],
    ['Customer duplicates', [
        ['Re-sending with the same number without flags.', 'done: record updated, no duplicate (test 4)'],
        ['The customer is identified by number; a different number with the same <code>crm_id</code> creates a new CRM row.', 'confirmed by the user'],
        ['Business decisions: phone change, a number shared within a family.', '']]],
    ['Clearing fields', [
        ['Whether an omitted field keeps its previous value.', ''],
        ['Whether an empty value clears it.', '']]],
    ['Opportunities', [
        ['The internal CallMarker product ID is required.', 'done: historical test'],
        ['Direct creation as Purchased.', 'done: historical test'],
        ['The exact Name “Yuval Kopel REP” → CallMarker agent 13619; an unknown name does not prevent closing, but the assignment is empty.', 'done: historical test'],
        ['Opened → Purchased and Opened → Not purchased update the same open opportunity; without an open opportunity, status 2 or 3 creates a new closed one.', 'done: historical test'],
        ['A repeated <code>opportunity_crm_id</code> does not prevent duplicates; fields 1057/1058/1059 are preserved on closing.', 'done: historical test'],
        ['A cancellation creates a new Not purchased opportunity; previous opportunities are not changed.', 'done: confirmed by the user on stage'],
        ['A recovery creates a new Purchased opportunity with <code>product_field_1060</code>; previous opportunities are not changed.', 'done: confirmed by the user on stage'],
        ['Collective purchase on stage: 13566, is_customer, Purchased with the purchase price, <code>product_field_1059</code> = the new <code>user_subscriptions.id</code>.', ''],
        ['Reason IDs 367–378 are accepted and returned through API v2 (<code>not_purchased_reason_id</code>), including 378.', ''],
        ['Manual cancellation sends 378; a request-linked cancellation sends its reason’s ID.', ''],
        ['Blocking: 13566, is_blocked = 1, Not purchased with reason 367; unblocking: is_blocked = 0, Purchased with the note ' + he('הוסדר תשלום') + '.', ''],
        ['Cancellation from BLOCKED / AWAITING_BANK_TRANSFER: 13568, is_blocked = 0, the correct <code>product_field_1061</code>.', ''],
        ['Recovery keeps the note ' + he('שחזור מנוי') + '; previous opportunities are not changed in any of these scenarios.', ''],
        ['Creating Purchased without <code>opportunity_agent_name</code>.', ''],
        ['CRM Name matching (API v2 cannot confirm identity: only id and Name).', ''],
        ['Persistent protection against duplicate opportunities.', '']]],
    ['Responses', [
        ['Collect the observed response texts: “Customer has been added successfully”, “Invalid number format”, “Duplicate customer” and others. The response to test 7 was not recorded.', 'partially'],
        ['HTTP 200 by itself does not prove creation; verify the opportunity through API v2.', '']]]
]

// ---- campaigns
const campaigns = [
    ['LEADS_CAMPAIGN', '13558', 'לידים', '1', 'Contact Us in production', 'Contact Us (confirmed)'],
    ['TESTS_CAMPAIGN', '13565', 'בדיקות', '2', 'Customer test always; Contact Us on stage; historical manual opportunity tests', 'Tests'],
    ['CUSTOMERS_CAMPAIGN', '13566', 'לקוחות', '3', 'Personal subscription activation (<code>SUBSCRIPTION_ACTIVATED</code>, including the collective purchase) recovery (<code>SUBSCRIPTION_RECOVERED</code>), blocking and unblocking (<code>SUBSCRIPTION_BLOCKED</code> / <code>SUBSCRIPTION_UNBLOCKED</code>): customer and a separate opportunity', 'Subscription became ACTIVE (purchase, recovery from CANCELED, unblocking) or was blocked'],
    ['AGENTS_CAMPAIGN', '13567', 'סוכנים', '4', 'Agent registration and agent address', 'Agent registration'],
    ['FORMER_CUSTOMERS_CAMPAIGN', '13568', 'לקוחות לשעבר', '5', 'ACTIVE / BLOCKED / AWAITING_BANK_TRANSFER → CANCELED cancellation (<code>SUBSCRIPTION_CANCELED</code>): customer and a separate Not purchased opportunity with a reason ID', 'Cancellation: manual, Galil, scheduled future cancellation execution (from ACTIVE only)'],
    ['REGISTERED_WITHOUT_SUBSCRIPTION', '13569', 'רשום ללא מנוי', '6', 'User registration on the website and by an agent', 'Ordinary user registration']
]

const toc = [
    ['purpose', 'Purpose and scope'],
    ['reading', 'How to read this page'],
    ['flow', 'How the test endpoint works'],
    ['customers', 'Customers: standard parameters'],
    ['custom', 'Custom fields'],
    ['opportunities', 'Opportunities'],
    ['appointments', 'Appointments (deferred)'],
    ['messages', 'Inbound messages (deferred)'],
    ['differences', 'Risks and code discrepancies'],
    ['agency-defect', 'Agency JOIN defect in the snapshot'],
    ['campaigns', 'Campaign reference'],
    ['examples', 'Request examples'],
    ['checklist', 'Manual verification checklist'],
    ['unresolved', 'Unresolved questions'],
    ['sources', 'Sources']
]

const total = Object.keys(groups).reduce((n, g) => n + groups[g].length, 0)
const AGENCY_RANGE = 'custom_field_16892 (parent_agency_id) – custom_field_16896 (parent_agency_mentor)'

module.exports = () => ({
    lang: 'en',
    title: 'CallMarker Integration',
    total,
    body: `<div class="layout">
<nav class="toc" aria-label="Table of contents">
  <h2>Overview</h2>
  <p class="toc-overview"><a href="#status">CallMarker: integration status and open questions</a></p>
  <h2>Reference</h2>
  <ol>${toc.map(([id, t]) => `<li><a href="#${id}">${t}</a></li>`).join('')}</ol>
</nav>
<main id="top">
<header class="top">
  <h1>Mediwho → CallMarker Integration</h1>
  <div class="meta">Parameter reference and implementation status · reviewed on 2026-10-11 against the current API repository code · documentation only: code, routes, schema and behavior were not changed; no requests were sent to the CRM.</div>
</header>
<div class="print-toc"><strong>Contents:</strong> Overview: CallMarker: integration status and open questions · ${toc.map(([, t], i) => `${i + 1}. ${t}`).join(' · ')}</div>



<div class="callout"><strong>Status.</strong> Implemented: the customer test endpoint (always campaign 13565), Contact Us from the website and the +60 app, user sync (agent registration, customer creation on the website and by an agent, agent address) personal subscription activation with <strong>automatic delivery of the Purchased opportunity</strong>, cancellation from ACTIVE, BLOCKED or AWAITING_BANK_TRANSFER (a separate Not purchased opportunity with a reason ID), recovery (a new Purchased opportunity with the note ${he('שחזור מנוי')}), blocking (Not purchased with reason 367) and unblocking (Purchased with the note ${he('הוסדר תשלום')}). The user confirmed a successful stage verification, including ordinary cancellation and recovery (individual cases were not provided; there was no verification in production). Blocking, unblocking, reason IDs, the 1061 note and the collective purchase have not been tested live yet. A short overview is on a separate page: <a href="#status">“CallMarker: integration status and open questions”</a>.</div>
${statusSection()}

<div class="filters" role="search">
  <input id="q" class="f-q" type="search" placeholder="Filter parameters (key, name, table, text)…" aria-label="Filter parameters">
  <select id="fscope" class="f-scope" aria-label="Filter by plan"><option value="">Any plan</option>${Object.keys(SCOPE).map(k => `<option value="${k}">${SCOPE[k]}</option>`).join('')}</select>
  <select id="fimpl" class="f-impl" aria-label="Filter by code"><option value="">Any code status</option>${Object.keys(IMPL).map(k => `<option value="${k}">${IMPL[k]}</option>`).join('')}</select>
  <span class="count f-count" id="count" data-tpl-all="Parameters: {t}" data-tpl-some="Showing {n} of {t}">Parameters: ${total}</span>
</div>

<section id="purpose">
<h2>1. Purpose and scope</h2>
<p>CallMarker is to <strong>gradually replace Kaveret</strong> as the CRM that receives Mediwho customer data. <strong>MyBusiness remains</strong> and keeps working unchanged. The Kaveret path (<code>app/Modules/Kaveret.js</code>, which on prod sends the <code>Kaveret.scopeGetUserInfo</code> snapshot to a Make webhook) is not changed; the CallMarker test uses the shared snapshot only for six computed values.</p>
<ul>
<li><strong>Now:</strong> the customer test endpoint; Contact Us (website and +60 app); user sync on agent registration, customer creation, agent address, personal subscription activation (together with the automatic Purchased opportunity), cancellation (a separate Not purchased opportunity with a reason ID), recovery (a new Purchased opportunity), blocking and unblocking. See the <a href="#st-lifecycle">overview</a>.</li>
<li><strong>Not implemented:</strong> other status transitions (CARD_BLOCKED and AWAITING_BANK_APPROVAL → CANCELED, expiry), manual activation of other statuses, import and administrative paths, Fly/RDG, the remaining registration branches, family members, persistent duplicate protection for opportunities, storing campaign membership, appointments, inbound messages.</li>
<li><strong>Secrets:</strong> the token is set manually in <code>CALLMARKER_TOKEN</code>. This page shows only the placeholder <code>&lt;CALLMARKER_TOKEN&gt;</code>.</li>
</ul>
</section>

<section id="reading">
<h2>2. How to read this page</h2>
<p>Each custom field is written as the exact API key with the business name in parentheses, for example <code>custom_field_16893</code> <span class="bn">(parent_agency_name)</span>. Request bodies contain only the exact key. A parameter card has rows, and the colored categories are strictly separated:</p>
<div class="legend">
  <div><span class="swatch" style="background:var(--api)"></span><strong>Documented API behavior</strong> — only what the provided CallMarker document says.</div>
  <div><span class="swatch" style="background:var(--cur)"></span><strong>Current implementation</strong> — what the code in the API repository does now, based on reading the files.</div>
  <div><span class="swatch" style="background:var(--live)"></span><strong>Live test result</strong> — what is recorded in the 2026-10-11 test log and in user reports (tests 1–7); not reproduced here. Distinguished: field included in the request, request accepted, value verified in the UI.</div>
  <div><span class="swatch" style="background:var(--int)"></span><strong>Confirmed intended behavior</strong> — Mediwho business decisions. Implemented and verified only where the rows above say so.</div>
  <div><span class="swatch" style="background:var(--open)"></span><strong>Open questions / required validation</strong> — unresolved questions and validations against the real CRM.</div>
</div>
<h3>Labels</h3>
<div class="tablewrap"><table><thead><tr><th>Plan label</th><th>Meaning</th><th>Code label</th><th>Meaning</th></tr></thead><tbody>
<tr><td>${badge('s', 'now')}</td><td>Part of the current customer scope.</td><td>${badge('i', 'match')}</td><td>The code follows the confirmed decision (based on reading the code).</td></tr>
<tr><td>${badge('s', 'later')}</td><td>Considered for the next stage.</td><td>${badge('i', 'differs')}</td><td>The code does something other than what is confirmed or documented.</td></tr>
<tr><td>${badge('s', 'notused')}</td><td>Understood, but not used now.</td><td>${badge('i', 'partial')}</td><td>Sent only when an optional setting is configured.</td></tr>
<tr><td>${badge('s', 'deferred')}</td><td>The whole block is deferred.</td><td>${badge('i', 'temp')}</td><td>A temporary solution in the code until the next CRM test.</td></tr>
<tr><td>${badge('s', 'pending')}</td><td>A mapping or mode has been proposed but not decided.</td><td>${badge('i', 'absent')}</td><td>No code, although the parameter is proposed or needed.</td></tr>
<tr><td></td><td></td><td>${badge('i', 'absent-ok')}</td><td>Not sent, and this matches the plan.</td></tr>
</tbody></table></div>
<p class="note">General sending rules: missing optional values are omitted rather than sent empty; all values are sent as strings (leading zeros and a meaningful <code>0</code> are preserved). Whether omission or an empty value clears stored data is unknown. “If set” flags are not sent when not needed.</p>
</section>

<section id="flow">
<h2>3. How the test endpoint works</h2>
<p>Files: <code>start/routes/call-marker.js</code> (route), <code>app/Controllers/Http/CallMarkerController.js</code> (HTTP validation, dry run, live send conditions), <code>app/Modules/CallMarker.js</code> (data reading, HTTP sending, Contact Us), <code>app/Utils/callMarkerCustomer.js</code> (pure mapping and transformations), <code>tests/callmarker-customer-regressions.js</code>. The route is registered in <code>start/routes/index.js</code>.</p>
<ol class="steps">
<li><strong>Route.</strong> <code>POST /call-marker/test/customer</code>, protected by <code>auth</code> + <code>is:(admin or developer)</code> (<code>start/routes/call-marker.js:9</code>).</li>
<li><strong>Environment guard.</strong> If <code>NODE_ENV</code> is neither <code>development</code> nor <code>stage</code>, the controller responds <code>404 NOT_FOUND</code>. The env value sent to CallMarker does not replace this guard.</li>
<li><strong>Input.</strong> <code>user_id</code> must match <code>^\\d{1,10}$</code> and be &gt; 0, otherwise <code>400 INVALID_USER_ID</code>. <code>dry_run</code>: absent, empty, <code>true</code> or <code>1</code> — dry run; <code>false</code> or <code>0</code> — live; otherwise <code>400 INVALID_DRY_RUN</code>.</li>
<li><strong>Loading (read-only).</strong> <code>CallMarker.loadCustomer()</code>: the <code>users</code> row (missing — <code>404 USER_NOT_FOUND</code>), the parent, the resolved agent (own, otherwise the parent’s agent), the agency user by <code>agent.parent_agency_id</code>, the customer’s own ACTIVE <code>user_subscriptions</code> rows with <code>subscriptions.name</code>, plus the shared Kaveret snapshot. The shape of the raw result is validated (<code>readRawRows</code>): unexpected — <code>500 UNEXPECTED_RAW_RESULT</code>/<code>UNEXPECTED_RAW_ROW</code>, empty snapshot — <code>500 SNAPSHOT_MISSING</code>.</li>
<li><strong>Mapping.</strong> <code>buildCustomerPayload()</code> returns the allowed fields, <code>omitted[{field, label, reason}]</code>, <code>ambiguities</code>, <code>warnings</code> and <code>phone{source, warnings, sent_format}</code>. Omission reasons: <code>EMPTY</code>, <code>NOT_USED</code>, <code>PENDING_CONFIRMATION</code>, <code>SOURCE_ROW_NOT_FOUND</code>, <code>AMBIGUOUS</code>, <code>INVALID_JSON</code>, <code>INVALID_SHAPE</code>, <code>INVALID_DATE</code>, <code>SELECT_MAP_NOT_CONFIGURED</code>, <code>SELECT_VALUE_NOT_MAPPED</code>. A phone error yields <code>422</code>.</li>
<li><strong>Campaign.</strong> Always <code>CAMPAIGNS_LIST.TESTS_CAMPAIGN</code> = <code>13565</code>; neither the environment nor the request changes it. <code>config_complete_for_live = Boolean(fields.campaign)</code> is kept for compatibility: it reflects only the presence of a campaign (currently always <code>true</code>) and does <strong>not</strong> mean readiness for a live send — the token, the enable flag and ambiguities are verified only on the live path.</li>
<li><strong>Dry run.</strong> <code>200 {dry_run:true, user_id, url, content_type, fields, omitted, ambiguities, phone, warnings, config_complete_for_live}</code>. No HTTP request is made and the response contains no token, but it does contain the customer’s personal data.</li>
<li><strong>Live send conditions.</strong> First the network policy: only <code>NODE_ENV=production</code> + <code>CALLMARKER_ENABLED=true</code>, and the endpoint answers 404 in production, so the live mode is currently unavailable everywhere (<code>403 CALLMARKER_DISABLED</code>); <code>CALLMARKER_TEST_ENABLED=true</code> cannot override it. The dry run remains available. Then (historical condition) <code>CALLMARKER_TEST_ENABLED</code> must be exactly <code>true</code>, otherwise <code>403 CALLMARKER_TEST_DISABLED</code>. Non-empty <code>ambiguities</code> → <code>409 AMBIGUOUS_SOURCE_DATA</code>. No token → <code>503 CALLMARKER_NOT_CONFIGURED</code>.</li>
<li><strong>HTTP transport.</strong> <code>CallMarker.sendCustomer</code>: a single form-urlencoded POST to the fixed URL <code>https://app.callmarker.com/api/simple/customers</code>; <code>token</code> is added only here; 15 s timeout; any HTTP status is accepted; no retries. The customer test does not send the <code>source</code> and <code>ignore_duplicates</code> flags — they exist only in Contact Us.</li>
<li><strong>Response handling.</strong> Any CallMarker status → our <code>200 {dry_run:false, upstream:{status, body}, creation_confirmed:false, …}</code>; the body is kept as is, the token is stripped. No response → <code>502</code> with <code>TIMEOUT</code> or <code>NETWORK_ERROR</code>. Exception → <code>500 INTERNAL_ERROR</code>. Only error codes are logged. CallMarker may respond with HTTP 200 and an error text (“Invalid number format”), so the body must be inspected.</li>
</ol>
<h3>Environment variables (names only)</h3>
<div class="tablewrap"><table><thead><tr><th>Variable</th><th>Purpose</th></tr></thead><tbody>
<tr><td><code>NODE_ENV</code> + <code>CALLMARKER_ENABLED</code></td><td>The global switch: CallMarker requests only with <code>production</code> + <code>true</code> (raw values, strict); disabled by default; a change needs a restart.</td></tr>
<tr><td><code>CALLMARKER_TEST_ENABLED</code></td><td>The second condition of the live test; cannot override the global switch.</td></tr>
<tr><td><code>CALLMARKER_TOKEN</code></td><td>Secret Simple API token (write); the user sets it manually. Read only on live paths.</td></tr>
<tr><td><code>CALLMARKER_ACCESS_TOKEN</code></td><td>Secret read-only Bearer token for API v2: user sync, Contact Us lookup, opportunity verification.</td></tr>
<tr><td><code>CALLMARKER_TEST_CAMPAIGN_ID</code></td><td><strong>Historical</strong>: this is how the campaign was set in the 2026-10-11 tests. Not read since 2026-10-12; the campaign is a constant from <code>CAMPAIGNS_LIST</code>.</td></tr>
<tr><td><code>CALLMARKER_IS_DELETED_MAP</code>, <code>CALLMARKER_IS_BLOCKED_MAP</code></td><td><strong>No longer used</strong> (since 2026-10-14): custom_field_16878 (is_deleted) and custom_field_16879 (is_blocked) are sent as <code>"1"</code>/<code>"0"</code>.</td></tr>
</tbody></table></div>
<p class="note"><code>.env.example</code> no longer exists in the repository; placeholders are given in <code>callmarker_instructions.md</code>. For stage, the variables are set in Azure Key Vault.</p>
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="customers">
<h2>4. Customers: standard parameters</h2>
<p>Endpoint <code>POST|GET https://app.callmarker.com/api/simple/customers</code>; the documented response format is a string. The body encoding is not documented (form-urlencoded is a test assumption that works according to the log; files require multipart). Top-level <code>env</code> is not supported (ignored in tests 4–5) and has been replaced by the <code>custom_field_16901</code> (env) field. Custom fields are in <a href="#custom">section 5</a>.</p>
${summary(groups.cust, [['Meaning', 'meaning']])}
<h3>Parameter details</h3>
${groups.cust.map(card).join('')}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="custom">
<h2>5. Custom fields</h2>
<p>Documented general rule for <code>custom_field_{id}</code>: <em>Checkbox</em> values must match a configured option or be zero; <em>Select</em> values must match a configured option. All fields are optional. <strong>IDs depend on the environment:</strong> dev and stage use the “(S)” IDs, production uses the original ones (both are given in the cards); env is the shared custom_field_16901 (env). The “(S)” sets separate only custom data: standard customer fields (name, number, email, <code>crm_id</code>, <code>source</code>), number matching and campaign membership are shared by all environments. IDs <code>16870</code>–<code>16872</code> were not provided; custom_field_16900 (insurance_question) exists in the account but is not used.</p>
<div class="callout"><strong>Agent resolution (as in Kaveret).</strong> The customer’s own agent if <code>users.agent_id</code> is set; otherwise the parent’s agent. Fields custom_field_16887 (agent_id) – custom_field_16891 (agent_mentor) describe this agent, and ${AGENCY_RANGE} describe the user found by its <code>parent_agency_id</code>. In the current code, <code>CallMarker.loadCustomer</code> does this with separate queries.</div>
${summary(groups.cf, [['CRM type', 'ftype'], ['Confirmed source', 'source']])}
<h3>Field details</h3>
${groups.cf.map(card).join('')}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="opportunities">
<h2>6. Opportunities</h2>
<div class="callout"><strong>Opportunities are sent automatically</strong> in the same POST as the customer: on personal subscription activation — Purchased (campaign 13566), on cancellation — a separate Not purchased (status <code>3</code> with a reason ID, campaign 13568), on blocking — Not purchased with reason <code>367</code>, on recovery and unblocking — a new Purchased with <code>product_field_1060</code> (campaign 13566). Mapping: <code>subscriptions.callmarker_product_id</code>, <code>user_subscriptions.subscription_id</code>, <code>user_subscriptions.price</code>, status <code>2</code>, <code>users.callmarker_agent_name</code>, product fields 1057/1058/1059. There is no persistent duplicate protection. Details, post-write verification and historical tests are in the <a href="#st-opportunity">overview</a>; see example 3.</div>
${summary(groups.opp, [['Source', 'source']])}
<h3>Parameter details</h3>
${groups.opp.map(card).join('')}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="appointments">
<h2>7. Appointments (deferred)</h2>
<p>The whole block is deferred and not used now. Appointment parameters are also passed in the Customers request, so they must be absent. CallMarker appointments are not the same as Mediwho medical appointments.</p>
${summary(groups.appt, [['Documented meaning', 'meaning'], ['Values', 'type']])}
<h3>Parameter details</h3>
${groups.appt.map(card).join('')}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="messages">
<h2>8. Inbound messages (deferred)</h2>
<p>Endpoint <code>POST|GET https://app.callmarker.com/api/simple/customers/messages</code>; request — form-data or JSON; response — string or JSON. The whole block is deferred. The endpoint <strong>records</strong> a message in CallMarker; the provided documentation does not indicate that it sends or delivers anything to the customer. The source does not name the direction parameter, so its key is marked as unknown.</p>
${summary(groups.msg, [['Documented meaning', 'meaning'], ['Values', 'type']])}
<h3>Parameter details</h3>
${groups.msg.map(card).join('')}
<p><a class="top-link" href="#top">↑ Back to top</a></p>
</section>

<section id="differences">
<h2>9. Risks and discrepancies in the current code</h2>
<p>Based on reading the files on 2026-10-11, after the parallel session’s edits. Fixes were not taken on trust: every item below was verified against the code.</p>
<div class="tablewrap"><table><thead><tr><th>Area</th><th>Current code</th><th>Expectation (documentation / decision)</th><th>Consequence</th></tr></thead><tbody>
${risks.map(r => `<tr>${r.map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}
</tbody></table></div>
<h3>Fixed compared with the previous code version</h3>
<ul>${fixed.map(x => `<li>${x}</li>`).join('')}</ul>
</section>

<section id="agency-defect">
<h2>10. Agency JOIN defect in the shared snapshot</h2>
<p>The shared Kaveret query <code>app/Models/Kaveret.js</code> (<code>scopeGetUserInfo</code>) is unchanged and contains:</p>
<pre>LEFT JOIN users parent_agent ON agent.parent_agency_id = parent.id      -- line 235
...
CASE WHEN u.parent_agency_id IS NOT NULL THEN JSON_OBJECT('id', parent_agent.id, ...) -- lines 87-96</pre>
<ul>
<li><strong>The ON condition does not reference <code>parent_agent</code> at all.</strong> If <code>agent.parent_agency_id = parent.id</code> is false or NULL, <code>parent_agent</code> is NULL. If it is true, <em>every</em> <code>users</code> row matches: the snapshot is multiplied by the size of the entire users table.</li>
<li><strong>Wrong trigger.</strong> The object is built from the customer’s <em>own</em> <code>u.parent_agency_id</code> rather than the agent’s; inherited agents (<code>agent_of_parent</code>) are not taken into account.</li>
<li><strong>A second source of duplicates.</strong> <code>LEFT JOIN user_subscriptions us_active … status = 'ACTIVE'</code> repeats the user for each of their own ACTIVE rows.</li>
<li><strong>What CallMarker does now.</strong> The <code>agent</code>/<code>parent_agency</code> and <code>hmo</code> objects of the snapshot are not used: the agent, the agency and <code>users.hmo_id</code> are read by <code>CallMarker.loadCustomer</code> with separate queries. In the general customer mapping only custom_field_16876 (active_product_id), custom_field_16877 (active_product_name), custom_field_16878 (is_deleted), custom_field_16880 (blocked_agent; agents only) and the labels of custom_field_16899 (roles) come from the snapshot. Loaded or calculated separately: custom_field_16879 (is_blocked) — <code>blockingSubscriptionsQuery</code>; custom_field_16898 (address) — from the <code>addresses</code> rows; the opportunity field <code>product_field_1058</code> — by its own purchase loading rule (<code>loadPurchase</code>). custom_field_16897 (subscriptions) is not sent (<code>NOT_USED</code>).</li>
<li><strong>Duplicate snapshot rows.</strong> <code>pickSnapshot</code> compares rows by <code>SNAPSHOT_KEYS</code>: active_product_id, active_product_name, is_deleted, is_blocked, blocked_agent, roles. This set is not the set of sent fields: the snapshot is_blocked (BLOCKED only) is not sent to CallMarker but still takes part in the comparison, and blocked_agent is compared for non-agents too. Identical rows are collapsed with the warning <code>SNAPSHOT_DUPLICATE_ROWS_IDENTICAL</code>. If rows disagree, all six keys are omitted as <code>AMBIGUOUS</code>: the user sync writes nothing and sends an <code>AMBIGUOUS_SOURCE_DATA</code> email, the customer test answers 409. Duplicates from the agency JOIN do not change these keys; two own ACTIVE subscriptions with different products produce disagreeing rows.</li>
<li><strong>Residual risk.</strong> When the condition is “true”, the query returns as many rows as there are users in the table. This puts load on the DB and memory, although the data is correct. Kaveret, for its part, sends all rows to its webhook.</li>
</ul>
<p><strong>Correct agency source:</strong> <code>users agency ON agency.id = resolved_agent.parent_agency_id</code> — this is what <code>CallMarker.loadCustomer</code> does. The shared SQL is intentionally left unchanged because Kaveret depends on it. Fixing it is a separate task with its own Kaveret regression testing.</p>
</section>

<section id="campaigns">
<h2>11. Campaign reference</h2>
<p>The catalog is <code>CAMPAIGNS_LIST</code> in <code>app/Constants/Enums.js</code>; IDs are stored as strings. The “# in CSV” column is the position in the <code>campaigns.csv</code> export, not the ID (in the export, Min. Calls = 30, Time Between = 180 and status Active for all; units are not specified). Detailed transition rules are in the <a href="#st-lifecycle">summary</a>.</p>
<div class="tablewrap"><table><thead><tr><th>Key</th><th>ID</th><th>Name</th><th># in CSV</th><th>Used in code now</th><th>Approved rule</th></tr></thead><tbody>
${campaigns.map(([key, id, name, n, now, rule]) => `<tr><td><code>${key}</code></td><td><code>${id}</code></td><td>${he(name)}</td><td>${n}</td><td>${now}</td><td>${rule}</td></tr>`).join('')}
</tbody></table></div>
<p class="note">Not all transitions are connected. Cancellation writes to 13568 only from ACTIVE, BLOCKED and AWAITING_BANK_TRANSFER through three connected paths (manual cancellation, Galil, scheduled future cancellation execution; the scheduled cancellation handles ACTIVE only); CARD_BLOCKED and AWAITING_BANK_APPROVAL → CANCELED are not connected. The connected blocking (ACTIVE → BLOCKED / AWAITING_BANK_TRANSFER, CANCELED → BLOCKED) and unblocking transitions write to 13566. Manual activation of other statuses and expiry are not connected; subscription contexts are skipped for users with their own agent role (the agent combinations are not implemented). A write with another campaign moves the customer (test 2026-10-14). The current membership can be read through API v2 (<a href="#st-lifecycle">overview</a>), but a write does not preserve it. Statuses that are not synced (for example, CARD_BLOCKED, EXPIRED) keep the previous membership, so a campaign cannot be derived from a single current status snapshot.</p>
</section>

<section id="examples">
<h2>12. Request examples with explanations</h2>
<p>Only fictitious data and secret placeholders. Example 1 shows the body the current code would build; this exact set was not sent. Similar requests with other data passed in the live test.</p>
${exCustomer}
${exPhone}
${exOpp}
${exContact}
</section>

<section id="checklist">
<h2>13. Manual verification checklist</h2>
<p>Only the test campaign (${he('בדיקות')}, <code>13565</code>), a dedicated test user and a manually set token. Record every response verbatim, without the token. The “done” marks are taken from the 2026-10-11 live test log; the checkboxes are working notes and are not saved.</p>
${checklist
    .map(
        ([t, items]) =>
            `<h3>${t}</h3><ul class="check">${items
                .map(
                    ([i, done]) =>
                        `<li><input type="checkbox" aria-label="done"${done.startsWith('done') ? ' checked' : ''}><span>${i}</span>${done ? `<span class="done">✓ ${done}</span>` : ''}</li>`
                )
                .join('')}</ul>`
    )
    .join('')}
</section>

<section id="unresolved">
<h2>14. Unresolved questions</h2>
<ol>
<li><strong>Contact Us from the +60 app:</strong> live verification pending; stage network access disabled by current policy (code reviewed and covered by mock tests).</li>
<li><strong>Phone mode:</strong> keep or remove the temporary local form for Israel; repeat <a href="#cust-international">E.164 + international</a> with a valid number; decide on <a href="#cust-region">region</a> and foreign numbers.</li>
<li><strong>env:</strong> replacing top-level <a href="#cust-env">env</a> with <a href="#cf-custom_field_16901">custom_field_16901 (env)</a> is approved, the “dev” option is confirmed by test 7; the “stage” and “prod” option texts remain to be verified.</li>
<li><strong>Phone change and shared number:</strong> the customer is identified by number; a different number creates a new CRM row. <strong>Family member behavior</strong> — deferred.</li>
<li><strong>Storing campaign membership and sync state</strong> — deferred. For Contact Us the error policy is decided: an alert email without retries, limitations accepted.</li>
<li><strong>The <a href="#st-newclient">/new-client</a> flow:</strong> whether to connect CallMarker to it and who generates the link.</li>
<li><strong>Campaign transitions</strong> (<a href="#st-lifecycle">partially implemented</a>): other status transitions, manual activation of other statuses and agents with a personal subscription are not connected; how to add a customer to a second campaign without moving it is a question for CallMarker support; <code>unique</code> can remove the agents campaign.</li>
<li><strong>Standard <a href="#cust-agent_name">agent_name</a></strong>: mapping for agent assignment.</li>
<li><strong><a href="#cust-unique">unique</a> / <a href="#cust-ignore_duplicates">ignore_duplicates</a></strong>: <code>ignore_duplicates</code> is used explicitly in Contact Us; “Duplicate customer” was observed for a number from another campaign. The meaning of <code>unique</code> and the use of the flags in future flows are not approved. There are no inclusion rules for <a href="#cust-duplicate_days">duplicate_days</a>, <a href="#cust-remove">remove</a> and <a href="#cust-attachment">attachment</a>.</li>
<li><strong>custom_field_16869 (birthday)</strong> — production verification of DD-MM-YYYY (stage confirmed); <strong>custom_field_16878 (is_deleted) / custom_field_16879 (is_blocked)</strong> — whether the Selectbox accepts the values <code>1</code>/<code>0</code>; <strong>custom_field_16881 (created_at)</strong> — time zone.</li>
<li><strong>custom_field_16893 (parent_agency_name)</strong>: confirm the mapping.</li>
<li><strong>custom_field_16873 (passport)</strong>: verify the actual column type.</li>
<li><strong>custom_field_16886 (parent_related_as)</strong>: whether to send the placeholder ${he('לא הוזן')}.</li>
<li><strong>Active subscription for family members</strong> (custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name)).</li>
<li><strong>custom_field_16899 (roles)</strong>: plain text is in the API code since 2026-10-18; deployment and live verification pending; stage network access disabled by current policy.</li>
<li><strong>Length limits</strong> for custom_field_16897 (subscriptions), custom_field_16898 (address) and custom_field_16899 (roles); custom_field_16898 (address) was not sent in the tests.</li>
<li><strong>Parent and agency fields</strong> (custom_field_16882 (parent_id) – custom_field_16886 (parent_related_as), custom_field_16892 (parent_agency_id), custom_field_16894 (parent_agency_phone) – custom_field_16896 (parent_agency_mentor)): empty for the test user, not verified.</li>
<li><strong>Opportunities</strong> (<a href="#st-opportunity">overview</a>): persistent duplicate protection and payment idempotency — deferred by the user; acceptance of reason IDs 367–378 and the <code>product_field_1061</code> note are not tested live; blocking and unblocking are not verified on stage; clearing custom_field_16876 (active_product_id) / custom_field_16877 (active_product_name) after a cancellation is unresolved; the collective purchase is not verified on stage; creating Purchased without <code>opportunity_agent_name</code> is not verified; the rule for replacing unclear checkboxes on purchase is the current code behavior, not separately approved.</li>
<li><strong>Messages:</strong> the name of the <a href="#msg-direction">direction key</a>. <strong>Appointments and messages</strong> are deferred entirely.</li>
<li><strong>Clearing fields</strong> and a complete <strong>catalog of CallMarker responses</strong>.</li>
</ol>
</section>

<section id="sources">
<h2>15. Sources</h2>
<ul>
<li><code>CallMarker API simple documentation.md</code> and <code>campaigns.csv</code> (from the user; used as reference data).</li>
<li><code>docs/instructions/callmarker_instructions.md</code> (including the 2026-10-11 live test log) and <code>docs/instructions/callmarker_parameter_contract.md</code> — documents from the parallel session. Confirmed decisions on this page take precedence; test results are taken from there without reproduction.</li>
<li><code>start/routes/call-marker.js</code>, <code>app/Controllers/Http/CallMarkerController.js</code>, <code>app/Modules/CallMarker.js</code>, <code>app/Utils/callMarkerCustomer.js</code>, <code>app/Controllers/Http/KaveretController.js</code>, <code>app/Listeners/CallMarkerListener.js</code>, <code>app/Listeners/EmailListener.js</code>, <code>start/events.js</code>, <code>start/routes/kaveret.js</code>, <code>start/routes/app-60-plus.js</code>, <code>tests/callmarker-customer-regressions.js</code>, <code>tests/callmarker-contact-us-regressions.js</code>.</li>
<li><code>app/Models/Kaveret.js</code>, <code>app/Modules/Kaveret.js</code>, <code>app/Constants/Enums.js</code> (<code>CAMPAIGNS_LIST</code>), <code>docs/models/users.yml</code>, <code>docs/models/user_subscriptions.yml</code>, migrations for <code>passport</code>, <code>parent_agency_id</code> and <code>provided_by</code>.</li>
</ul>
<p class="note">To prepare this page, the <code>.env</code> file and the token value were not read; no connections were made to the database or the CRM.</p>
</section>
</main>
</div>`
})
