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
  readonly searchInput: Locator;

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
    this.searchInput = page.locator('input[placeholder="Search"]');    
    this.saveButton = page.locator('button:has-text("Save")');
  }

  /**
 * Verifies that the table headers match the expected headers.
 *
 * @param {string[]} expectedHeaders - An array of expected header strings.
 * @returns {Promise<void>} A promise that resolves when the headers are validated.
 */
  async validateTableHeaders(expectedHeaders: string[]): Promise<void>  {
    const headers = await this.tableHeaders.allTextContents();
    expect(headers).toEqual(expectedHeaders);
  }

  // Assuming the table order is: Last Name, First Name, Email, Active, Role, Organizations.
  // TODO: Update this method to verify based on the table headers.
    /**
   * Validates the user details in the table.
   *
   * @param expectedUser - The expected user details.
   * @returns {Promise<void>} A promise that resolves when the user details are validated.
   */
  async validateUserDetails(expectedUser): Promise<void> {
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

  /**
   * Adds a new user using the provided user details and password type.
   *
   * @param {UserDetails} userDetails - The details of the user to add.
   * @param {string} passwordType - The type of password to use.
   * @returns {Promise<string>} A promise that resolves with the user ID when the user is added.
   */
  async addUser(userDetails: UserDetails, passwordType: string): Promise<any>{
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

  /**
   * Clicks on a user in the table based on their email.
   *
   * @param {string} email - The email of the user to click.
   * @returns {Promise<void>} A promise that resolves when the user is clicked.
   */
  async clickUser(email: string) {
     // Intercept the API response
     const apiResponsePromise = this.page.waitForResponse((response) =>
      response.url().includes('/fhir/v1/org-admin-user?') && response.request().method() === 'GET'
    );

    await this.searchInput.fill(email);

    // Wait for the API response
    await apiResponsePromise;

    await this.page.locator(`td:has-text("${email}")`).first().click();
  } 

  /**
   * Creates a new user using the API with the provided user details.
   *
   * @param {any} userDetails - The details of the user to create.
   * @returns {Promise<string | null>} A promise that resolves with the user ID when the user is created, or null if the creation fails.
   */
  async createUserWithAPI(userDetails: any): Promise<string | null>{
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
      const responseData = await response.text();
      console.log(responseData);
      return responseData;
    } else {
      console.error('Failed to create user', response.status(), response.statusText());
      return null;
    }
  }
}
