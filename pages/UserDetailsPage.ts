import { fi } from "@faker-js/faker";
import { Page, Locator, expect } from "@playwright/test";

export class UserDetailsPage {
  readonly page: Page;
  readonly userInfoTable: Locator;
  readonly rolesTable: Locator;
  readonly organizationsTable: Locator;
  readonly labelSelector: (labelText: string) => Locator;
  readonly valueSelector: (labelText: string) => Locator;
  readonly tableRowsSelector: Locator;
  readonly editButton: Locator;
  readonly addRoleButton: Locator;
  readonly removeButton: string;
  readonly popOverDialog: Locator;
  readonly yesButton: string;
  readonly pageHeaderTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userInfoTable = page.locator("table").nth(0);
    this.rolesTable = page.locator("table").nth(1);
    this.organizationsTable = page.locator("table").nth(2);
    this.labelSelector = (labelText) =>
      page.locator(`th:has(span:has-text("${labelText}"))`);
    this.valueSelector = (labelText) =>
      page.locator(`th:has(span:has-text("${labelText}")) + td span`);
    this.tableRowsSelector = page.locator(".ant-table-tbody tr");
    this.editButton = page.locator(`button:has-text("Edit")`);
    this.addRoleButton = page.locator(`button:has-text("Add Role")`);
    this.removeButton = `button:has-text("Remove")`;
    this.yesButton = `button:has-text("Yes")`;
    this.popOverDialog = page.locator('div[role="tooltip"]');
    this.pageHeaderTitle = page.locator(".ant-page-header-heading-title h3");
  }

  /**
   * Clicks the "Add Role" button.
   * @returns {Promise<void>}
   */
  async clickAddRoleButton(): Promise<void> {
    await this.addRoleButton.click();
  }

  /**
   * Clicks the "Edit" button.
   * @returns {Promise<void>}
   */
  async clickEditButton(): Promise<void> {
    await this.editButton.click();
  }

  /**
   * Removes a role from the roles table.
   * Waits for and validates the API response after removal.
   * @param {string} roleName - The name of the role to remove.
   * @returns {Promise<void>}
   */
  async removeRole(roleName: string): Promise<void> {
    const roleRow = await this.rolesTable
      .locator(`tr:has-text("${roleName}")`)
      .first();
    await roleRow.locator(this.removeButton).click();

    // Intercept the API response
    const apiResponsePromise = this.page.waitForResponse(
      (response) =>
        response.url().includes("/fhir/v1/org-admin-user") &&
        response.request().method() === "PUT"
    );
    await this.popOverDialog.locator(this.yesButton).click();

    // Wait for the API response
    const apiResponse = await apiResponsePromise;

    // Validate the response
    await expect(apiResponse.status()).toBe(200); // HTTP status for success"
  }

  /**
   * Verifies user details in the user info table.
   * @param {Object} userDetails - The user details to verify.
   * @param {string} userDetails.firstName - The first name of the user.
   * @param {string} userDetails.lastName - The last name of the user.
   * @param {string} userDetails.email - The email of the user.
   * @returns {Promise<void>}
   */
  async verifyUserInfoTable({ firstName, lastName, email }): Promise<void> {
    // TODO: Update this method to verify based on the table headers.

    // Verify header title
    expect(await this.pageHeaderTitle.textContent()).toBe(`${firstName} ${lastName}`);

    // Map the user details
    const userInfoDetails = {
      "First Name": firstName,
      "Last Name": lastName,
      "Email": email,
    };
    
    for (const [label, value] of Object.entries(userInfoDetails)) {
      const labelLocator = this.labelSelector(label).first();
      const valueLocator = this.valueSelector(label).first();
      expect(await labelLocator.textContent()).toBe(label);
      const actualText = await valueLocator.textContent();
      expect(actualText?.toLowerCase()).toBe(value.toLowerCase());
    }
  }

  /**
   * Verifies that all expected roles are present in the roles table.
   * @param {string[]} expectedRoles - The list of roles to verify.
   * @returns {Promise<void>}
   */
  async verifyUserRoles(expectedRoles): Promise<void> {
    // Verify roles in the table by looping through each role
    for (const expectedRole of expectedRoles) {
      const roleRow = this.rolesTable.getByRole("link", {
        name: `${expectedRole}`,
      });

      // Verify role
      await expect(roleRow).toBeVisible();
    }
  }

  /**
   * Verifies that all expected organizations are present in the organizations table.
   * @param {string[]} expectedOrganizations - The list of organizations to verify.
   * @returns {Promise<void>}
   */
  async verifyUserOrganizations(expectedOrganizations): Promise<void> {
    // Verify organizations in the table by looping through each role
    for (const expectedOrganization of expectedOrganizations) {
      const organizationRow = this.organizationsTable.getByRole("link", {
        name: `${expectedOrganization}`,
      });

      // Verify organization
      await expect(organizationRow).toBeVisible();
    }
  }

  /**
   * Verifies that a specific role is not visible in the roles table.
   * @param {string} deletedRole - The role that should not be visible.
   * @returns {Promise<void>}
   */
  async verifyUserRoleNotVisibleInTable(deletedRole): Promise<void> {
    // Verify roles in the table by looping through each role
    const roleRow = this.rolesTable.getByRole("link", {
      name: `${deletedRole}`,
    });

    // Verify role
    await expect(roleRow).toHaveCount(0);
  }

  /**
   * Navigates to the user details page for a specific user.
   * @param {string} userId - The ID of the user to view.
   * @returns {Promise<void>}
   */
  async navigateToUserDetailsPage(userId): Promise<void> {
    await this.page.goto(`/orgadminusers/${userId}`);
  }
}
