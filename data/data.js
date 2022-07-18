import {db} from '../db/database.js';
const SELECT_JOIN = 
'SELECT tw.id, tw.text, tw.createdAt, tw.userid, us.username, us.name, us.url FROM tweets as tw JOIN users as us ON tw.userid=us.id';
const ORDER_DESC = 'ORDER BY tw.createdAt DESC';

export async function getAll() {
    return db.execute(`${SELECT_JOIN} ${ORDER_DESC}`)
    .then(result => result[0]);
}

export async function getByUsername(username) {
    return db.execute(`${SELECT_JOIN} WHERE us.username=? ${ORDER_DESC}`, [username])
    .then(result => result[0]);
}

export async function getById(id) {
    return db.execute(`${SELECT_JOIN} WHERE tw.id=?`, [id])
    .then(result => result[0][0]);
}

export async function create(text, userId) {
    return db.execute('INSERT INTO tweets (text, createdAt, userId) VALUES (?,?,?)',
    [text, new Date(), userId])
    .then(result => getById(result[0].insertId));
}

export async function update(text, id) {
    return db.execute('UPDATE tweets SET text=? WHERE id=?', [text, id])
    .then(() => getById(id));
}

export async function remove(id) {
    return db.execute('DELETE FROM tweets WHERE id=?', [id]);
}