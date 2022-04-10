const express = require('express');
const userRole = require('../../services/app/user-role');
const router = express.Router();


/* Get user-role datatable */
router.get('/datatable/:userId', async (req, res, next) => {
  try {
    const data = await userRole.datatable(req);
    res.json({
      widget_title: 'List Roles',
      widget_data: {
        t_head: {
          id: 'id',
          user_id: 'User Id',
          role_id: 'Role Id',
          role_name: 'Role Name',
          created_at: 'Created At',
          updated_at: 'Updated At',
          app_name: 'App Name',
        },
        t_body: data,
        order_col: ['id', 'user_id', 'role_id', 'role_name', 'created_at', 'updated_at', 'app_name'],
        total_data: (await userRole.totalData(req)).total_data,
        base_endpoint: `${process.env.BASE_URL}/user-role/datatable/${req.params.userId}`,
      }
    })
  } catch (error) {
    res.sendStatus(500);
  }
})

/**
 * ===========================================================================================
 */

/* GET user-role index */
router.get('/', async (req, res, next) => {
  res.json(await userRole.index(req));
});

/* GET user-role show */
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await userRole.show(req))
  } catch (error) {
    res.sendStatus(500);
  }
});

/* POST user-role store */
router.post('/', async (req, res, next) => {
  const queryResults = await userRole.store(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }  
});

/* PUT user-role update */
router.put('/:id', async (req, res, next) => {
  if (!(await userRole.show(req))) {return res.sendStatus(403)}

  const queryResults = await userRole.update(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

/* DELETE user-role destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await userRole.show(req))) {return res.sendStatus(403)}
  await userRole.destroy(req)
  res.sendStatus(200);
});

module.exports = router;
