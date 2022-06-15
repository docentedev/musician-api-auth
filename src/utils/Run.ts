const Run = (pg: any, debug = false) => async (sql: string, values: any[], single: Boolean) => {
  return new Promise((resolve: (result: any) => void, reject: (err: Error) => void) => {
    pg.connect((e: Error, client: pg.Client, release: () => Promise<any>) => {
      function onResult(err: Error, result: pg.Result<any> | any) {
        release()
        if (err) {
          if (debug) {
            console.log('onResult error', e)
          }
          reject(err)
        } else {
          if (single) {
            resolve(result.rows[0])
          } else {
            resolve(result.rows)
          }
        }
      }

      if (e) {
        if (debug) {
          console.log('General error', e)
        }
        release()
        reject(e)
      } else {
        if (values.length === 0) {
          client.query(sql, onResult)
        } else {
          client.query(sql, values, onResult)
        }
      }
    })
  })
}

export default Run
