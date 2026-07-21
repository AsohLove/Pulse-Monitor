import { Router } from "express";

import { requireAuth } from "../middleware/auth-middleware.js";

import{ 
    downloadChecksCsv,
    getMonitorUptime, 
    getSingleMonitorChecks, 
    listAllIncidents, 
    listMonitorIncidents}  from "../controllers/report-controller.js"
import { validate } from "../middleware/validate-middleware.js";
import { monitorIdSchema, querySchema, uptimeQuerySchema } from "../validations/monitor-validation.js";

const router = Router();


// router.get("/status", getPublicStatus);


router.use(requireAuth);

router.get("/incidents", listAllIncidents);

router.get("/monitors/:id/checks", 
    validate(monitorIdSchema, "params"),
    validate(querySchema, "query"),
    getSingleMonitorChecks
);

router.get("/monitors/:id/checks.csv", 
    validate(monitorIdSchema, "params"),
    downloadChecksCsv
);

router.get("/monitors/:id/uptime", 
    validate(monitorIdSchema, "params"),
    validate(uptimeQuerySchema, "query"),
    getMonitorUptime);

router.get("/monitors/:id/incidents", validate(monitorIdSchema, "params"), listMonitorIncidents);



export default router;
