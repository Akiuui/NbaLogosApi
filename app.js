//DEPENDENCYES
import express from "express"
import fs from "fs"
import mongoose from "mongoose"
import dotenv from "dotenv"
import cors from "cors"
//COMPONENTS
import Logo from "./schema/Logo.js"
import ValidateQueryParams from "./middleware/ValidateQueryParams.js"
import SanitizeQueryParams from "./middleware/SanitizeQueryParams.js"

const app = express()
dotenv.config()
app.use(cors())

app.get('/nbalogos', ValidateQueryParams, SanitizeQueryParams, async (req, res) => {

    const teamName = req.query.teamName
    const teamYear = req.query.teamYear

    let teams = []

    if (!teamName && !teamYear) {  //WHEN WE DONT HAVE ANY QUERYS
        teams = await Logo.find({})

        res.status(200).json(teams)
        return
    }

    if (teamName && !teamYear) { //WHEN WE ONLY HAVE TEAMNAME QUERY

        if (Array.isArray(teamName)) { //If the query is an array

            try {
                const teamsPromise = teamName.map(team => Logo.find({ teamName: team }))
                teams = await Promise.all(teamsPromise)
            } catch (err) {
                res.status(400).json({ error: err })
                return
            }

            let cnt = 0
            teams.forEach(team => {
                if (team.length === 0)
                    cnt++
            })

            if (cnt) {
                res.status(400).json({ error: `${cnt} elements of the input query array are not entered correctly` })
                return
            }

        } else {//If query isnt an array

            teams[0] = await Logo.find({ teamName })
                .catch(err => {
                    res.status(400).json(err)
                    return
                })

            if (teams.length === 0) {
                res.status(400).json(`Couldnt find a logo with name: '${teamName}'`)
                return
            }

        }

        const modifiedData = teams.map(team => ({
            teamName: team.teamName,
            Base64String: team.Base64String
        }));


        res.status(200).json(modifiedData)
        return
    }

    if (!teamName && teamYear) { //WHEN WE ONLY HAVE TEAMYEAR QUERY

        teams[0] = await Logo.find({
            $and: [
                { firstYearLogoUsed: { $lt: Number(teamYear) } },
                { lastYearLogoUsed: { $gt: Number(teamYear) } }
            ]
        }).catch(err => {
            res.status(400).json(err)
            return
        })

        if (teams.length === 0) {
            res.status(400).json(`Couldnt find a logo that was used ${teamYear}`)
            return

        }

        const modifiedData = teams.map(team => ({
            teamName: team.teamName,
            teamYear: team.teamYear,
            Base64String: team.Base64String
        }));

        res.status(200).json(modifiedData)
        return
    }

    if (teamName && teamYear) { //WHEN WE HAVE BOTH QUERYS

        if (Array.isArray(teamName)) { //If the query is an array

            try {
                const teamsPromise = teamName.map(async team => {
                    return await Logo.findOne({
                        $and: [
                            { teamName: team },
                            { firstYearLogoUsed: { $lte: Number(teamYear) } },
                            { lastYearLogoUsed: { $gte: Number(teamYear) } }
                        ]
                    })
                })
                teams = await Promise.all(teamsPromise)

            } catch (err) {
                res.status(400).json({ error: err })
                return
            }

        } else { //If the query isnt an array

            teams[0] = await Logo.findOne({
                $and: [
                    { teamName },
                    { firstYearLogoUsed: { $lte: Number(teamYear) } },
                    { lastYearLogoUsed: { $gte: Number(teamYear) } }
                ]
            }).catch(err => {
                res.status(400).json(err)
                return
            })

            if (teams[0] === null) {
                res.status(400).json(`Couldnt find a logo named: ${teamName}, that was used ${teamYear}`)
                return
            }
        }
        
        let modifiedData = teams.map(team => (
            {
                teamName: team?.teamName,
                Base64String: team?.Base64String
            }))

        modifiedData = modifiedData.filter(logo => logo.teamName && logo.Base64String)

        res.status(200).json(modifiedData)
        return
    }


})

app.get("/repopulateDB", (req, res) => {

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
