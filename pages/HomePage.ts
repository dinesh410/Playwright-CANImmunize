
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

    // Actions
    async goToUsersTab() {
      await this.page.goto('/orgadminusers');
    }
  

  async openUsersMenu() {
    await this.usersMenuItemButton.click();
  }

  async clickUsersLinkButton() {
    await this.usersLinkButton.click();
  }

  async navigateToUsersTab() {
    await this.openUsersMenu();
    await this.clickUsersLinkButton();
  }
}
