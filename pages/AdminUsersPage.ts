import { expect, Locator, Page, request } from '@playwright/test';
import { UserDetails } from '../types/UserDetails';
import { Helpers } from '../utils/Helpers';

export class AdminUsersPage {
  private helpers: Helpers;

  readonly page: Page;
  readonly tableHeaders: Locator;
  readonly tableRows: Locator;
  readonly addUserButton: Locator;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly rolesDropdown: Locator;
  readonly organizationsDropdown: Locator;
  readonly passwordDropdown: Locator;
  readonly passwordDropdownOption: Locator;  
  readonly saveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.helpers = new Helpers(page);
    this.tableHeaders = page.locator('table thead th');
    this.tableRows = page.locator('table tbody tr');
    this.addUserButton = page.getByTestId('new-user');
    this.firstNameInput = page.locator('input#firstName');
    this.lastNameInput = page.locator('input#lastName');
    this.emailInput = page.locator('input#email');
    this.rolesDropdown = page.locator('div').filter({ hasText: /^Select one or more roles$/ }).first();
    this.organizationsDropdown = page.locator('div').filter({ hasText: /^Select one or more organizations$/ }).first();
    this.passwordDropdown = page.getByRole('dialog').getByText('Server Generated Password');
    
    this.saveButton = page.locator('button:has-text("Save")');
  }

  // Verify the table headers
  async validateTableHeaders(expectedHeaders: string[]) {
    const headers = await this.tableHeaders.allTextContents();
    expect(headers).toEqual(expectedHeaders);
  }

  // Assuming the table order is: Last Name, First Name, Email, Active, Role, Organizations.
  // TODO: Update this method to verify based on the table headers.
  async validateUserDetails(expectedUser) {
    const userRow = this.page.locator(`tr:has(td:has-text("${expectedUser.email}"))`);
    console.log('userRow', userRow);

    // Verify Last name, First name, and Email
    expect(await userRow.locator('td:nth-of-type(1)').textContent()).toBe(expectedUser.lastName);
    expect(await userRow.locator('td:nth-of-type(2)').textContent()).toBe(expectedUser.firstName);
    expect(await userRow.locator('td:nth-of-type(3)').textContent()).toBe(expectedUser.email);

    // Verify Active status, Roles, and Organizations
    const activeStatus = await userRow.locator('td:nth-of-type(4) span').textContent();
    expect(activeStatus?.trim()).toBe(expectedUser.activeStatus);

    const roles = await userRow.locator('td:nth-of-type(5) span').allTextContents();
    expect(roles.map((role) => role.trim())).toEqual(expectedUser.roles);

    const organizations = await userRow.locator('td:nth-of-type(6) span').allTextContents();
    expect(organizations.map((org) => org.trim())).toEqual(expectedUser.organizations);
  }

  async addUser(userDetails: UserDetails, passwordType: string) {
    await this.addUserButton.click();
    await this.firstNameInput.fill(userDetails.firstName);
    await this.lastNameInput.fill(userDetails.lastName);
    await this.emailInput.fill(userDetails.email);

    // Roles
    if (userDetails.roles) {
      for (const role of userDetails.roles) {
        await this.helpers.selectFromDropdown(this.rolesDropdown, role);
      }
    }

    // Organizations
    if (userDetails.organizations) {
      for (const organization of userDetails.organizations) {
        await this.helpers.selectFromDropdown(this.organizationsDropdown, organization);
      }
    }

    // Server generated passwrord is by default selected.
    // No need to select it explicitly.
    if (passwordType !== 'Server Generated Password') { 
      // Password
      await this.passwordDropdown.click();
      await this.page.locator(`text=${passwordType}`).click();
    }

    // Intercept the API response
    const apiResponsePromise = this.page.waitForResponse((response) =>
      response.url().includes('/fhir/v1/org-admin-user') && response.request().method() === 'POST'
    );

    // Save User
    await this.saveButton.click();

    // Wait for the API response
    const apiResponse = await apiResponsePromise;
    
    // Validate the response
    await expect(apiResponse.status()).toBe(201); // HTTP status for success"
    return apiResponse.json();
  }

  async clickUser(email: string) {
    await this.page.locator(`td:has-text("${email}")`).first().click();
  } 

  async createUserWithAPI(userDetails: any) {
    const apiContext = await request.newContext();
    const response = await apiContext.post('/fhir/v1/org-admin-user', {
      data: {
        password: userDetails.password,
        firstName: userDetails.firstName,
        lastName: userDetails.lastName,
        email: userDetails.email,
        roles: userDetails.roles,
        organizations: userDetails.organizations,
        verifyEmail: userDetails.verifyEmail
      }
    });

    if (response.ok()) {
      console.log('User created successfully');
      const responseData = await response;
      console.log(responseData);
    } else {
      console.error('Failed to create user', response.status(), response.statusText());
    }
  }
}
