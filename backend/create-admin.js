/**
 * Запустите этот скрипт ОДИН РАЗ, чтобы создать администратора:
 *   node create-admin.js
 */
const bcrypt = require('bcryptjs')
const { v4: uuidv4 } = require('uuid')
const fs = require('fs')
const path = require('path')

const USERS_FILE = path.join(__dirname, 'data', 'users.json')

async function main() {
  const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8') || '[]')
  
  if (users.find(u => u.role === 'admin')) {
    console.log('Администратор уже существует.')
    return
  }

  const password = 'admin123' // Измените на свой пароль!
  const hashed = await bcrypt.hash(password, 10)

  users.push({
    id: uuidv4(),
    name: 'Администратор',
    phone: '+79992488379',
    email: 'admin@kerrinails.ru',
    password: hashed,
    role: 'admin',
    createdAt: new Date().toISOString()
  })

  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  console.log('✅ Администратор создан!')
  console.log('   Email: admin@kerrinails.ru')
  console.log('   Пароль: admin123')
  console.log('   ⚠️  Измените пароль после первого входа!')
}

main()
