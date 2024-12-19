//DEPENDENCYES
import express from "express"
import fs from "fs"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
//COMPONENTS
import ValidateQueryParams from "./middleware/ValidateQueryParams.js"
import SanitizeQueryParams from "./middleware/SanitizeQueryParams.js"
import { getAllLogos, getLogosByName, getLogosByNameAndYear, getLogosByYear } from "./controllers/LogoController.js"

const app = express()
dotenv.config()
app.use(cors())

app.get('/nbalogos', ValidateQueryParams, SanitizeQueryParams, async (req, res) => {

    const teamName = req.query.teamName
    const teamYear = req.query.teamYear

    let result;

    try{
        //DISPATCHER
        if (!teamName && !teamYear)  //WHEN WE DONT HAVE ANY QUERYS
            result = await getAllLogos()

        if (teamName && !teamYear)  //WHEN WE ONLY HAVE TEAMNAME QUERY
            result = await getLogosByName(teamName)

        if (!teamName && teamYear) //WHEN WE ONLY HAVE TEAMYEAR QUERY
            result = await getLogosByYear(teamYear)

        if (teamName && teamYear)   //WHEN WE HAVE BOTH QUERYS
            result = await getLogosByNameAndYear(teamName, teamYear)

        //Formatting
        const formattedResult = result.map(team => ({
            teamName: team.teamName,
            firstYearLogoUsed: team.firstYearLogoUsed,
            lastYearLogoUsed: team.lastYearLogoUsed,
            Base64String: team.Base64String
        }));

        //Result checking
        if(!result || result.length == 0)
            return res.status(404).json({message: "No result found"})

        res.status(200).json(formattedResult)
    
    }catch(err){
        res.status(500).json({error: "Server error", details: err.message})
    }
})

const port = process.env.PORT || 6001;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(port, () => console.log(`Server Port is ${port}`))
}).catch((err) => console.log(`${err} did not connect`))
