const pool = require('../../database/db');
const util = require('util');
const fields = [
  'm.id',
  'm.name AS module',
  'm.method',
  'm.path',
  'm.parent_id',
  'm.app_id',
];

/**
 * Custom Endpoint
 * ===========================================================================================
 */

 const datatable = async ({ query: {limit, offset, order}, appId, filter }) => {

  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY m.${order}` : 'ORDER BY m.id DESC';

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
      m2.name AS parent_module,
      ${fields}
    FROM
      modules m
      INNER JOIN apps a ON a.id = m.app_id
      LEFT JOIN modules m2 ON m.parent_id = m2.id
    WHERE
      m.deleted_at IS NULL
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
        SELECT m.*
        FROM
          modules m
          INNER JOIN apps a ON a.id = m.app_id
        WHERE
          m.deleted_at IS NULL 
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
      modules m
      INNER JOIN apps a ON a.id = m.app_id
    WHERE
      m.deleted_at IS NULL
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
    FROM modules m 
    INNER JOIN apps a ON a.id = m.app_id
    WHERE 
      m.deleted_at IS NULL 
      AND a.deleted_at IS NULL
      AND a.id IN (?)
      AND m.id = ?`,
    [appId, id]
  )
)[0];

const store = async ({ body: { name, path, method, parent_id, app_id } }) => {
  if(!parent_id) parent_id = null;
  const payload = { name, path, method, parent_id, app_id };
  try {
    conn = await util.promisify(pool.getConnection).bind(pool)();
    await conn.beginTransaction();
    const res = await util.promisify(conn.query).bind(conn)('INSERT INTO modules SET ?', [payload]);
    await conn.commit();
    return res;
  } catch (error) {
    return 0;
  }
};

const update = async ({ params: {id}, body: { name, path, method, parent_id, app_id } }) => {
  const payload = { name, path, method, parent_id, app_id };
  try {
    return await pool.query(
      `UPDATE
          modules m
        SET        
          m.name = ?,
          m.path = ?,
          m.method = ?,
          m.parent_id = ?,
          m.app_id = ?,
          m.updated_at = NOW()
        WHERE
          m.deleted_at IS NULL
          AND m.id = ?`,
        [...Object.values(payload).map(val => val), id]
    )
  } catch(error) {
    return 0;
  }
};

const destroy = async ({params: {id}}) => {
  return await pool.query(
    `UPDATE
        modules m
      SET
        m.deleted_at = NOW()
      WHERE
        m.id = ?`,
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
