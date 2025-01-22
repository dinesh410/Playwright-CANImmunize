import { Page, Locator, expect } from '@playwright/test';

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

  /**
   * Clicks the OK button in the dialog.
   *
   * @returns {Promise<void>} A promise that resolves when the OK button is clicked.
   */
  async clickOkButton(): Promise<void> {
    await this.okButton.click();
  }

  /**
   * Verifies that the dialog message matches the expected message.
   *
   * @param {string} message - The expected message in the dialog.
   * @returns {Promise<void>} A promise that resolves when the message is verified.
   */
  async verifyDialogMessage(message: string): Promise<void> {
    await expect(await this.header.textContent()).toBe(message);
  }

  /**
   * Enters the first name in the dialog.
   *
   * @param {string} firstName - The first name to enter.
   * @returns {Promise<void>} A promise that resolves when the first name is entered.
   */
  async enterFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  /**
   * Enters the last name in the dialog.
   *
   * @param {string} lastName - The last name to enter.
   * @returns {Promise<void>} A promise that resolves when the last name is entered.
   */
  async enterLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  /**
   * Enters the email in the dialog.
   *
   * @param {string} email - The email to enter.
   * @returns {Promise<void>} A promise that resolves when the email is entered.
   */
  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Searches for a user in the dialog.
   *
   * @param {string} searchValue - The value to search for.
   * @returns {Promise<void>} A promise that resolves when the search is performed.
   */
  async searchForUser(searchValue: string): Promise<void> {
    await this.page.getByRole('dialog').isVisible();
    await this.searchInput.fill(searchValue);
  }

  /**
   * Clicks the Done button in the dialog.
   *
   * @returns {Promise<void>} A promise that resolves when the Done button is clicked.
   */
  async clickDoneButton(): Promise<void> {
    await this.doneButton.click();
  }

    /**
   * Edits the user details in the dialog.
   *
   * @param {string} firstName - The first name to enter.
   * @param {string} lastName - The last name to enter.
   * @param {string} email - The email to enter.
   * @returns {Promise<void>} A promise that resolves when the user details are edited.
   */
  async editUserDetails(firstName: string, lastName: string, email: string): Promise<void> {
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

    /**
   * Searches for a role and adds it to the user.
   *
   * @param {string} roleName - The name of the role to search for and add.
   * @returns {Promise<void>} A promise that resolves when the role is added.
   */
  async searchAndAddRole(roleName: string): Promise<void> {
    await this.searchForUser(roleName);
    const selectedRow = await this.page.getByRole('dialog').locator(`tr:has-text("${roleName}")`);
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
