const express = require('express');
const role = require('../../services/app/roles');
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
        message: 'roles successfully displayed',
        messageType: 'success',
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display roles',
      messageType: 'error',
    })
  }
})

router.get('/where-app', async (req, res, next) => {
  try {  
    const queryResults = await role.indexWhereApp(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display roles',
      messageType: 'error',
    })
  }
});

/**
 * ===========================================================================================
 */

/* GET roles index */
router.get('/', async (req, res, next) => {
  try {
    const queryResults = await role.index(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display roles',
      messageType: 'error',
    })
  }
});

/* GET roles show */
router.get('/:id', async (req, res, next) => {
  try {
    const queryResults = await role.show(req);
    res.json({
      ...queryResults,
      message: 'role successfully displayed',
      messageType: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display role',
      messageType: 'error',
    })
  }
});

/* POST roles store */
router.post('/', async (req, res, next) => {
  try {
    const queryResults = await role.store(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
        ...queryResults,
        message: 'role successfully added',
        messageType: 'success',
      });
    } else {
      res.status(500).json({
        message: 'fail to add role',
        messageType: 'error',
      })
    }  
  } catch (error) {
    res.status(500).json({
      message: 'fail to add role',
      messageType: 'error',
    })    
  }  
});

/* PUT roles update */
router.put('/:id', async (req, res, next) => {
  try {
    if (!(await role.show(req))) {
      return res.status(403).json({
        message: 'fail to update role, you don\'t have right access',
        messageType: 'error',
      })
    }

    const queryResults = await role.update(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
      message: 'role successfully updated',
      messageType: 'success',
    });
    } else {
      res.status(500).json({
        message: 'fail to add role',
        messageType: 'error',
      });
    } 
  } catch (error) {
    res.status(500).json({
      message: 'fail to add role',
      messageType: 'error',
    });    
  }  
});

/* DELETE roles destroy */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await role.show(req))) {
      return res.status(403).json({
        message: 'fail to delete role, you don\'t have right access',
        messageType: 'error',
      })
    }
    await role.destroy(req)
    res.json({
      message: 'role successfully deleted',
      messageType: 'success',
    }); 
  } catch (error) {
    res.status(500).json({
      message: 'fail to delete role',
      messageType: 'error',
    })
  }  
});

module.exports = router;
