const pool = require('../../database/db');
const util = require('util');
const fields = [
  'r.id',
  'r.name',
  'r.created_at',
  'r.updated_at',
];

/**
 * Custom Endpoint
 * ===========================================================================================
 */

 const datatable = async ({ query: {limit, offset, order}, appId, filter }) => {

  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY r.${order}` : 'ORDER BY r.id DESC';

  let paramsSelect = [' AND a.id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return await pool.query(
    `SELECT
      a.name AS app_name,
      ${fields}
    FROM
      roles r
      INNER JOIN apps a ON a.id = r.app_id
    WHERE
      r.deleted_at IS NULL
      AND a.deleted_at IS NULL
      ${paramsSelect} 
    ${queryOrder} ${queryLimit} ${queryOffset}`,
    [...paramsValue, Number(limit), Number(offset)]
  );
};

const totalData = async ({appId, filter}) => {
  let paramsSelect = [' AND a.id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return (
    await pool.query(
      `SELECT COUNT(*) AS total_data FROM (
        SELECT r.*
        FROM
          roles r
          INNER JOIN apps a ON a.id = r.app_id
        WHERE
          r.deleted_at IS NULL 
          AND a.deleted_at IS NULL
          ${paramsSelect}
      ) AS c`,
      [...paramsValue]
    )
  )[0];
}

/**
 * Default Endpoint
 * ===========================================================================================
 */

const index = async ({appId}) => {
  return await pool.query(
    `SELECT
      ${fields}
    FROM
      roles r
      INNER JOIN apps a ON a.id = r.app_id
    WHERE
      r.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND a.id IN (?)`,
    [appId]
  );
};

const show = async ({params: {id}, appId}) => 
(
  await pool.query(
    `SELECT 
      ${fields} 
    FROM roles r 
    INNER JOIN apps a ON a.id = r.app_id
    WHERE 
      r.deleted_at IS NULL 
      AND a.deleted_at IS NULL
      AND a.id IN (?)
      AND r.id = ?`,
    [appId, id]
  )
)[0];

const store = async ({ body: { name, app_id } }) => {
  const payload = { name, app_id };

  try {
    conn = await util.promisify(pool.getConnection).bind(pool)();
    await conn.beginTransaction();
    const res = await util.promisify(conn.query).bind(conn)('INSERT INTO roles SET ?', [payload]);
    await conn.commit();
    return res;
  } catch (error) {
    return 0;    
  }
};

const update = async ({ params: {id}, body: { name, app_id } }) => {
  const payload = { name, app_id };
  try {
    return await pool.query(
      `UPDATE
          roles r
        SET        
          r.name = ?,
          r.app_id = ?,
          r.updated_at = NOW()
        WHERE
          r.deleted_at IS NULL
          AND r.id = ?`,
        [...Object.values(payload).map(val => val), id]
    )
  } catch(error) {
    return 0;
  }
};

const destroy = async ({params: {id}}) => {
  return await pool.query(
    `UPDATE
        roles r
      SET
        r.deleted_at = NOW()
      WHERE
        r.id = ?`,
      [id]
  )[0]
}

module.exports = {
  index,
  show,
  store,
  update,
  destroy,
  datatable,
  totalData,
};
