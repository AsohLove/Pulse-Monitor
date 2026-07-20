import { pool } from "../db/db.js";

import {
    findLatestCheck,
    createCheck
} from "../models/check-model.js";

import {
    findOpenIncident,
    openIncident,
    resolveIncident
} from "../models/incident-model.js";

export async function recordCheck(
    monitorId,
    result
) {

    const client =
        await pool.connect();

    try {

        await client.query("BEGIN");

        const previous =
            await findLatestCheck(
                client,
                monitorId
            );

        await createCheck(
            client,
            monitorId,
            result
        );

        const wasUp =
            previous?.ok ?? true;

        const isUp =
            result.ok;

        const open =
            await findOpenIncident(
                client,
                monitorId
            );

        if (
            wasUp &&
            !isUp &&
            !open
        ) {

            await openIncident(
                client,
                monitorId,
                result.error
            );

        }

        if (
            !wasUp &&
            isUp &&
            open
        ) {

            await resolveIncident(
                client,
                open.id
            );

        }

        await client.query("COMMIT");

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

}