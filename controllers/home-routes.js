const router = require("express").Router();
const { Blog, User, Comment } = require("../models");
const userAuth = require("../utils/auth");
const timeStamp = require("../utils/helpers");

router.get("/", (req, res) => {
  Blog.findAll({
    attributes: ["id", "title", "content", "created_at"],
    order: [["created_at", "DESC"]],
    include: [
      {
        model: User,
        attributes: ["username"],
      },
      {
        model: Comment,
        attributes: ["content", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
    ],
  })
    .then((blogData) => {
      const blogs = blogData.map((blog) => blog.get({ plain: true }));
      res.render("homepage", {
        blogs,
        loggedIn: req.session.loggedIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get("/login", (req, res) => {
  if (req.session.loggedIn) {
    res.redirect("/dashboard");
    return;
  }
  res.render("login");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/new-blog", userAuth, (req, res) => {
  if (req.session.loggedIn) {
    res.render("new-blog", { loggedIn: true });
  }
});

router.get("/blog/:id", userAuth, (req, res) => {
  Blog.findOne({
    where: {
      id: req.params.id,
    },
    attributes: ["id", "title", "creator_id", "content", "created_at"],
    include: [
      {
        model: Comment,
        attributes: ["id", "content", "user_id", "created_at"],
        include: {
          model: User,
          attributes: ["username"],
        },
      },
      {
        model: User,
        attributes: ["username"],
      },
    ],
  })

    .then((blogData) => {
      if (!blogData) {
        res
          .status(404)
          .json({ message: "No specified blog post was found with that ID" });
        return;
      }
      const blog = blogData.get({ plain: true });
      res.render("single-blog", { blog, loggedIn: req.session.loggedIn });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json(err);
    });
});

module.exports = router;
