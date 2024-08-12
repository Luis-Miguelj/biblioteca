import fastify from "fastify";
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'

import { z } from "zod";

import { Livros } from '../lib/livros'
import { Users } from "../lib/users";

const server = fastify()
const livros = new Livros()
const user = new Users()

server.register(cors, {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
})

server.register(jwt, {
  secret: process.env.SECRET_JWT as string
})

server.get('/', async (request, reply) => {
  const library = await livros.getLivros({ name: '' })

  if (!library) {
    return reply.status(404).send({ message: 'Nenhum livro encontrado' })
  }

  return reply.status(201).send({ library })
})

server.get('/livros/:name', async (request, reply) => {

  const { name } = request.params as { name?: string }

  if (!name) {
    const allLivros = await livros.getLivros({ name: '' })

    if (!allLivros) {
      return { message: 'Nenhum livro encontrado' }
    }

    return reply.status(201).send({ allLivros })
  }

  if (name) {
    const nameLivro = await livros.getLivros({ name })

    if (!nameLivro) {
      return { message: 'Livro não encontrado' }
    }

    return reply.status(201).send({ nameLivro })
  }

  return { message: 'Algo deu errado ao puxar o(s) livro(s).' }

})

server.post('/livros', async (request, reply) => {


  const livroSchema = z.object({
    title: z.string().min(1),
    status: z.string().min(1),
  })

  const data = livroSchema.parse(request.body)

  switch (data.status) {
    case 'd':
      await livros.createLivro({ title: data.title, status: 'Disponível' })
      break
    case 'i':
      await livros.createLivro({ title: data.title, status: 'Indisponível' })
      break
    default:
      return { message: 'Status inválido' }
  }

  return reply.status(201).send({ massage: 'Livro criado com sucesso' })

})

server.put('/livros/status/:id', async (request, reply) => {

  const idSchema = z.object({
    id: z.string().min(1, 'ID não informado')
  })
  const statusSchema = z.object({
    status: z.string().min(1, 'Status não informado').max(1, 'Status inválido')
  })

  const { id } = idSchema.parse(request.params)
  const { status } = statusSchema.parse(request.body)

  switch (status) {
    case 'd':
      await livros.updateStatusLivro(id, 'Disponível')
      break
    case 'i':
      await livros.updateStatusLivro(id, 'Indisponível')
      break
    default:
      return { message: 'Status inválido' }
  }


  return reply.status(201).send({ massage: 'Status do livro atualizado com sucesso' })
})

server.post('/user', async (request, reply) => {

  const userSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
  })

  const data = userSchema.parse(request.body)

  await user.createUser(data)

  return reply.status(201).send({ massage: 'Usuário criado com sucesso' })
})

server.post('/login', async (request, reply) => {

  const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  })

  const data = userSchema.parse(request.body)

  const login = await user.login(data)

  if (login.usuario) {
    const token = server.jwt.sign({ sub: login.usuario })
    if (!token) return { message: 'Erro ao gerar token' }

    return reply.status(201).send({ token, login })
  } else {
    return reply.status(401).send({ message: login.message })
  }

})


server.listen({
  port: 3333,
  host: '0.0.0.0',
})