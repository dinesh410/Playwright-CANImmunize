import { test as baseTest, APIRequestContext, request } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { HomePage } from "../pages/HomePage";
import { AdminUsersPage } from "../pages/AdminUsersPage";
import { DialogSection } from "../pages/DialogSection";
import { UserDetailsPage } from "../pages/UserDetailsPage";
import { NotificationsDialog } from "../pages/NotificationsDialog";

type Fixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  adminUsersPage: AdminUsersPage;
  dialogSection: DialogSection;
  userDetailsPage: UserDetailsPage;
  notificationsDialog: NotificationsDialog;
};

export type APIRequestOptions = {
  apiBaseURL: string;
};

type APIRequestFixture = {
  apiRequest: APIRequestContext;
};

export const test = baseTest.extend<
  Fixtures & APIRequestOptions & APIRequestFixture
>({
  apiBaseURL: ["", { option: true }],

  apiRequest: async ({ apiBaseURL }, use) => {
    const apiRequestContext = await request.newContext({
      baseURL: apiBaseURL,
    });

    await use(apiRequestContext);
    await apiRequestContext.dispose();
  },

  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  adminUsersPage: async ({ page }, use) => {
    const adminUsersPage = new AdminUsersPage(page);
    await use(adminUsersPage);
  },
  dialogSection: async ({ page }, use) => {
    const dialogSection = new DialogSection(page);
    await use(dialogSection);
  },
  userDetailsPage: async ({ page }, use) => {
    const userDetailsPage = new UserDetailsPage(page);
    await use(userDetailsPage);
  },
  notificationsDialog: async ({ page }, use) => {
    const notificationsDialog = new NotificationsDialog(page);
    await use(notificationsDialog);
  },
});

export const expect = test.expect;
