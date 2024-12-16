const SanitizeQueryParams = (req, res, next) => {

    function sanitizeTeamName(teamName) {
        return teamName
            ?.replace("LA", "Los Angeles")
            ?.replace(/[^a-zA-Z0-9\s]/g, '')   // Remove all special chars
            ?.trim()                           // Trim leading and trailing whitespace
            ?.replace(/\s+/g, '+')             // Replace remaining spaces with '+'
            ?.toLowerCase();                   // Convert to lowercase
    }
    const { teamName, teamYear } = req.query

    let sanitizedTeamName
    let sanitizedTeamYear

    if (Array.isArray(teamName) && teamName!==undefined)
        sanitizedTeamName = teamName.map(team => { return sanitizeTeamName(team) }) //Sanitize input
    else
        sanitizedTeamName = teamName
                                ?.replace("LA", "Los Angeles")
                                ?.replace(/[^a-zA-Z0-9\s]/g, '')   // Remove all special chars
                                ?.trim()                           // Trim leading and trailing whitespace
                                ?.replace(/\s+/g, '+')             // Replace remaining spaces with '+'
                                ?.toLowerCase();                   // Convert to lowercase

    sanitizedTeamYear = teamYear
                            ?.replace(/[^a-zA-Z0-9\s]/g, '')   // Remove all special chars
                            ?.trim()

    req.query.teamName = sanitizedTeamName
    req.query.teamYear = sanitizedTeamYear

    next()
};

export default SanitizeQueryParams;
