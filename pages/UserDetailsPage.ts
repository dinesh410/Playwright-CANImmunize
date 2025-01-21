import { Page, Locator, expect } from '@playwright/test';

export class UserDetailsPage {
    readonly page: Page;
    readonly userInfoTable: Locator;
    readonly rolesTable: Locator;
    readonly organizationsTable: Locator;
    readonly labelSelector: (labelText: string) => Locator;
    readonly valueSelector: (labelText: string) => Locator;

    constructor(page: Page) {
        this.page = page;
        this.userInfoTable = page.locator('table').nth(0);
        this.rolesTable = page.locator('table').nth(1);
        this.organizationsTable = page.locator('table').nth(2);
        this.labelSelector = (labelText) => page.locator(`th:has(span:has-text("${labelText}"))`);
        this.valueSelector = (labelText) => page.locator(`th:has(span:has-text("${labelText} + td span"))`);
    }

    // Function to verify user details
    async verifyUserInfoTable(expectedDetails) {
        // Verify single-value fields
        const userInfoDetails = {
            'First Name': expectedDetails.firstName,
            'Last Name': expectedDetails.lastName,
            'Email': expectedDetails.email,
        };

        for (const [label, expectedValue] of Object.entries(userInfoDetails)) {
            // Check if the label exists
            const isLabelVisible = await this.labelSelector(label).isVisible();
            if (!isLabelVisible) throw new Error(`Label "${label}" not found in the table`);

            // Get the actual value
            const actualValue = await this.valueSelector(label).textContent();

            // Validate the value
            expect(actualValue?.trim()).toBe(expectedValue);
        }
    }

    // Function to verify roles and description in the table
    async verifyUserRoles(expectedRoles) {
        const tableRows = this.page.locator('.ant-table-tbody tr');

        // Get all roles from the table
        const actualRoles = await tableRows.evaluateAll((rows) =>
            rows.map((row) => ({
                name: row.querySelector('td:nth-of-type(1) a')?.textContent?.trim(),
                // description: row.querySelector('td:nth-of-type(2)')?.textContent?.trim(),
            }))
        );

        // Compare the expected and actual roles
        for (const expectedRole of expectedRoles) {
            const match = actualRoles.find(
                (role) => role.name === expectedRole.name // && role.description === expectedRole.description
            );
            expect(match).toBeTruthy();
        }
    }

    // Function to verify organizations in the table
    async verifyUserOrganizations(expectedOrganizations) {
        const tableRows = this.page.locator('.ant-table-tbody tr');

        // Extract organization data from the table
        const actualOrganizations = await tableRows.evaluateAll((rows) =>
            rows.map((row) => ({
                name: row.querySelector('td:nth-of-type(1) a')?.textContent?.trim(),
                // code: row.querySelector('td:nth-of-type(2)')?.textContent?.trim(),
            }))
        );

        // Compare expected organizations with actual organizations
        for (const expectedOrg of expectedOrganizations) {
            const match = actualOrganizations.find(
                (org) => org.name === expectedOrg.name // && org.code === expectedOrg.code
            );
            expect(match).toBeTruthy();
        }
    }
}
