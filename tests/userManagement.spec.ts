import { test, expect } from '../fixtures/fixture';
import { faker } from '@faker-js/faker';

test.describe('Admin - User Management', () => {
    test.beforeEach(async ({ loginPage, homePage }) => {
        await loginPage.navigate();
        await loginPage.login('goldenridge456@canimmunize.ca', 'xR8!sG3@wP1$kLz');
        await homePage.navigateToUsersTab();
    });

    test('Validate Table Record', async ({ adminUsersPage, userDetailsPage }) => {
        // Assuming the user details are static for now.
        // TODO: Update this to fetch the user details from API response.
        const expectedUser = {
            lastName: 'Ridge',
            firstName: 'Golden',
            email: 'goldenridge456@canimmunize.ca',
            activeStatus: 'Active',
            roles: ['Console User Manager', 'Super Admin'],
            organizations: ['Evergreen Drugstore', 'MedExpress Pharmacy'],
        };

        // Verify table headers.
        await adminUsersPage.validateTableHeaders(['Last Name', 'First Name', 'Email', 'Active', 'Role', 'Organizations']);

        // Ensure accurate display of data for an existing admin console user.
        await adminUsersPage.validateUserDetails(expectedUser);

        // Click on the user to view the user details.
        await adminUsersPage.clickUser(expectedUser.lastName);

        // Verify the user details in the user info table.
        await userDetailsPage.verifyUserInfoTable({fisrstName: expectedUser.firstName, lastName: expectedUser.lastName, email: expectedUser.email});
    });

    test('Add User with server-generated password and validate the created user', async ({ adminUsersPage, dialogSection, userDetailsPage }) => {
        const newUser = {
            lastName: faker.person.lastName(),
            firstName: faker.person.firstName(),
            email: faker.internet.email(),
            activeStatus: 'Active',
            roles: ['Console User Manager', 'Super Admin'],
            organizations: ['Evergreen Drugstore', 'MedExpress Pharmacy'],
        };

        // Add a new user with server generated password.
        await adminUsersPage.addUser(newUser, 'Server Generated Password');  

        // Verfiy the user created message.
        await dialogSection.verifyDialogMessage('User successfully created with password.');

        // Click Ok to verify created user details.
        await dialogSection.clickOkButton();
        
        // Verify the user details in the user info table.
        await userDetailsPage.verifyUserInfoTable({firstName: newUser.firstName, lastName: newUser.lastName, email: newUser.email});

        // Verify the roles of the user.
        // await userDetailsPage.verifyUserRoles(newUser.roles);

        // Verify the organizations of the user.
        // await userDetailsPage.verifyUserOrganizations(newUser.organizations);
    });
});
