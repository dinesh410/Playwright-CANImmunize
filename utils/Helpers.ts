import { Locator, Page } from '@playwright/test';

export class Helpers {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // 1. Click on the dropdown
  // 2. Search for the role/organization
  // 3. Click on the role/organization
  // 4. Repeat for each role/organization
   /**
   * Selects an option from a dropdown by searching for the specified value.
   * 
   * @param {Locator} dropdown - The dropdown locator.
   * @param {string} searchValue - The value to search for in the dropdown.
   */
  async selectFromDropdown(dropdown: Locator, searchValue: string) {
    await dropdown.click();
    const searchInput = dropdown.locator('input[type="search"]');
    await searchInput.fill(searchValue);
    await this.page.locator(`.ant-select-item-option:has-text("${searchValue}")`).first().click();
  }
}

