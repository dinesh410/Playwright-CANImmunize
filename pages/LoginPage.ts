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

  async navigate() {
    await this.page.goto('/');
  }

  async enterEmail(email: string) {
    await this.emailInput.fill(email);
  }

  async enterPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  async clickContinueButton() {
    await this.continueButton.click();
  }

  async login(email: string, password: string) {
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