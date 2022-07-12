let userDB = [
    {
        id: '1',
        username: 'ellie',
        password: '$2b$12$cFJfVjOXnvcpIxRaxApOZ.491LFe.jtmE9B8BBuIRlkJY90DoMLcS',
        name: 'Ellie',
        email: 'dreamcoding@academy.com',
        profile: 'abcd',
    },
    {
        id: '2',
        username: 'bob',
        password: '$2b$12$mfaOkEOiqkzIcj2F3H1K7eqv/qjHxqK6kwcgX6oG7GrutobFgGo3.',
        name: 'Bob',
        email: 'dreambob@academy.com',
        profile: 'bcdef',
    },
];

export async function findByUsername(username) {
    return userDB.find(data => data.username === username);
}

export async function findById(id) {
    return userDB.find(data => data.id === id);
}

export async function createUser(userId) {
    const created = {...userId, id: (userDB.length + 1).toString()};
    userDB.push(created);
    return created.id;
}
