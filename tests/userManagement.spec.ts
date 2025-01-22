import { test } from "../fixtures/fixture";
import { faker } from "@faker-js/faker";
import { USERS } from "../fixtures/testData/userCredentials.json";

let adminUserDetails;

test.describe("Admin - User Management", () => {
  test.beforeEach(async ({ loginPage, homePage }) => {
    // Navigate to the login page and login with the super admin credentials.
    await loginPage.navigateToLoginPage();

    await loginPage
      .login(
        process.env.email ?? USERS.super_admin_1.email,
        process.env.password ?? USERS.super_admin_1.password
      )
      .then((response) => {
        // Store the user details for further use.
        adminUserDetails = response;
      });

    // Navigate to the Users tab.
    await homePage.navigateToUsersTab();
  });

  test("Validate Table Record - Ensure accurate display of data for an existing admin console user.", async ({
    adminUsersPage,
    userDetailsPage,
  }) => {
    // Assuming the user details are static for now.
    // Verify table headers.
    await adminUsersPage.validateTableHeaders([
      "Last Name",
      "First Name",
      "Email",
      "Active",
      "Role",
      "Organizations",
    ]);

    // Ensure row is available in the table.
    await adminUsersPage.searchUser(adminUserDetails.email);
    
    // Ensure accurate display of data for an existing admin console user.
    await adminUsersPage.validateUserDetails(adminUserDetails);

    // Click on the user to view the user details.
    await adminUsersPage.clickUser(adminUserDetails.email);

    // Verify the user details in the user info table.
    await userDetailsPage.verifyUserInfoTable({
      firstName: adminUserDetails.firstName,
      lastName: adminUserDetails.lastName,
      email: adminUserDetails.email,
    });

    // Verify the roles of the user.
    await userDetailsPage.verifyUserRoles(
      adminUserDetails.roles.map((role) => role.name)
    );

    // Verify the organizations of the user.
    await userDetailsPage.verifyUserOrganizations(
      adminUserDetails.organizations.map((organization) => organization.nameEn)
    );
  });

  test("Add User with server-generated password and validate the created user", async ({
    adminUsersPage,
    dialogSection,
    userDetailsPage,
  }) => {
    // Create new user with details.
    const newUser = {
      lastName: faker.person.lastName(),
      firstName: faker.person.firstName(),
      email: faker.internet.email(),
      activeStatus: "Active",
      roles: ["Clinic Owner", "Super Admin"],
      organizations: ["Evergreen Drugstore", "MedExpress Pharmacy"],
    };

    // Add a new user with server generated password.
    await adminUsersPage.addUser(newUser, "Server Generated Password");

    // Verfiy the user created message.
    await dialogSection.verifyDialogMessage(
      "User successfully created with password."
    );

    // Click Ok to verify created user details.
    await dialogSection.clickOkButton();

    // Verify the user details in the user info table.
    await userDetailsPage.verifyUserInfoTable({
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
    });

    // Verify the roles of the user.
    await userDetailsPage.verifyUserRoles(newUser.roles);

    // Verify the organizations of the user.
    await userDetailsPage.verifyUserOrganizations(newUser.organizations);
  });

  test.describe("Create a new user and navigate to the user details page", () => {
    // Let userId be empty for now.
    let userId = "";

    // Create new user with details.
    const newUser = {
      lastName: faker.person.lastName(),
      firstName: faker.person.firstName(),
      email: faker.internet.email(),
      activeStatus: "Active",
      roles: ["Clinic Owner", "Super Admin"],
      organizations: ["Evergreen Drugstore", "MedExpress Pharmacy"],
    };

    // New role to be added to the user.
    const newRole = "Call Centre Agent";

    test.beforeEach(async ({ adminUsersPage }) => {
      // TODO: Create a User using and API and fetch the user details for independent and effective testing.
      // For now, creating a new user on UI for each test.

      // Add a new user with server generated password.
      await adminUsersPage
        .addUser(newUser, "Server Generated Password")
        .then(async (response) => {
          // Get response and store user id.
          userId = response?.id;
        });
    });

    test("Edit user details and verify updated details", async ({
      dialogSection,
      userDetailsPage,
    }) => {
      // Edit the user details.
      const editedUser = {
        lastName: faker.person.lastName(),
        firstName: faker.person.firstName(),
        email: faker.internet.email(),
      };

      // Navigate to the user details page.
      await userDetailsPage.navigateToUserDetailsPage(userId);

      // Click on the Edit button.
      await userDetailsPage.clickEditButton();

      // Update the user details.
      await dialogSection.editUserDetails(
        editedUser.firstName,
        editedUser.lastName,
        editedUser.email
      );

      // Verify the user details in the user info table.
      await userDetailsPage.verifyUserInfoTable({
        firstName: editedUser.firstName,
        lastName: editedUser.lastName,
        email: editedUser.email,
      });
    });

    test("Manage Roles - Add a new role and verify the role added", async ({
      dialogSection,
      userDetailsPage,
      notificationsDialog,
    }) => {
      // Navigate to the user details page.
      await userDetailsPage.navigateToUserDetailsPage(userId);

      // Click on the Add Role button.
      await userDetailsPage.clickAddRoleButton();

      // Add a new role to the user.
      await dialogSection.searchAndAddRole(newRole);

      // Verify the alert message.
      // TODO: Update the way to verify the message. Can do with better understanding of how it was implemented.
      await notificationsDialog.verifyText(
        `Role ${newRole} successfully added to user (${newUser.firstName} ${newUser.lastName}).`
      );

      // Click Done to close the dialog.
      await dialogSection.clickDoneButton();

      // Verify the role added to the user.
      await userDetailsPage.verifyUserRoles([...newUser.roles, newRole]);
    });

    test("Manage Roles - Remove a role and verify the role removed", async ({
      adminUsersPage,
      dialogSection,
      userDetailsPage,
      notificationsDialog,
    }) => {
      // Navigate to the user details page.
      await userDetailsPage.navigateToUserDetailsPage(userId);

      // Click on the Add Role button.
      await userDetailsPage.clickAddRoleButton();

      // Add a new role to the user.
      await dialogSection.searchAndAddRole(newRole);

      // Navigate to the user details page.
      await userDetailsPage.navigateToUserDetailsPage(userId);

      const roleToRemove = newRole;

      // Remove roles from the user.
      await userDetailsPage.removeRole(roleToRemove);

      // Verify the table with the updated roles.
      await userDetailsPage.verifyUserRoles(
        newUser.roles.filter((role) => role !== roleToRemove)
      );

      // verify the table where deleted role is not present.
      await userDetailsPage.verifyUserRoleNotVisibleInTable(roleToRemove);
    });
  });
});
