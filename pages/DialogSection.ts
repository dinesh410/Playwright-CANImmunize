import { expect, Locator, Page } from '@playwright/test';

export class DialogSection {
  readonly page: Page;
  readonly okButton: Locator;
  readonly header: Locator;

  constructor(page: Page) {
    this.page = page;
    this.okButton = page.getByRole('dialog').getByRole('button', { name: 'OK' });
    this.header = page.locator('section[role="dialog"] h2');
  }

  async clickOkButton() {
    await this.okButton.click();
  }
  
  async verifyDialogMessage(message: string) {
    await expect(await this.header.textContent()).toBe(message);
  }
}
