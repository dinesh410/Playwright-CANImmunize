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

    async clickAddRoleButton() {
        await this.addRoleButton.click();
    }
}
