# Cloud Choosr

Simple prototype SPA & BFF to view, filter and sort cloud info returned by [https://api.aiven.io/v1/clouds](https://api.aiven.io/v1/clouds).

## Setup

### SPA setup

Install dependendencies with `npm install`. App tested on Node 14.9.0 & NPM 6.14.8 (macOS 12.1).

### BFF setup

In _./bff_, install dependendencies with `pipenv install --dev`. App tested on Python 3.7.12 & pipenv 2022.1.8 (macOS 12.1).

## Quickstart

After Setup, run both bff and spa in dev mode with `chmod u+x start.sh && ./start.sh`.

## Available Scripts

### SPA

In the project directory, you can run:

#### `npm start`

Runs the app in the development mode. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

#### `npm test`

Launches the test runner in the interactive watch mode.

#### `npm test:ci`

Runs tests

#### `npm run build`

Builds the app for production to the `build` folder. It correctly bundles React in production mode and optimizes the build for the best performance.

To view built app, run `npx serve -s build` and open [http://localhost:5000](http://localhost:5000) to view it in the browser. Note: no proxy to overcome CORS is available for running production SPA with BFF.

#### `npm run lint`

Lints code with ESLint.

#### `npm run autofix`

Attempts to autofix ESLint and Prettier findings.

### BFF

In the _/bff_ subdirectory, you can run:

#### `pipenv run sanic -d modules.server:app`

Runs bff server in dev mode.

#### `pipenv run sanic modules.server:app`

Runs bff server in prod mode.

#### `pipenv run test`

Runs BFF API tests.

#### `pipenv run format`

Prettify BFF code with Black.

## License

MIT

## Credits

Idea by [Aiven](https://github.com/aiven).
