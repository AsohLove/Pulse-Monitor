import { Router } from "express";

import { requireAuth } from "../middleware/auth-middleware.js";

import{ 
    downloadChecksCsv,
    getMonitorUptime, 
    getSingleMonitorChecks, 
    listAllIncidents, 
    listMonitorIncidents}  from "../controllers/report-controller.js"

const router = Router();


// router.get("/status", getPublicStatus);


router.use(requireAuth);

router.get("/incidents", listAllIncidents);

router.get("/monitors/:id/checks", getSingleMonitorChecks);

router.get("/monitors/:id/checks.csv", downloadChecksCsv);

router.get("/monitors/:id/uptime", getMonitorUptime);

router.get("/monitors/:id/incidents", listMonitorIncidents);



export default router;
