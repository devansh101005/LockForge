import { Router } from "express";
import type { Redis } from "ioredis";
import { acquireLock, releaseLock, checkLock, extendLock, listLocks } from "../internal/lockManager.js";

export function createLockRouter(redis: Redis): Router {
    const router = Router();
    const defaultTTL = Number(process.env.DEFAULT_TTL) || 30000;

    router.post("/lock/:resource", async (req, res) => {
        const { resource } = req.params;
        const { owner, ttl } = req.body;

        if (!owner) {
            res.status(400).json({ message: "owner is required" });
            return;
        }

        const result = await acquireLock(redis, resource, owner, ttl || defaultTTL);

        if (result.locked) {
            res.status(200).json(result);
        } else {
            res.status(409).json(result);
        }
    });

    router.delete("/lock/:resource", async (req, res) => {
        const { resource } = req.params;
        const { owner } = req.body;

        if (!owner) {
            res.status(400).json({ message: "owner is required" });
            return;
        }

        const result = await releaseLock(redis, resource, owner);

        if (result.message === "Success") {
            res.status(200).json(result);
        } else if (result.message === "Owned by someone else ") {
            res.status(403).json(result);
        } else {
            res.status(404).json(result);
        }
    });

    router.get("/lock/:resource", async (req, res) => {
        const { resource } = req.params;
        const result = await checkLock(redis, resource);

        if (result) {
            res.status(200).json({ locked: true, ...result });
        } else {
            res.status(200).json({ locked: false, resource });
        }
    });

    router.put("/lock/:resource/extend", async (req, res) => {
        const { resource } = req.params;
        const { owner, ttl } = req.body;

        if (!owner) {
            res.status(400).json({ message: "owner is required" });
            return;
        }

        const result = await extendLock(redis, resource, owner, ttl || defaultTTL);

        if (result.locked) {
            res.status(200).json(result);
        } else {
            res.status(404).json(result);
        }
    });

    router.get("/locks", async (req, res) => {
        const result = await listLocks(redis);
        res.status(200).json(result);
    });

    return router;
}
