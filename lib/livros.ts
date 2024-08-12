import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()

export class Livros {
  async getLivros({ name }: { name?: string }) {

    if (!name) {
      const allLivros = await prisma.livros.findMany()

      if (!allLivros) {
        return { message: 'Nenhum livro encontrado' }
      }

      return allLivros
    }

    const nameLivro = await prisma.livros.findFirst({
      where: {
        title: {
          contains: name,
          mode: 'insensitive'
        }
      }
    })

    if (!nameLivro) {
      return { message: 'Livro não encontrado' }
    }

    return nameLivro

  }

  async createLivro({ title, status }: { title: string, status: string }) {

    try {
      await prisma.livros.create({
        data: {
          title,
          status
        }
      })

      return { message: 'Livro criado com sucesso' }

    } catch (err) {
      return new Error(`erro ao criar livro: ${err}`)
    }

  }

  async updateStatusLivro(id: string, status: string) {
    if (!id) {
      return { message: 'ID não informado' }
    }

    try {
      await prisma.livros.update({
        where: {
          id
        },
        data: {
          status
        }
      })

      return { message: 'Status do livro atualizado com sucesso' }
    } catch (err) {
      return new Error(`erro ao atualizar status do livro: ${err}`)
    }

  }
}