import express from 'express';
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cors from "cors";


dotenv.config();

//Notes schema
const noteSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const Note = mongoose.model("Note", noteSchema);

const app = express();
const port = process.env.PORT || 3001;
//middleware
app.use(express.json());
app.use(cors());
mongoose.connect(process.env.DATABASE_URL).then(()=>{
    // console.log("MongoDB Connected");
}).catch(err=>{
    console.log(err)
}
);

app.get('/',(req,res)=>{
    res.json({
        message :"the app is working",
        status: "OK",
        dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        timestamp: new Date().toISOString()
    })
})

app.post("/api/notes", async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content required" });
        }

        const note = await Note.create({ title, content });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get("/api/notes", async (req, res) => {
    try {
        const notes = await Note.find().sort({ createdAt: -1 });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.delete("/api/notes/:id", async (req, res) => {
    try {
        const deleted = await Note.findByIdAndDelete(req.params.id);

        if (!deleted) {
            return res.status(404).json({ message: "Note not found" });
        }

        res.json({ message: "Note deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/api/health',(req,res)=>{
    res.status(200).send("the app is healthy")
});

app.listen(port,()=>{
    // console.log(`Server started on port ${port}`);
})