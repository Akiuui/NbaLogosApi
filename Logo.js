import mongoose from "mongoose"

const LogoSchema = new mongoose.Schema(

    {
        teamName: {
            type: String,
            required: true,
        },
        Base64String: {
            type: String,
            required: true
        },
        firstYearLogoUsed: {
            type: Number,
            required: true,
        },
        lastYearLogoUsed: {
            type: Number,
            required: true,
        }
    }

)

const Logo = mongoose.model("Logo", LogoSchema)

export default Logo