const pool = require('../../database/db');
const util = require('util');
const fields = [
  'a.id',
  'a.name',
  'a.logo',
  'a.type',
  'a.created_at',
  'a.updated_at',
];

/**
 * Custom Endpoint
 * ===========================================================================================
 */

const datatable = async ({ limit, offset, order, id, filter }) => {
  const queryLimit = limit ? 'LIMIT ?' : '';
  const queryOffset = offset ? 'OFFSET ?' : '';
  const queryOrder = order ? `ORDER BY a.${order}` : '';
  
  
  let paramsSelect = [' AND au.user_id = ?'];
  let paramsValue = [id];
  if (filter.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');

  return await pool.query(
    `SELECT ${fields} FROM apps a INNER JOIN app_user au ON a.id = au.app_id WHERE a.deleted_at IS NULL ${paramsSelect} ${queryOrder} ${queryLimit} ${queryOffset}`,
    [...paramsValue, Number(limit), Number(offset)]
  );
};

const totalData = async (id, filter) => {  
  let paramsSelect = [' AND au.user_id = ?'];
  let paramsValue = [id];
  if (filter.app_list_selected?.id) {
    paramsSelect = [...paramsSelect, ' AND a.id = ?'];
    paramsValue = [...paramsValue, filter.app_list_selected.id];
  }
  paramsSelect = paramsSelect.toString().replaceAll(',', '');
  
  return (
    await pool.query(
      `SELECT COUNT(*) AS total_data FROM apps a INNER JOIN app_user au ON a.id = au.app_id WHERE a.deleted_at IS NULL ${paramsSelect}`,
      [...paramsValue]
    )
  )[0];
}

/**
 * Default Endpoint
 * ===========================================================================================
 */

const index = async (id) => {
  return await pool.query(
    `SELECT ${fields} FROM apps a INNER JOIN app_user au ON a.id = au.app_id WHERE a.deleted_at IS NULL AND au.user_id = ?`,
    [id]
  );
};

const show = async (id) =>
(
  await pool.query(
    `SELECT ${fields} FROM apps a WHERE a.deleted_at IS NULL AND a.id = ?`,
    [id]
  )
)[0];

const store = async ({ name, logo, type }, req) => {
  const payload = { name, logo, type };
  try {
    conn = await util.promisify(pool.getConnection).bind(pool)();
    await conn.beginTransaction();
    const res = await util.promisify(conn.query).bind(conn)('INSERT INTO apps SET ?', [payload]);
    const payload2 = { app_id: res.insertId, user_id: req.userId};
    await util.promisify(conn.query).bind(conn)('INSERT INTO app_user SET ?', [payload2])
    const res2 = (await util.promisify(conn.query).bind(conn)(`SELECT ${fields} FROM apps a WHERE id = ?`, [res.insertId]))[0];
    await conn.commit();
    return res2;
  } catch (error) {
    return 0;    
  }
};

const update = async ({ name, logo, type }, id) => {
  const payload = { name, logo, type };
  return await pool.query(
    `Update apps a SET a.name = ?, a.logo = ?, a.type = ? WHERE a.deleted_at IS NULL AND a.id = ?`,
    [...Object.values(payload).map(val => val), id]
  )
};

const destroy = async (id) => {
  const now = require('moment')().format('YYYY-MM-DD HH:mm:ss');
  return ( 
    await pool.query(
      `UPDATE apps a SET a.deleted_at = ? WHERE a.id = ?`,
      [now, id]
    )
  )[0];
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
