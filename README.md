# CallMarker integration documentation

Bilingual Russian/English reference for the MediWho CallMarker integration: field mappings, lifecycle events, supported routes, verification history and known limitations.

## Read the documentation

Download or clone this repository and open [callmarker_integration.html](callmarker_integration.html) in a browser. Use the language switcher to select Russian or English. The HTML is self-contained and does not require a running API or credentials.

This repository contains implementation details and known limitations. Historical test results do not establish the current deployed production state. Documentation is reference material and does not authorize API requests.

## Build

Node.js is required; there are no third-party build dependencies.

```sh
npm run build
```

The command rebuilds `callmarker_integration.html` from `generator/`. Edit the generator sources and rebuild the HTML together.

| Files | Purpose |
| --- | --- |
| `generator/data.js`, `generator/data.en.js` | Parameter reference |
| `generator/page.ru.js`, `generator/page.en.js` | Documentation pages |
| `generator/status.js`, `generator/status.en.js` | Integration status and decisions |
| `generator/build.js` | Self-contained HTML builder |

## Network policy

The application permits CallMarker requests only when both raw settings are exactly `NODE_ENV=production` and `CALLMARKER_ENABLED=true`. The default is disabled. Stage and local application environments cannot send CallMarker requests under this policy. Changing deployment environment values requires restarting the application.

This documentation project itself makes no CRM requests and stores no credentials. Do not commit tokens, environment files or customer exports.
