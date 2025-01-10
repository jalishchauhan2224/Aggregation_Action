import express, { urlencoded } from "express";
import router from "./src/routes/router.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(urlencoded({ extended: true }))
app.get("/", (req, res) => {
    res.send("Server is running...")
})


app.use("/", router)

app.listen(PORT, (err) => {
    if (!err) {
        console.log(`Server is Successfully Running On Port ${PORT}`);
    }
    else {
        console.log(`Error occurred, server can't start ,${err}`);
    }
})