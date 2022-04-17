const express = require('express');
const app = require('../../services/app/apps');
const router = express.Router();

/**
 * Custom Endpoint
 * ===========================================================================================
 */

/* Get apps datatable */
router.get('/datatable', async (req, res, next) => {
  try {
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
      },
      message: 'apps successfully displayed',
      messageType: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display apps',
      messageType: 'error',
    });
  }  
})

/**
 * Default Endpoint
 * ===========================================================================================
 */

/* GET apps index */
router.get('/', async (req, res, next) => {
  try {
    const queryResults = await app.index(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display apps',
      messageType: 'error',
    });
  }
});

/* GET apps show */
router.get('/:id', async (req, res, next) => {
  try {
    const queryResults = await app.show(req);
    if (!queryResults) return res.status(403).json({
      message: 'fail to display apps, you don\'t have right access',
      messageType: 'error',
    });
    res.json({
      ...queryResults,
      message: 'apps successfully displayed',
      messageType: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message: 'fail to display apps',
      messageType: 'error',
    });
    
  }
});

/* POST apps store */
router.post('/', async (req, res, next) => {
  const queryResults = await app.store(req);
  if (queryResults) {
    res.json({
      ...queryResults,
      message: 'app successfully added',
      messageType: 'success',
    });
  } else {
    res.status(500).json({
      message: 'fail to add app',
      messageType: 'error',
    });
  }
});

/* PUT apps update */
router.put('/:id', async (req, res, next) => {
  if (!(await app.show(req))) {return res.sendStatus(403)}
  // if (!(((req.appId).some(val => val === Number(req.params.id))))) {return res.sendStatus(403)}

  try {
    const queryResults = await app.update(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
        message: 'app successfully updated',
        messageType: 'success',
      });
    } else {
      res.status(500).json({
        message: 'fail to update app',
        messageType: 'error',
      });  
    }
  } catch (error) {
    res.status(500).json({
      message: 'fail to update app',
      messageType: 'error',
    });
  }
  
});

/* DELETE apps destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await app.show(req))) {
    return res.status(403).json({
      message: 'app fail to delete, you don\'t have right access',
      messageType: 'error',
    })
  }

  await app.destroy(req)
  res.status(200).json({
    message: 'app successfully deleted',
    messageType: 'success',
  });
});


module.exports = router;
