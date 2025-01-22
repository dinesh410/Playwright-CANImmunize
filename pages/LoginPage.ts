import { expect, Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('#username');;
    this.passwordInput = page.locator('#password');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
  }

  /**
   * Navigates to the login page.
   *
   * @returns {Promise<void>} A promise that resolves when the navigation is complete.
   */
  async navigateToLoginPage(): Promise<void> {
    await this.page.goto('/');
  }

  /**
   * Enters the email in the login form.
   *
   * @param {string} email - The email to enter.
   * @returns {Promise<void>} A promise that resolves when the email is entered.
   */
  async enterEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  /**
   * Enters the password in the login form.
   *
   * @param {string} password - The password to enter.
   * @returns {Promise<void>} A promise that resolves when the password is entered.
   */
  async enterPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  /**
   * Clicks the Continue button in the login form.
   *
   * @returns {Promise<void>} A promise that resolves when the Continue button is clicked.
   */
  async clickContinueButton(): Promise<void> {
    await this.continueButton.click();
  }

    /**
   * Logs in using the provided email and password.
   *
   * @param {string} email - The email to use for login.
   * @param {string} password - The password to use for login.
   * @returns {Promise<void>} A promise that resolves when the login is complete.
   */
    async login(email: string, password: string): Promise<void> {
    // Intercept the API response
    const apiResponsePromise = this.page.waitForResponse((response) =>
      response.url().includes('/fhir/v1/user') && response.request().method() === 'GET'
    );

    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.clickContinueButton();
    // Wait for the API response
    const apiResponse = await apiResponsePromise;
    
    // Validate the response
    await expect(apiResponse.status()).toBe(200); // HTTP status for success"
    await expect(this.page.url()).toContain('/home');    
  }
}