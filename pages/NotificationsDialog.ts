import { Page, expect } from "@playwright/test";

export class NotificationsDialog {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async verifyText(expectedText: string) {
        // Locate the text element
        const textLocator = await this.page.getByText(expectedText, { exact: false });

        // Ensure the element is visible
        await expect(textLocator).toBeVisible();
    }
}
