import { initQueryBuilder, Utils } from '../utils/QueryBuilderV2'
import Run from '../utils/Run'

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
  const qb = initQueryBuilder({
    table: 'account',
    as: ['account as a'],
    fields: ['id', 'username'],
    select: 'id, username, created_at, updated_at',
    run: Run(pg, false),
    debug: false,
  })
  const qbMutation = initQueryBuilder({
    table: 'account',
    as: ['account as a'],
    fields: ['id', 'username'],
    select: 'id, username, password, email, created_at, updated_at',
    mutationFields: ['username', 'password', 'email'],
    run: Run(pg, false),
    debug: false,
  })
  const getAllPaginate = async ({ page = 1, size = 10, sort = 'desc', order = 'id' }: GetAllPaginateProps) => {
    const result = qb().select().orderBy(order, sort).paginate(page, size)
    const count = await qb().count().run()
    return {
      count: Number(count.count),
      rows: await result.run()
    }
  }

  const getBy = async (key: string, value: any) => {
    const result = await qb().selectOne().where([key], value).run()
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

  return {
    getAllPaginate,
    getBy,
    insert,
    getByFullData
  }
}

export default users
