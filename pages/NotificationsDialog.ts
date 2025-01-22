import { Page, expect, Locator } from '@playwright/test';

export class NotificationsDialog {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Verifies that the specified text is present in the dialog.
   *
   * @param {string} expectedText - The text to verify.
   * @returns {Promise<void>} A promise that resolves when the text is verified.
   */
  async verifyText(expectedText: string): Promise<void> {
    // Locate the text element
    const textLocator: Locator = await this.page.getByText(expectedText, { exact: false });

    // Ensure the element is visible
    await expect(textLocator).toBeVisible();
  }
}
