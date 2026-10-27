const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const _ = require("lodash");

const User = require("../models/users");
const auth = require("../middleware/auth");

// Logged-in user profile
router.get("/me", auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password");
        return res.send(user);
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Server error" });
    }
});

// Profile image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "upload/profiles");
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + "-" + Date.now() + ext;
        req.filename = filename;
        cb(null, filename);
    },
});

const upload = multer({ storage });

// Signup
router.post(
    "/signup",
    upload.fields([{ name: "profilePic", maxCount: 1 }]),
    async (req, res) => {
        const { name, email, password, deliveryAddress, account } = req.body;
        const profilePicFile = req.files?.profilePic?.[0]?.filename;

        try {
            let user = await User.findOne({ email });

            if (user) {
                if (profilePicFile) {
                    const filePath = path.join(
                        "upload",
                        "profiles",
                        profilePicFile
                    );
                    fs.unlinkSync(filePath);
                }

                return res.status(400).json({
                    message: "Email is already registered",
                });
            }

            user = new User({
                name,
                email,
                password,
                deliveryAddress,
                account,
                profilePic: profilePicFile || "default.jpg",
                isAdmin: false,
            });

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            const tokenPayload = _.pick(user, [
                "_id",
                "name",
                "email",
                "profilePic",
                "deliveryAddress",
                "account",
                "isAdmin",
            ]);

            const token = jwt.sign(
                tokenPayload,
                process.env.JWTSECRET,
                { expiresIn: 3600 }
            );

            return res.status(201).json({ token });
        } catch (err) {
            console.error(err.message);
            return res.status(500).json({ message: "Server error" });
        }
    }
);

// Login
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        const tokenPayload = _.pick(user, [
            "_id",
            "name",
            "email",
            "deliveryAddress",
            "account",
            "profilePic",
            "isAdmin",
        ]);

        const token = jwt.sign(
            tokenPayload,
            process.env.JWTSECRET,
            { expiresIn: 3600 }
        );

        return res.json({ token });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;