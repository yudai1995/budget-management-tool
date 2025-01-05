import { NextFunction, Request, Response } from 'express';
import { User } from '../entity/User';
import { AppDataSource } from '../data-source';
import { errorModel } from '../model/errorModel';
const bcrypt = require('bcrypt');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  async all(request: Request, response: Response, next: NextFunction) {
    return this.userRepository.find();
  }

  async one(request: Request, response: Response, next: NextFunction) {
    const userId = request.params.userId;
    const user = await this.userRepository.findOneBy({
      userId,
    });
    return user;
  }

  async save(request: Request, response: Response, next: NextFunction) {
    const userId = request.params.userId;
    const userName = request.body.userName;
    const preHashPassword = request.body.password;
    const password = await bcrypt.hash(preHashPassword, 10);

    return this.userRepository.save({ userId, userName, password });
  }

  async remove(request: Request, response: Response, next: NextFunction) {
    const userToRemove = await this.userRepository.findOneBy({
      userId: request.params.userId,
    });
    await this.userRepository.remove(userToRemove);
  }

  async login(request: Request, response: Response, next: NextFunction) {
    const userId = request.body.userId;
    const password =
      userId === 'Guest' ? process.env.GUEST_PASSWORD : request.body.password;
    const loginUser = await this.userRepository.findOneBy({
      userId,
    });
    if (loginUser) {
      const compared = await bcrypt.compare(password, loginUser.password);
      if (compared) {
        return request;
      }
      return errorModel.AUTHENTICATION_FAILD;
    } else {
      return errorModel.NOT_FOUND;
    }
  }
}
