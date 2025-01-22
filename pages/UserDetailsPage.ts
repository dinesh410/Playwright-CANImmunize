import { Page, Locator, expect } from '@playwright/test';

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

    constructor(page: Page) {
        this.page = page;
        this.userInfoTable = page.locator('table').nth(0);
        this.rolesTable = page.locator('table').nth(1);
        this.organizationsTable = page.locator('table').nth(2);
        this.labelSelector = (labelText) => page.locator(`th:has(span:has-text("${labelText}"))`);
        this.valueSelector = (labelText) => page.locator(`th:has(span:has-text("${labelText}")) + td span`);
        this.tableRowsSelector = page.locator('.ant-table-tbody tr');
        this.editButton = page.locator(`button:has-text("Edit")`);
        this.addRoleButton = page.locator(`button:has-text("Add Role")`);
        this.removeButton = `button:has-text("Remove")`;
        this.yesButton = `button:has-text("Yes")`;
        this.popOverDialog = page.locator('div[role="tooltip"]');
    }

    async clickAddRoleButton() {
        await this.addRoleButton.click();
    }

    async clickEditButton() {
        await this.editButton.click();
    }

    async removeRole(roleName: string) {
        const roleRow = await this.rolesTable.locator(`tr:has-text("${roleName}")`).first();
        await roleRow.locator(this.removeButton).click();

        // Intercept the API response
        const apiResponsePromise = this.page.waitForResponse((response) =>
            response.url().includes('/fhir/v1/org-admin-user') && response.request().method() === 'PUT'
        );
        await this.popOverDialog.locator(this.yesButton).click();

        // Wait for the API response
        const apiResponse = await apiResponsePromise;

        // Validate the response
        await expect(apiResponse.status()).toBe(200); // HTTP status for success"
    }

    // TODO: Update this method to verify based on the table headers.
    // Function to verify user details
    async verifyUserInfoTable({ firstName, lastName, email }) {
        // Map the user details        
        const userInfoDetails = {
            'First Name': firstName,
            'Last Name': lastName,
            'Email': email,
        };

        for (const [label, value] of Object.entries(userInfoDetails)) {
            const labelLocator = this.labelSelector(label).first();
            const valueLocator = this.valueSelector(label).first();
            expect(await labelLocator.textContent()).toBe(label);
            const actualText = await valueLocator.textContent();
            expect(actualText?.toLowerCase()).toBe(value.toLowerCase());
        }
    }

    // Function to verify roles and description in the table
    async verifyUserRoles(expectedRoles) {
        // Verify roles in the table by looping through each role
        for (const expectedRole of expectedRoles) {
            const roleRow = this.rolesTable.getByRole('link', { name: `${expectedRole}` });

            // Verify role
            await expect(roleRow).toBeVisible();
        }

    }

    // Function to verify organizations in the table
    async verifyUserOrganizations(expectedOrganizations) {
        // Verify organizations in the table by looping through each role
        for (const expectedOrganization of expectedOrganizations) {
            const organizationRow = this.organizationsTable.getByRole('link', { name: `${expectedOrganization}` });

            // Verify organization
            await expect(organizationRow).toBeVisible();
        }
    }

    // Function to verify roles and description in the table
    async verifyUserRoleNotVisibleInTable(deletedRole) {
        // Verify roles in the table by looping through each role
        const roleRow = this.rolesTable.getByRole('link', { name: `${deletedRole}` });

        // Verify role
        await expect(roleRow).toHaveCount(0);

    }

    async navigateToUserDetailsPage(userId) {
        await this.page.goto(`/orgadminusers/${userId}`);
    }


}
