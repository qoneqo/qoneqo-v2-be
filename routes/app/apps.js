const express = require('express');
const app = require('../../services/app/apps');
const router = express.Router();

/**
 * Custom Endpoint
 * ===========================================================================================
 */

/* Get apps datatable */
router.get('/datatable', async (req, res, next) => {
  const data = await app.datatable(req);
  res.json({
    widget_title: 'List Apps',
    widget_data: {
      t_head: {
        id: 'Id',
        name: 'Name',
        logo: 'Logo',
        type: 'Type',
      },
      t_body: data,
      order_col: ['id', 'name', 'logo', 'type'],
      total_data: (await app.totalData(req)).total_data,
      base_endpoint: `${process.env.BASE_URL}/apps/datatable`,
    }
  })
})

/**
 * Default Endpoint
 * ===========================================================================================
 */

/* GET apps index */
router.get('/', async (req, res, next) => {
  res.json(await app.index(req));
});

/* GET apps show */
router.get('/:id', async (req, res, next) => {
  const queryResults = await app.show(req);
  if (!queryResults) return res.sendStatus(403);

  res.json(queryResults);
});

/* POST apps store */
router.post('/', async (req, res, next) => {
  const queryResults = await app.store(req);
  if (queryResults) {
    res.json(queryResults);
  } else {
    res.sendStatus(500);
  }
});

/* PUT apps update */
router.put('/:id', async (req, res, next) => {
  if (!(await app.show(req))) {return res.sendStatus(403)}
  // if (!(((req.appId).some(val => val === Number(req.params.id))))) {return res.sendStatus(403)}

  const queryResults = await app.update(req);
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }
});

/* DELETE apps destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await app.show(req))) {return res.sendStatus(403)}
  await app.destroy(req)
  res.sendStatus(200);
});


module.exports = router;
