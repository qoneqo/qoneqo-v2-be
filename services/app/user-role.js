const pool = require('../../database/db');
const util = require('util');
const fields = [
  'ur.id',
  'ur.user_id',
  'ur.role_id',
  'ur.created_at',
  'ur.updated_at',
];

/**
 * Custom Endpoint
 * ===========================================================================================
 */

 const datatable = async ({ params: {userId}, query: {limit, offset, order}, appId, filter }) => {

  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY ur.${order}` : 'ORDER BY ur.id DESC';

  let paramsSelect = [' AND a.id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filteur.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return await pool.query(
    `SELECT
      a.name AS app_name,
      r.name AS role_name,
      ${fields}
    FROM
      user_role ur
      INNER JOIN roles r ON r.id = ur.role_id
      INNER JOIN apps a ON a.id = r.app_id
    WHERE
      ur.deleted_at IS NULL
      AND a.deleted_at IS NULL
      AND ur.user_id = ?
      ${paramsSelect} 
    ${queryOrder} ${queryLimit} ${queryOffset}`,
    [userId, ...paramsValue, Number(limit), Number(offset)]
  );
};

const totalData = async ({params: {userId}, appId, filter}) => {
  let paramsSelect = [' AND a.id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filteur.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return (
    await pool.query(
      `SELECT COUNT(*) AS total_data FROM (
        SELECT ur.*
        FROM
          user_role ur
          INNER JOIN roles r ON r.id = ur.role_id
          INNER JOIN apps a ON a.id = r.app_id
        WHERE
          ur.deleted_at IS NULL 
          AND a.deleted_at IS NULL
          AND ur.user_id = ?
          ${paramsSelect}
      ) AS c`,
      [userId, ...paramsValue]
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
      user_role ur
      INNER JOIN roles r ON r.id = ur.role_id
      INNER JOIN apps a ON a.id = r.app_id
    WHERE
      ur.deleted_at IS NULL
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
    FROM user_role ur 
    INNER JOIN roles r ON r.id = ur.role_id
    INNER JOIN apps a ON a.id = r.app_id
    WHERE 
      ur.deleted_at IS NULL 
      AND a.deleted_at IS NULL
      AND a.id IN (?)
      AND ur.id = ?`,
    [appId, id]
  )
)[0];

const store = async ({ body: { user_id, role_id } }) => {
  const payload = { user_id, role_id };

  try {
    conn = await util.promisify(pool.getConnection).bind(pool)();
    await conn.beginTransaction();
    const res = await util.promisify(conn.query).bind(conn)('INSERT INTO user_role SET ?', [payload]);
    await conn.commit();
    return res;
  } catch (error) {
    return 0;    
  }
};

const update = async ({ params: {id}, body: { user_id, role_id } }) => {
  const payload = { user_id, role_id };
  try {
    return await pool.query(
      `UPDATE
          user_role ur
        SET        
          ur.user_id = ?,
          ur.role_id = ?,
          ur.updated_at = NOW()
        WHERE
          ur.deleted_at IS NULL
          AND ur.id = ?`,
        [...Object.values(payload).map(val => val), id]
    )
  } catch(error) {
    return 0;
  }
};

const destroy = async ({params: {id}}) => {
  return await pool.query(
    `UPDATE
        user_role ur
      SET
        ur.deleted_at = NOW()
      WHERE
        ur.id = ?`,
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
