import { NextFunction, Request, Response } from 'express'
import { IUserRepository } from '../../domain/repositories/IUserRepository'

export class UserController {
    constructor(private readonly userRepository: IUserRepository) {}

    async all(request: Request, response: Response, next: NextFunction) {
        return this.userRepository.all()
    }

    async one(request: Request, response: Response, next: NextFunction) {
        const userId = String(request.params.userId)
        return this.userRepository.one(userId)
    }

    async save(request: Request, response: Response, next: NextFunction) {
        const userId = String(request.params.userId ?? request.body.userId ?? '')
        const userName = request.body.userName
        const preHashPassword = request.body.password
        return this.userRepository.save(userId, userName, preHashPassword)
    }

    async remove(request: Request, response: Response, next: NextFunction) {
        const userId = String(request.params.userId)
        return this.userRepository.remove(userId)
    }

    async login(request: Request, response: Response, next: NextFunction) {
        const userId = String(request.body.userId)
        const password = request.body.password
        return this.userRepository.login(userId, password)
    }
}
