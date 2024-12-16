function ValidateQueryParams(req, res, next) {
    const { teamName, teamYear } = req.query

    //We check if the name of the team contains any digits
    if (teamName !== undefined && !isNaN(teamName)) {
        return res.status(400).json({ error: 'teamName must be a string' });
    }

    //We are checking if teamYear is a char
    if (teamYear !== undefined && isNaN(Number(teamYear))) {
        return res.status(400).json({ error: 'teamYear must be a number' });
    }

    //We check if the team name is maybe an array, if it is we convert it into an array
    if (teamName?.includes(',')) {
        const validatedTeamName = teamName.split(',')
        req.query.teamName = validatedTeamName
    }

    next()
}

export default ValidateQueryParams
