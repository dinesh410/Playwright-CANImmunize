# CANImmunize Playwright task

## Pre-requisites
- Node.js

## Steps to Install and Run the Tests

1. `npm ci` to install.
2. `npx playwright test` to run the tests
3. Report generated in the `./playwright-report` folder with an HTML file.

## Project Structure

- `tests/`: Contains the test files.
- `pages/`: Contains the page object models for different pages.
  - `HomePage.ts`: Page object model for the home page.
  - `LoginPage.ts`: Page object model for the login page.
  - ....
- `types`: Contains TypeScript type definitions.
    - `UseDetails.ts`: Type definition for user details.
- `utils/`: Contains utility classes and functions.
  - `Helpers.ts`: Utility functions to assist with common tasks.
  - ...
- `fixtures/`: Contains fixture data for tests.
    - `fixture.ts`: Initialize Page Objects 
    - `testdata/`: Contains test data files.
        - ...
- `playwright.config.ts`: Playwright configuration file.
- `Readme.md`: Project documentation file.
