import { Locator, Page } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly usersMenuItemButton: Locator;
  readonly usersLinkButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usersMenuItemButton = page.locator('#users-sub-menu');
    this.usersLinkButton = page.getByRole('link', { name: 'Users' });
  }

  /**
   * Navigates to the Users tab.
   *
   * @returns {Promise<void>} A promise that resolves when the navigation is complete.
   */
  async goToUsersTab(): Promise<void> {
    await this.page.goto('/orgadminusers');
  }

  /**
   * Opens the Users menu.
   *
   * @returns {Promise<void>} A promise that resolves when the Users menu is opened.
   */
  async openUsersMenu(): Promise<void> {
    await this.usersMenuItemButton.click();
  }

  /**
   * Clicks the Users link button.
   *
   * @returns {Promise<void>} A promise that resolves when the Users link button is clicked.
   */
  async clickUsersLinkButton(): Promise<void> {
    await this.usersLinkButton.click();
  }

  /**
   * Navigates to the Users tab by opening the Users menu and clicking the Users link button.
   *
   * @returns {Promise<void>} A promise that resolves when the navigation is complete.
   */
  async navigateToUsersTab(): Promise<void> {
    await this.openUsersMenu();
    await this.clickUsersLinkButton();
  }
}
