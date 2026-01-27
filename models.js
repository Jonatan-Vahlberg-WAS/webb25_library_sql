const { DataTypes } = require("sequelize");
const sequelize = require("./sequelize");

// Modell för författare
const Author = sequelize.define(
  "author",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    year_of_birth: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0,
        max: new Date().getFullYear(),
      },
    },
  },
  {
    timestamps: false, // Stäng av createdAt och updatedAt
    freezeTableName: true, // Använd modellnamnet som tabellnamn
  }
);

// Modell för böcker
const Book = sequelize.define(
  "book",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    author_id: {
      type: DataTypes.INTEGER,
      references: {
        model: Author,
        key: "id",
      },
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

// Definiera relation (en författare har många böcker)
Author.hasMany(Book, { foreignKey: "author_id" });
Book.belongsTo(Author, { foreignKey: "author_id" });

// Modell för Student
const Student = sequelize.define(
  "student",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
  },
  {
    timestamps: false, // Stäng av createdAt och updatedAt
    freezeTableName: true, // Använd "student" som tabellnamn
  }
);

module.exports = { Author, Book, Student };