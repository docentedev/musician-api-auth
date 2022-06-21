import { initQueryBuilder, Utils } from '../utils/QueryBuilderV2'
import Run from '../utils/Run'
import rolesDb from '../models/roles'

type GetAllPaginateProps = {
  page: number
  size: number
  order: string
  sort: 'asc' | 'desc'
}

/*
id uuid NOT NULL,
username varchar(255) NOT NULL,
password varchar(255) NOT NULL,
email varchar(255) NOT NULL,
created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
*/
const users = (pg: pg.Pg) => {
  const rolesQb = rolesDb(pg)
  const fields = ['id', 'username', 'email', 'password']
  const qb = initQueryBuilder({
    table: 'account',
    as: ['account as a'],
    fields: ['id', 'username', 'email'],
    select: 'id, username, email, created_at, updated_at',
    run: Run(pg, false),
    debug: false,
  })
  const qbMutation = initQueryBuilder({
    table: 'account',
    as: ['account as a', 'account_x_role as ar'],
    fields: ['id', 'username'],
    select: 'id, username, password, email, created_at, updated_at',
    mutationFields: ['username', 'password', 'email'],
    run: Run(pg, false),
    debug: false,
  })
  const getAllPaginate = async ({ page = 1, size = 10, sort = 'desc', order = 'id' }: GetAllPaginateProps) => {
    const result = await qb()
      .select()
      .orderBy(order, sort).paginate(page, size).run()
    const count = await qb().count().run()

    const roles = await rolesQb.getAllByAccountsId(result.map((u: any) => u.id))
    const accountsRoles = result.map((account: any) => {
      const newAccount = {
        ...account,
        roles: roles.filter((role: any) => role.account_id === account.id)
      }
      return newAccount
    })
    return {
      count: Number(count.count),
      rows: accountsRoles,
    }
  }

  const getBy = async (key: string, value: any) => {
    const result = await qb().selectOne().where([key], value).run()
    const roles = await rolesQb.getByAccountId(result.id)
    return {
      ...result,
      roles,
    }
  }

  const getByUsernameOrEmail = async (username: string, email: string) => {
    const result = await qb().select().where([{
      field: 'username',
      mode: '=',
      value: username,
      operator: 'OR',
    },
    {
      field: 'email',
      mode: '=',
      value: email
    }]).run()
    return result
  }

  const getByFullData = async (key: string, value: any) => {
    const result = await qbMutation().selectOne().where([key], value).run()
    return result
  }

  const insert = async (musician: any) => {
    const ifExist = await getBy('username', musician.username)
    if (ifExist) {
      throw new Error('Username already exist')
    }
    const fields = ['username', 'password', 'email']
    const data = Utils.getAllowedField(fields, musician)
    const result = await qbMutation().insert(data).run()
    return result
  }

  const update = async (id: any, musician: any) => {
    const data = Utils.getAllowedField(fields, musician)
    const result = await qbMutation().update(data).where('id', id).run()
    return result
  }

  return {
    getAllPaginate,
    getBy,
    insert,
    getByFullData,
    getByUsernameOrEmail,
    update
  }
}

export default users
