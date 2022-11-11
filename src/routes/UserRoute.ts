import express, { Express, Request, Response, NextFunction } from "express";

const router = express.Router();
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import { User } from "../models/UserModel";
import authenticateToken from "../utils/authenticateToken";
import generateToken from "../utils/generateToken";

interface IUser {
  username: string;
  email: string;
  password: string;
}

router.get("/", async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post(
  "/find",
  async (
    req: Request<{}, {}, { requester: string; searchTerm: string }, {}>,
    res: Response
  ) => {
    try {
      const users = await User.find(
        {
          $and: [
            { username: { $ne: req.body.requester } },
            { username: { $regex: req.body.searchTerm } },
          ],
        },
        { password: 0 }
      );
      res.status(200).json({ users });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

router.put(
  "/:userId",
  async (
    req: Request<{ userId: string }, {}, { newUsername: string }, {}>,
    res: Response
  ) => {
    try {
      const { userId } = req.params;
      const { newUsername } = req.body;
      const existsUsername = await User.findOne({ username: newUsername });
      if (!existsUsername) {
        const user = await User.findByIdAndUpdate(
          userId,
          { username: newUsername },
          { new: true }
        ).select({ email: 1, username: 1, id: 1 });
        if (user) {
          const authToken = generateToken(
            user?.username,
            user?.email,
            user?.id
          );
          res.cookie("session", authToken, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          });
          res.status(200).json(user);
        } else {
          res.sendStatus(500);
        }
      } else {
        res.status(400).send("Username exists!");
      }
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

// auto login
router.get("/login", async (req: Request, res: Response) => {
  try {
    const session = req.headers.cookie?.split("=")[1];
    if (session) {
      jwt.verify(
        session,
        process.env.ACCESS_TOKEN || "secondary",
        (err, user) => {
          if (err) return res.sendStatus(403);
          return res.status(200).json({ user });
        }
      );
      // const decodedToken = jwt.verify(session,process.env.ACCESS_TOKEN || 'secondary') as MyToken
      // if(decodedToken){
      //     const user = await User.findOne({username:decodedToken.username})
      //     res.status(200).json({
      //         username:user?.username,
      //         email:user?.email,
      //         userId:user?.id,

      //     })
      // }
      // else{
      //     res.sendStatus(403)
      // }
    } else res.sendStatus(404);
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

router.post(
  "/login",
  async (
    req: Request<{}, {}, { username: string; password: string }, {}>,
    res: Response
  ) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });

      if (user) {
        const validPassword = await user.matchPassword(password);
        if (validPassword) {
          const authToken = generateToken(user.username, user.email, user.id);
          res.cookie("session", authToken, {
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
          });
          res.status(200).json({
            user: {
              username: user.username,
              email: user.email,
              _id: user.id,
            },
          });
        } else res.status(404).json({ error: "Incorrect password!" });
      } else res.status(404).json({ error: "Incorrect username!" });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

router.post(
  "/register",
  validateCredentials,
  async (req: Request<{}, {}, IUser, {}>, res: Response) => {
    try {
      const user = await User.create(req.body);
      await user.save();
      const authToken = generateToken(user.username, user.email, user.id);
      res.cookie("session", authToken);
      res.status(200).json({
        user: {
          username: user.username,
          email: user.email,
          _id: user.id,
        },
      });
    } catch (error) {
      console.log(error);
      res.sendStatus(500);
    }
  }
);

router.delete("/", async (req: Request, res: Response) => {
  try {
    await User.deleteMany();
    res.status(200).send("deleted successfully!");
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

async function validateCredentials(
  req: Request<{}, {}, IUser, {}>,
  res: Response,
  next: NextFunction
) {
  const { email, username, password } = req.body;
  const usernameRgx = new RegExp(/[^a-z0-9]/, "ig");
  const numberRgx = new RegExp(/\d/, "g");
  const capsRgx = new RegExp(/[A-Z]/, "g");
  const lowsRgx = new RegExp(/[a-z]/, "g");

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) {
    return res.status(400).send("Username or Email already taken");
  }
  if (usernameRgx.test(username)) {
    return res.status(400).send("Username must not contain special characters");
  }
  if (username.length < 4) {
    return res.status(400).send("Username must be atleast 4 characters long");
  }
  if (password.length < 8) {
    return res.status(400).send("Password must be atleast 8 characters long");
  }
  if (password.length < 8) {
    return res
      .status(400)
      .send(
        "Password must contain atleast 1 number , capital letters and lowercase letters"
      );
  }
  if (
    !numberRgx.test(password) ||
    !capsRgx.test(password) ||
    !lowsRgx.test(password)
  ) {
    return res.status(400).send("Password must fit requirements");
  }
  next();
}

export { router as userRouter };
