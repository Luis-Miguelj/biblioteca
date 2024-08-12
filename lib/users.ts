import { PrismaClient } from '@prisma/client'

import bcrypt from 'bcryptjs'

interface User {
  name: string
  email: string
  password: string
}

const prisma = new PrismaClient()

export class Users {
  async createUser({ name, email, password }: User) {

    try {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) return new Error(`erro na criptografia: ${err}`)

        bcrypt.hash(password, salt, async (err, hash) => {
          if (err) return new Error(`erro na criptografia: ${err}`)

          await prisma.user.create({
            data: {
              name,
              email,
              password: hash
            }
          })
        })
      })
    } catch (err) {
      return new Error(`erro ao criar usuário: ${err}`)
    }
  }

  async login({ email, password }: { email: string, password: string }) {


    const usuario = await prisma.user.findFirst({
      where: {
        email
      }
    })

    if (!usuario) return { message: 'Usuário não encontrado' }

    const validPassword = await bcrypt.compare(password, usuario.password)

    if (!validPassword) return { message: 'Senha inválida' }

    return { usuario, message: 'Usuário logado com sucesso' }

  }
}