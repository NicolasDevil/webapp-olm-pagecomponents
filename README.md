# webapp-ng-pagecomponents

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
# WebEx Next Generation Web App

---

## Check Points 
### UI Design Disciplines
#### Consistency
- __Consistent with real life:__ in line with the process and logic of real life, and comply with languages and habits that the users are used to.
- __Consistent within interface:__ all elements should be consistent, such as: design style, icons and texts, position of elements, etc.
#### Feedback
- __Operation feedback:__ enable the users to clearly perceive their operations by style updates and interactive effects.
- __Visual feedback:__ reflect current state by updating or rearranging elements of the page.
#### Efficiency
- __Simplify the process:__ keep operating process simple and intuitive.
- __Definite and clear:__ enunciate your intentions clearly so that the users can quickly understand and make decisions.
- __Easy to identify:__ the interface should be straightforward, which helps the users to identify and frees them from memorizing and recalling.
#### Controllability
- __Decision making:__ giving advices about operations is acceptable, but do not make decisions for the users.
- __Controlled consequences:__ users should be granted the freedom to operate, including canceling, aborting or terminating current operation.
---

## Browser Support
Modern browsers and Internet Explorer 11.

---
## Accessibility Support
All Cisco products will need to follow the new Web Content Accessibility Guidelines (WCAG) v2.1.
https://cisco.sharepoint.com/sites/Accessibility/

#### Proposed Actions:
- Follow the new Accessibility Design Requirements (ADRs) http://cc-acc-1.cisco.com/accessibility/acc_center/home.html
- If applicable, all component must be tested for accessibility
- The most important step is to contact the Accessibility Team from the beginning of a new component design/accessibility issue fix
---

## Modify The Cisco Icons
> We use the Atlantic-Icons for Webex icon library.

## How To Add/Edit Icons
 1. Use the https://icomoon.io/app tool to import the JSON.(elementUI/packages/theme-default/Atlantic-Icons.json)
 2. Add/Edit your new SVG icons (Use the same naming convention).
 3. Generate the four icon font files.
 4. Upload them in the elementUI/packages/theme-default/src/fonts.
 5. Update the icon CSS in elementUI/packages/theme-default/src/wbxicon.css.
 6. Add/Edit your icon in the elementUI/examples/icon.json.
 7. See the icon in http://0.0.0.0:8085/#/en-US/component/icon after npm run dev.
 8. Update the Atlantic-Icons.json you generated. (The latest json is required for the next modification)
---

## Common CSS adjustment
Comply with the Open-Close principle for the common CSS changes, open for adding new, close for changing/removing.

---

## Before Merge Code Into Master

```bash
# update UI component versions in order to generate new packages.
npm version patch
```

---

## Setup
Prerequisites: [Node.js](https://nodejs.org/en/) (use node 8.x+), npm version 3+ and [Git](https://git-scm.com/).

### Install Dependencies
```bash
yarn install
```
### Run Local Dev
```bash
# Start local server at  http://0.0.0.0:8080 with hot reload
npm start
```

### Build
```bash
# build for production with minification
npm run build

# build for production with lint check
npm run dist_all

```

### Test
```bash
# run unit tests
npm run test

# run all tests
npm test_all

```

