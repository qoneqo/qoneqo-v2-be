const express = require('express');
const role = require('../../services/app/roles');
const bcrypt = require('bcrypt');
const router = express.Router();


/* Get roles datatable */
router.get('/datatable', async (req, res, next) => {
  try {
    const data = await role.datatable(req);  
    res.json({
      widget_title: 'List Roles',
      widget_data: {
        t_head: {
          id: 'id',
          name: 'Name',
          created_at: 'Created At',
          updated_at: 'Updated At',
          app_name: 'App Name',
        },
        t_body: data,
        order_col: ['id', 'name', 'created_at', 'updated_at', 'app_name'],
        total_data: (await role.totalData(req)).total_data,
        base_endpoint: `${process.env.BASE_URL}/roles/datatable`,
      }
    })
  } catch (error) {
    res.sendStatus(500)
  }
})

/**
 * ===========================================================================================
 */

/* GET roles index */
router.get('/', async (req, res, next) => {
  res.json(await role.index(req));
});

/* GET roles show */
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await role.show(req))
  } catch (error) {
    res.sendStatus(500);
  }
});

/* POST roles store */
router.post('/', async (req, res, next) => {
  const queryResults = await role.store(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }  
});

/* PUT roles update */
router.put('/:id', async (req, res, next) => {
  if (!(await role.show(req))) {return res.sendStatus(403)}

  const queryResults = await role.update(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

/* DELETE roles destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await role.show(req))) {return res.sendStatus(403)}
  await role.destroy(req)
  res.sendStatus(200);
});

module.exports = router;
