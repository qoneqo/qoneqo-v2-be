const pool = require('../../database/db');
const util = require('util');
const fields = [
  'u.id',
  'u.identifier',
  'u.name',
  'u.email',
  'u.is_active',
  'u.created_at',
  'u.updated_at',
];

/**
 * Custom Endpoint
 * ===========================================================================================
 */

 const datatable = async ({ query: {limit, offset, order}, appId, filter }) => {
  let GROUP_BY = '';
  if(!filter.app_list_selected?.id) {
    GROUP_BY = 'GROUP BY u.identifier';
  }

  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY u.${order}` : 'ORDER BY u.id DESC';

  let paramsSelect = [' AND au.app_id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND au.app_id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return await pool.query(
    `SELECT
      ${GROUP_BY ? '': 'a.name AS app_name,'}
      ${fields}      
    FROM
      users u
      INNER JOIN app_user au ON u.id = au.user_id
      INNER JOIN apps a ON a.id = au.app_id
    WHERE
      u.deleted_at IS NULL
      AND au.deleted_at IS NULL     
      ${paramsSelect} 
    ${GROUP_BY ? GROUP_BY : ''} ${queryOrder} ${queryLimit} ${queryOffset}`,
    [...paramsValue, Number(limit), Number(offset)]
  );
};

const totalData = async ({appId, filter}) => {
  let GROUP_BY = '';
  if(!filter.app_list_selected?.id) {
    GROUP_BY = 'GROUP BY u.identifier';
  }
  let paramsSelect = [' AND au.app_id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND au.app_id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return (
    await pool.query(
      `SELECT COUNT(*) AS total_data FROM (
        SELECT  u.*
        FROM
          users u
          INNER JOIN app_user au ON u.id = au.user_id
        WHERE
          u.deleted_at IS NULL 
          AND au.deleted_at IS NULL ${paramsSelect} ${GROUP_BY ? GROUP_BY : ''}
      ) AS c`,
      [...paramsValue]
    )
  )[0];
}

const me = async ({userId}) =>
  (
    await pool.query(
      `SELECT 
        ${fields} 
      FROM users u 
      WHERE 
        u.deleted_at IS NULL 
        AND u.id = ?
      LIMIT 1`,
      [userId]
    )
  )[0];

/**
 * Default Endpoint
 * ===========================================================================================
 */

const index = async ({appId, filter}) => {
  return await pool.query(
    `SELECT
      ${fields}
    FROM
      users u
      INNER JOIN app_user au ON u.id = au.user_id
    WHERE
      u.deleted_at IS NULL
      AND au.deleted_at IS NULL
      AND au.app_id IN (?)`,
    [appId]
  );
};

const show = async ({params: {id}, appId}) => 
(
  await pool.query(
    `SELECT 
      ${fields} 
    FROM users u 
    INNER JOIN app_user au ON u.id = au.user_id
    WHERE 
      u.deleted_at IS NULL 
      AND au.deleted_at IS NULL
      AND au.app_id IN (?)
      AND u.id = ?`,
    [appId, id]
  )
)[0];

const store = async ({ identifier, name, email, password, is_active, app_id }) => {
  const payload = { identifier, name, email, password, is_active };

  try {
    conn = await util.promisify(pool.getConnection).bind(pool)();
    await conn.beginTransaction();
    const res = await util.promisify(conn.query).bind(conn)('INSERT INTO users SET ?', [payload]);
    const res2 = (await util.promisify(conn.query).bind(conn)(`iNSERT INTO app_user (app_id, user_id) VALUES (?, ?)`, [app_id, res.insertId]));
    await conn.commit();
    return res2;
  } catch (error) {
    console.log(error)
    return 0;    
  }
};

const update = async ({ params: {id}, body: {identifier, name, email, password, is_active} }) => {
  const payload = { identifier, name, email, password, is_active };
  try {
    return await pool.query(
      `UPDATE
          users u
        SET
          u.identifier = ?,
          u.name = ?,
          u.email = ?,
          u.password = ?,
          u.is_active = ?,
          u.updated_at = NOW()
        WHERE
          u.deleted_at IS NULL
          AND u.id = ?`,
        [...Object.values(payload).map(val => val), id]
    )
  } catch(error) {
    console.log(error)
  }
};

const destroy = async ({params: {id}}) => {
  return await pool.query(
    `UPDATE
        users u
      SET
        u.deleted_at = NOW()
      WHERE
        u.id = ?`,
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
  me,
};
