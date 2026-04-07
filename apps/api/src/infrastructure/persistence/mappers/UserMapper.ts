import { User } from '../../../domain/models/User'
import { UserDataModel } from '../entity/UserDataModel'

export class UserMapper {
    /** インフラモデル → ドメインモデル */
    static toDomain(dataModel: UserDataModel): User {
        return User.reconstruct({
            userId: dataModel.userId,
            userName: dataModel.userName,
            password: dataModel.password,
        })
    }

    /** ドメインモデル → インフラモデル */
    static toDataModel(user: User): UserDataModel {
        const dataModel = new UserDataModel()
        dataModel.userId = user.userId
        dataModel.userName = user.userName
        dataModel.password = user.password
        return dataModel
    }
}
