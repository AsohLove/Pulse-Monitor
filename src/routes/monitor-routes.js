import { Router } from 'express';
import { validate }  from "../middleware/validate-middleware.js"
import { 
    createMonitorSchema, 
    monitorIdSchema, 
    updateMonitorSchema } from '../validations/monitor-validation.js';
import { 
    createNewMonitor, 
    deleteSingleMonitor, 
    getAllMonitors, 
    getSingleMonitor, 
    updateMonitor } from '../controllers/monitor-controller.js';

import { requireAuth } from '../middleware/auth-middleware.js'

const router = Router()

router.use(requireAuth)

router.post('/', validate(createMonitorSchema), createNewMonitor)

router.get('/', getAllMonitors)

router.get('/:id', validate(monitorIdSchema, "params"), getSingleMonitor)

router.patch('/:id', validate(monitorIdSchema, "params"), 
            validate(updateMonitorSchema), 
            updateMonitor)

router.delete('/:id', validate(monitorIdSchema, "params"), deleteSingleMonitor)



export default router;