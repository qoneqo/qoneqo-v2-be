const pool = require('../../database/db');
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
  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY u.${order}` : '';

  let paramsSelect = [' AND au.app_id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND au.app_id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return await pool.query(
    `SELECT
      ${fields},
      a.name AS app_name
    FROM
      users u
      INNER JOIN app_user au ON u.id = au.user_id
      INNER JOIN apps a ON a.id = au.app_id
    WHERE
      u.deleted_at IS NULL
      AND au.deleted_at IS NULL ${paramsSelect} ${queryOrder} ${queryLimit} ${queryOffset}`,
    [...paramsValue, Number(limit), Number(offset)]
  );
};

const totalData = async ({appId, filter}) => {
  let paramsSelect = [' AND au.app_id IN (?)'];
  let paramsValue = [appId];
  if (filter?.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND au.app_id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return (
    await pool.query(
      `SELECT
        COUNT(*) AS total_data
      FROM
        users u
        INNER JOIN app_user au ON u.id = au.user_id
      WHERE
        u.deleted_at IS NULL 
        AND au.deleted_at IS NULL ${paramsSelect}`,
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
        AND u.id = ?
        AND au.app_id IN (?)`,
      [id, appId]
    )
  )[0];

const store = async ({ identifier, name, email, password, is_active }) => {
  const payload = { identifier, name, email, password, is_active };
  return await pool.query('INSERT INTO users SET ?', [payload]);
};



module.exports = {
  index,
  store,
  show,
  datatable,
  totalData,
};
