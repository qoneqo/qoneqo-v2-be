const express = require('express');
const modules = require('../../services/app/modules');
const router = express.Router();


/* Get modules datatable */
router.get('/datatable', async (req, res, next) => {
  try {
    const data = await modules.datatable(req);  
    res.json({
      widget_title: 'List Roles',
      widget_data: {
        t_head: {
          id: 'id',
          module: 'Module',
          method: 'Method',
          path: 'Path',
          parent_module: 'Parent Module',
          app_name: 'App Name',
        },
        t_body: data,
        order_col: ['id', 'module', 'method', 'path', 'parent_module', 'app_name'],
        total_data: (await modules.totalData(req)).total_data,
        base_endpoint: `${process.env.BASE_URL}/modules/datatable`,
      }
    })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

/**
 * ===========================================================================================
 */

/* GET modules index */
router.get('/', async (req, res, next) => {
  res.json(await modules.index(req));
});

/* GET modules show */
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await modules.show(req))
  } catch (error) {
    res.sendStatus(500);
  }
});

/* POST modules store */
router.post('/', async (req, res, next) => {
  const queryResults = await modules.store(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }  
});

/* PUT modules update */
router.put('/:id', async (req, res, next) => {
  if (!(await modules.show(req))) {return res.sendStatus(403)}

  const queryResults = await modules.update(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

/* DELETE modules destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await modules.show(req))) {return res.sendStatus(403)}
  await modules.destroy(req)
  res.sendStatus(200);
});

module.exports = router;
