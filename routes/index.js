const express = require("express");

/**
 * IMPORT ROUTES
 */
const AuthRoutes = require("./auth.route");
const UserRoutes = require("./user.route");
const CompanyRoutes = require("./company.route");
const Dashboard = require("./dashboard.route");

const SkinRoutes = require("./skin.route");
const GroupRoutes = require("./group.route");
const RaceRoutes = require("./race.route");
const StageRoutes = require("./stage.route");
const FeedBackRoutes = require("./feedBack.route");

const RaceRouteRoutes = require("./raceRoute.route");
const RaceManagementRoutes = require("./raceManagement.route");
const FILE = require("./files.route");
/**
 * INITIALIZE ROUTER
 */
const router = express.Router();

/**
 * ATTACH ROUTES
 */

router.use("/auth", AuthRoutes);
router.use("/user", UserRoutes);
router.use("/company", CompanyRoutes);
router.use("/dashboard", Dashboard);

router.use("/skin", SkinRoutes);
router.use("/group", GroupRoutes);
router.use("/race", RaceRoutes);
router.use("/stage", StageRoutes);
router.use("/feedback", FeedBackRoutes);

router.use("/raceRoute", RaceRouteRoutes);

router.use("/raceManagement", RaceManagementRoutes);
router.use("/upload", FILE);

module.exports = router;
