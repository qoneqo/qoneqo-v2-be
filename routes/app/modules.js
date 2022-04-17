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
        message: 'modules successfully displayed',
        messageType: 'success',
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display modules',
      messageType: 'error',
    })
  }
})

/**
 * ===========================================================================================
 */

/* GET modules index */
router.get('/', async (req, res, next) => {
  try {
    const queryResults = await modules.index(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display modules',
      messageType: 'error',
    })
  }
});

/* GET modules show */
router.get('/:id', async (req, res, next) => {
  try {
    const queryResults = await modules.show(req);
    res.json({
      ...queryResults,
      message: 'module successfully displayed',
      messageType: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display module',
      messageType: 'error',
    });
  }
});

/* POST modules store */
router.post('/', async (req, res, next) => {
  try {
    const queryResults = await modules.store(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
        message: 'module successfully added',
        messageType: 'success',
      });
    } else {
      res.status(500).json({
        message: 'fail to add module',
        messageType: 'error',
      });
    }  
  } catch (error) {
    res.status(500).json({
      message: 'fail to add module',
      messageType: 'error',
    });
  }
});

/* PUT modules update */
router.put('/:id', async (req, res, next) => {
  try {
    if (!(await modules.show(req))) {
      return res.status(403).json({
        message: 'fail to update module, you don\'t have right access',
        messageType: 'error',
      })
    }
  
    const queryResults = await modules.update(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
        message: 'module successfully updated',
        messageType: 'success',
      })
    } else {
      res.status(500).json({
        message: 'fail to update module',
        messageType: 'error',
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'fail to update module',
      messageType: 'error',
    })
  }
});

/* DELETE modules destroy */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await modules.show(req))) {return res.status(403).json({
      message: 'fail to delete module, you don\'t have right access',
      messageType: 'error',
    })}
    await modules.destroy(req)
    res.status(200).json({
      message: 'module successfully deleted',
      messageType: 'success',
    });
  } catch (error) {
    res.status(500).json({
      message: 'fail to delete module',
      messageType: 'error',
    })
  }
});

module.exports = router;
