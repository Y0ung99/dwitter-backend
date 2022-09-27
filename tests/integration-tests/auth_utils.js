import faker from 'faker';

export async function createNewUserAccount(request) {
    const userDetails = makeValidUserDetails();
    const prepareUserResponse = await request.post('/auth/signup', userDetails);
    return {
        ...userDetails,
        jwt: prepareUserResponse.data.token,
    }
}

export function makeValidUserDetails() {
    const fakerUser = faker.helpers.userCard();
    return { 
        name: fakerUser.name, 
        username: fakerUser.username, 
        email: fakerUser.email, 
        password: faker.internet.password(10, true),
    };
}
