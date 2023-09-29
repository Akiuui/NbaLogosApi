function ValidateQueryParams(req, res, next) {
    const { teamName, teamYear } = req.query

    if (teamName !== undefined && !isNaN(teamName)) {
        return res.status(400).json({ error: 'teamName must be a string' });
    }

    if (teamYear !== undefined && isNaN(Number(teamYear))) {
        console.log("Usao je")
        return res.status(400).json({ error: 'teamYear must be a number' });
    }

    next()
}

export default ValidateQueryParams
