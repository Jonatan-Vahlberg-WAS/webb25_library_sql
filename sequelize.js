const { Sequelize } = require("sequelize");

// Skapa en ny Sequelize-instans
const sequelize = new Sequelize("library_orm", "postgres", "postgres", {
  host: "localhost",
  dialect: "postgres", // Databasens typ
  port: 5432,          // Standardport för PostgreSQL
});

// Testa anslutningen
sequelize
  .authenticate()
  .then(() => {
    console.log("Ansluten till databasen med Sequelize.");
  })
  .catch((err) => {
    console.error("Kunde inte ansluta till databasen:", err);
  });

// Synkronisera tabellerna med databasen
sequelize
  .sync({ alter: true }) // Skapar eller uppdaterar tabeller baserat på modeller
  .then(() => {
    console.log("Tabeller synkroniserade med Sequelize.");
  })
  .catch((err) => {
    console.error("Kunde inte synkronisera tabeller:", err);
  });

module.exports = sequelize;