const express = require("express");
const router = express.Router();
const { Student } = require("../models");

// GET /api/students - Get all students
router.get("/", async (req, res) => {
  try {
    const students = await Student.findAll();
    res.json(students);
  } catch (err) {
    console.error("Fel vid hämtning av studenter:", err);
    res.status(500).send("Ett fel uppstod vid hämtning av studenter.");
  }
});

// POST /api/students - Create a new student
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ message: "name och email krävs" });
    }
    
    const newStudent = await Student.create({ name, email });
    res.status(201).json({
      message: "Student lades till",
      student: newStudent,
    });
  } catch (err) {
    console.error("Fel vid tillägg av student:", err);
    res.status(500).send("Ett fel uppstod vid tillägg av student.");
  }
});

// GET /api/students/:id - Get a specific student
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findByPk(id);
    
    if (!student) {
      return res.status(404).json({ message: "Student hittades inte" });
    }
    
    res.json(student);
  } catch (err) {
    console.error("Fel vid hämtning av student:", err);
    res.status(500).send("Ett fel uppstod.");
  }
});

// PUT /api/students/:id - Update a student
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: "Student hittades inte" });
    }
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "Inga fält att uppdatera" });
    }
    
    await Student.update(updateData, { where: { id } });
    
    res.json({
      message: "Student uppdaterades"
    });
  } catch (err) {
    console.error("Fel vid uppdatering av student:", err);
    res.status(500).send("Ett fel uppstod vid uppdatering av student.");
  }
});

// DELETE /api/students/:id - Delete a student
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findByPk(id);
    if (!student) {
      return res.status(404).json({ message: "Student hittades inte" });
    }
    
    await Student.destroy({ where: { id } });
    
    res.json({
      message: "Student togs bort"
    });
  } catch (err) {
    console.error("Fel vid borttagning av student:", err);
    res.status(500).send("Ett fel uppstod vid borttagning av student.");
  }
});

module.exports = router;
