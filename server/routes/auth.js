import express from "express";
import passport from "passport";

const router = express.Router();

router.get("/login/success", (req, res) => {
	if (req.user) {
		res.status(200).json({ success: true, user: req.user });
	} else {
		res.status(401).json({ success: false, message: "User not authenticated" });
	}
});

router.get("/login/failed", (req, res) => {
	res.status(401).json({ success: true, message: "failure" });
});

router.get("/logout", (req, res, next) => {
	req.logout((err) => {
		if (err) {
			return next(error);
		}

		req.session.destroy((err) => {
			res.clearCookie("connect.sid");
			res.json({ status: "logout", user: {} });
		});
	});
});

export default router;
