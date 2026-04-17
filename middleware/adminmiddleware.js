export const adminmiddle = (req, res, next) => {
    if (!req.session.adminId) {
        return res.status(401).json({ message: "admin not logged in", success: false })
    }
    next()
}

export const superAdminOnly = (req, res, next) => {
    if (req.session.role !== 'superadmin') {
        return res.status(403).json({ message: "Access denied. Superadmin only.", success: false })
    }
    next()
}

export const adminOnly = (req, res, next) => {
    if (req.session.role !== 'superadmin' && req.session.role !== 'admin') {
        return res.status(403).json({ message: "Access denied. Admin or Superadmin required.", success: false })
    }
    next()
}