export const adminmiddle = (req, res, next) => {
    if (!req.session.adminId) {
        return res.status(401).json({ message: "admin not logged in", success: false })
    }
    next()
}