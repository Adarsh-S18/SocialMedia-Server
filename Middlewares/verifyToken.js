import jwt from 'jsonwebtoken'
import UserModel from '../Models/userModel.js'


export function verify(req, res, next) {
    const authHeader =
        req.headers?.cookie?.split("=")[1] || req.headers?.token?.split(" ")[1];
    console.log(req.headers.token, "this is aCCC token");
    if (authHeader) {
        const token = authHeader;
        console.log(token);
        jwt.verify(token, process.env.SECRET, async (err, user) => {
            if (err) res.status(404).json("Token is not valid!") && next([err]);
            else {
                const userDetails = await UserModel.findById(user.id);

                if (userDetails?.blocked) {
                    return res.status(401).json("You are blocked by admin!");
                } else {
                    req.user = user;
                    next();
                }
            }
        });
    } else {
        return res.status(401).json("You are not authenticated!");
    }
}

export const VerifyTokenAndAdmin = (req, res, next) => {

}
