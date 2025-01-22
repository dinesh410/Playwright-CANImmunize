/* Was looking into saving token and using it for future requests. 
   Will need API documnetation to see payload.
 

import { test } from '../fixtures/fixture';

test.describe('Admin - User Management API', () => {
    let authToken = '';
    let userId = 'd78034ac-4acb-4e99-b694-605f6c747931';

    const userDetails = {
        "password": "",
        "firstName": "test",
        "lastName": "Example",
        "email": "test@example99494.com",
        "roles": [
            { "id": "console-user-manager" },
            { "id": "ns-admin" }
        ],
        "organizations": [
            { "id": "0f4032ca-27d9-4b7c-9a13-a3cd4849dd34" },
            { "id": "ed54924e-bd93-4fc2-9410-de19c62ace55" }
        ],
        "verifyEmail": true
    };

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.navigateToLoginPage();
        await loginPage.loginAndReturnToken('goldenridge456@canimmunize.ca', 'xR8!sG3@wP1$kLz').then(async (token) => {
            // Store the token in the context for future use.
            authToken = token;
        });
        console.log('Token:', authToken);
    });

    test('test oauth login', async ({ apiRequest }) => {
        const response = await apiRequest.post('/fhir/v1/org-admin-user', {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: `application/json`,  
            },
            body: { ...userDetails },
        });
        
        
        console.log('Response:', response);
    });

    test('test delete user', async ({ apiRequest }) => {
        const response = await apiRequest.put(`/fhir/v1/org-admin-user/${userId}`, {
            headers: {
                Authorization: `Bearer ${authToken}`,
                Accept: `application/json`,
                contentType: 'application/json',
            },
            body: {
                'id':userId,
                'active':false
            },
        });
        
        
        console.log('Response:', response);
    });
});
*/

