import express from "express"
import fs from "fs"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"

import Logo from "./Logo.js"
import ValidateQueryParams from "./middleware/ValidateQueryParams.js"

const app = express()
dotenv.config()
app.use(cors())


app.get('/nbalogos', ValidateQueryParams, async (req, res) => {

    const teamName = req.query.teamName
    const teamYear = req.query.teamYear

    if (!teamName && !teamYear) {  //WHEN WE DONT HAVE ANY QUERYS
        const wholeDB = await Logo.find({})
        res.status(200).json(wholeDB)
        return
    }

    if (teamName && !teamYear) { //WHEN WE ONLY HAVE TEAMNAME QUERY

        const team = await Logo.find({ teamName })
            .catch(err => {
                res.status(400).json(err)
                return
            }
            )

        if (team.length === 0) {
            res.status(400).json(`Couldnt find a logo with name: '${teamName}'`)
            return
        }

        res.status(200).json(team)
        return
    }

    if (!teamName && teamYear) { //WHEN WE ONLY HAVE TEAMYEAR QUERY

        const team = await Logo.find({
            $and: [
                { firstYearLogoUsed: { $lt: Number(teamYear) } },
                { lastYearLogoUsed: { $gt: Number(teamYear) } }
            ]
        })
            .catch(err => {
                res.status(400).json(err)
                return
            })

        if (team.length === 0) {
            res.status(400).json(`Couldnt find a logo that was used ${teamYear}`)
            return
        }

        res.status(200).json(team)
    }

    if (teamName && teamYear) { //WHEN WE HAVE BOTH QUERYS

        const team = await Logo.findOne({
            $and: [
                { teamName },
                { firstYearLogoUsed: { $lt: Number(teamYear) } },
                { lastYearLogoUsed: { $gt: Number(teamYear) } }
            ]
        })
            .catch(err => {
                res.status(400).json(err)
                return

            })

        if (team === null) {
            res.status(400).json(`Couldnt find a logo named: ${teamName}, that was used ${teamYear}`)
            return
        }

        res.status(200).json(team)

    }

})

app.get("/names", (req, res) => {

    try {

        const files = fs.readdirSync('./images')//Return an array of names of files

        const allSplitFiles = files.map(async img => {

            const splitFile = img.split("-")
            const imagePath = `./images/${img}`
            let splitFileLength = splitFile.length

            let lastYearLogoUsed
            let firstYearLogoUsed
            let teamName
            const imageBuffer = fs.readFileSync(imagePath, (err, data) => {
                if (err) {
                    console.log(err)
                    return
                } else

                    return data
            })
            let Base64String = imageBuffer.toString("base64")
            Base64String = "asd"

            if (splitFile[splitFileLength - 3] !== "logo") {

                lastYearLogoUsed = splitFile[splitFileLength - 3]

                firstYearLogoUsed = splitFile[splitFileLength - 4]

                if (splitFileLength === 6)
                    teamName = `${splitFile[0]}+${splitFile[1]}`

                if (splitFileLength === 7)
                    teamName = `${splitFile[0]}+${splitFile[1]}+${splitFile[2]}`

                if (splitFileLength === 8)
                    teamName = `${splitFile[0]}+${splitFile[1]}+${splitFile[2]}+${splitFile[3]}`
            } else {

                lastYearLogoUsed = 99
                firstYearLogoUsed = 99

                if (splitFileLength === 5)
                    teamName = `${splitFile[0]}+${splitFile[1]}`

                if (splitFileLength === 6)
                    teamName = `${splitFile[0]}+${splitFile[1]}+${splitFile[2]}`

                if (splitFileLength === 7)
                    teamName = `${splitFile[0]}+${splitFile[1]}+${splitFile[2]}+${splitFile[3]}`

            }

            const newLogo = new Logo({
                teamName,
                Base64String,
                firstYearLogoUsed,
                lastYearLogoUsed,
            })

            return await newLogo.save()

        })

        res.json(allSplitFiles);

    } catch (error) {
        res.status(200).json("Error reading folder and saving newLogos")
        console.error('Error reading folder:', error);
    }

})

const port = process.env.PORT || 6001;

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    app.listen(port, () => console.log(`Server Post is ${port}`))
}).catch((err) => console.log(`${err} did not connect`))
