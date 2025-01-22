import { expect, Locator, Page } from '@playwright/test';

export class DialogSection {
  readonly page: Page;
  readonly okButton: Locator;
  readonly header: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly saveButton: Locator;
  readonly doneButton: Locator;
  readonly searchInput: Locator;
  readonly addToUserButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.okButton = page.getByRole('dialog').getByRole('button', { name: 'OK' });
    this.header = page.locator('section[role="dialog"] h2');
    this.firstNameInput = page.locator('input#firstName');
    this.lastNameInput = page.locator('input#lastName');
    this.emailInput = page.locator('input#email');
    this.saveButton = page.getByRole('dialog').getByRole('button', { name: 'Save' });
    this.doneButton = page.getByRole('dialog').getByRole('button', { name: 'Done' });
    this.searchInput = page.getByPlaceholder('Search');
    this.addToUserButton = page.locator('button:has-text("Add to User")');
  }

  async clickOkButton() {
    await this.okButton.click();
  }
  
  async verifyDialogMessage(message: string) {
    await expect(await this.header.textContent()).toBe(message);
  }

  async enterFirstName(firstName: string) {
    await this.firstNameInput.fill(firstName);
  }

  async enterLastName(lastName: string) {
    await this.lastNameInput.fill(lastName);
  }

  async enterEmail(email: string) { 
    await this.emailInput.fill(email);
  }

  async searchForUser(searchValue: string) {  
    await this.page.getByRole('dialog').isVisible();
    await this.searchInput.fill(searchValue);
  }

  async clickDoneButton() { 
    await this.doneButton.click();
  }

  async editUserDetails(firstName: string, lastName: string, email: string) {
    // Intercept the API response
    const apiResponsePromise = this.page.waitForResponse((response) =>
      response.url().includes('/fhir/v1/org-admin-user') && response.request().method() === 'PUT'
    );
    await this.enterFirstName(firstName);
    await this.enterLastName(lastName);
    await this.enterEmail(email);
    await this.saveButton.click();

     // Wait for the API response
     const apiResponse = await apiResponsePromise;

     // Validate the response
     await expect(apiResponse.status()).toBe(200); // HTTP status for success"
  }

  async searchAndAddRole(searchValue: string) {
    await this.searchForUser(searchValue);
    const selectedRow = await this.page.getByRole('dialog').locator(`tr:has-text("${searchValue}")`);
    // Intercept the API response
    const apiResponsePromise = this.page.waitForResponse((response) =>
      response.url().includes('/fhir/v1/org-admin-user') && response.request().method() === 'PUT'
    );

    await selectedRow.locator('button:has-text("Add to User")').click();

    // Wait for the API response
    const apiResponse = await apiResponsePromise;

    // Validate the response
    await expect(apiResponse.status()).toBe(200); // HTTP status for success"

    // Validate the button text
    expect(await selectedRow.locator('button:has-text("Added")')).toBeVisible();
  }
}
