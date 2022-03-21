const express = require('express');
const app = require('../../services/app/apps');
const router = express.Router();

/**
 * Custom Endpoint
 * ===========================================================================================
 */

/* Get apps datatable */
router.get('/datatable', async (req, res, next) => {
  const payload = {limit, offset, order} = req.query
  const data = await app.datatable({...payload, id: req.userId, filter: req.filter});
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
      total_data: (await app.totalData(req.userId, req.filter)).total_data,
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
  res.json(await app.index(req.userId));
});

/* GET apps show */
router.get('/:id', async (req, res, next) => {
  if (!(req.appId).some(val => val === Number(req.params.id))) {return res.sendStatus(403)}
  res.json(await app.show(req.params.id))
});

/* POST apps store */
router.post('/', async (req, res, next) => {
  const payload = { name, logo, type } = req.body;
  const queryResults = await app.store(payload, req);
  if (queryResults) {
    res.json(queryResults);
  } else {
    res.sendStatus(500);
  }
});

/* PUT apps update */
router.put('/:id', async (req, res, next) => {
  const payload = { name, logo, type } = req.body;
  const queryResults = await app.update(payload, Number(req.params.id));
  if (queryResults.affectedRows) {
    res.sendStatus(200);
  } else {
    res.sendStatus(500);
  }  
});

/* DELETE apps destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(req.appId).some(val => val === Number(req.params.id))) {
    res.sendStatus(403)
  } else {
    res.status(200).json(await app.destroy(req.params.id))
  }
});


module.exports = router;
