const Book = require("../models/book");
const fs = require("fs");

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  const book = new Book({
    title: bookObject.title,
    author: bookObject.author,
    year: bookObject.year,
    genre: bookObject.genre,
    ratings: bookObject.ratings,
    averageRating: bookObject.averageRating,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.savedImage}`,
  });

  book
    .save()
    .then(() => {
      res.status(201).json({ message: "Objet enregistré !" });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

exports.modifyBook = (req, res, next) => {
  let bookObject;

  if (req.file) {
    const parsedBody = JSON.parse(req.body.book);
    bookObject = {
      title: parsedBody.title,
      author: parsedBody.author,
      year: parsedBody.year,
      genre: parsedBody.genre,
      ratings: parsedBody.ratings,
      averageRating: parsedBody.averageRating,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${
        req.file.filename
      }`,
    };
  } else {
    bookObject = {
      title: req.body.title,
      author: req.body.author,
      year: req.body.year,
      genre: req.body.genre,
      ratings: req.body.ratings,
      averageRating: req.body.averageRating,
    };
  }

  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        Book.updateOne(
          { _id: req.params.id },
          {
            title: bookObject.title,
            author: bookObject.author,
            year: bookObject.year,
            genre: bookObject.genre,
            ratings: bookObject.ratings,
            averageRating: bookObject.averageRating,
            imageUrl: bookObject.imageUrl,
            _id: req.params.id,
          }
        )
          .then(() => res.status(200).json({ message: "Objet modifié!" }))
          .catch((error) => {
            res.status(401).json({ error });
          });
      }
    })
    .catch((error) => {
      res.status(404).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Objet supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.addRating = async (req, res, next) => {
  try {
    const book = await Book.findOne({ _id: req.params.id });

    if (book.ratings.some((rating) => rating.userId === req.body.userId)) {
      return res
        .status(401)
        .json({ message: "Vous avez déjà publié une note !" });
    }

    book.ratings.push({ userId: req.body.userId, grade: req.body.rating });

    book.averageRating = parseFloat(
      (
        book.ratings.reduce((total, { grade }) => total + grade, 0) /
        book.ratings.length
      ).toFixed(1)
    );

    const bookModified = await Book.findOneAndUpdate(
      { _id: req.params.id },
      { ratings: book.ratings, averageRating: book.averageRating },
      { new: true }
    );

    return res.status(200).json(bookModified);
  } catch (error) {
    return res.status(400).json({ error });
  }
};
