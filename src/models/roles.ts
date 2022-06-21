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
const roles = (pg: pg.Pg) => {
  const fields = ['id', 'username', 'email', 'password']
  const qb = initQueryBuilder({
    table: 'role',
    as: ['account_x_role as ar', 'role as r'],
    fields: ['id', 'name', 'description', 'ar.id', 'ar.role_id', 'ar.account_id'],
    //mutationFields: ['id', 'first_name', 'last_name', 'second_last_name', 'second_name', 'birth_date', 'death_date', 'city_fk', 'alias', 'city_name', 'country_name'],
    select: 'r.id as id, r.name as name, r.description as description, ar.account_id as account_id',
    run: Run(pg),
    // debug: true
  })

  const getByAccountId = async (value: any) => {
    // select * from role as r
    // inner join account_x_role axr ON axr.role_id = r.id
    // where axr.account_id = 'cf7e8baf-a4e5-4fdb-9790-c99e171c08d4';
    const result = await qb()
      .select()
      .innerJoin({ join: 'account_x_role.role_id', on: 'r.id' })
      .where('ar.account_id', value)
      .run()
    return result
  }

  const getAllByAccountsId = async (ids: string[]) => {
    const result = await qb()
      .select()
      .innerJoin({ join: 'account_x_role.role_id', on: 'r.id' })
      .whereIn('account_x_role.account_id', ids)
      .run()
    return result
  }

  return {
    getByAccountId,
    getAllByAccountsId
  }
}

export default roles
