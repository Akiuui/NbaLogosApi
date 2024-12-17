import Logo from "../schema/Logo.js"

    async function getAllLogos(){
        return await Logo.find({})
    }
    async function getLogosByName(teamName){
        if(Array.isArray(teamName)){
            const promises = teamName.map(team => Logo.find({teamName: team}))
            return (await Promise.all(promises)).flat()
        }
        return [await Logo.find({teamName})]
    }
    async function getLogosByYear(teamYear){
        return await Logo.find({
            $and: [
                { firstYearLogoUsed: { $lt: Number(teamYear) } },
                { lastYearLogoUsed: { $gt: Number(teamYear) } }
            ]
        })
    }
    async function getLogosByNameAndYear(teamName, teamYear){
        const query = {
            $and: [
                { teamName: teamName },
                { firstYearLogoUsed: { $lte: Number(teamYear) } },
                { lastYearLogoUsed: { $gte: Number(teamYear) } }
            ]
        }
        if(Array.isArray(teamName)){
            const promises = teamName.map(name=> Logo.findOne({...query, teamName: name}))
            return await Promise.all(promises)
        }
        return [await Logo.findOne(query)]
    }

export {getAllLogos, getLogosByName,getLogosByYear,getLogosByNameAndYear} 