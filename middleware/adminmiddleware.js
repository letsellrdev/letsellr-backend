export const adminmiddle = (req, res, next) => {
    if (!req.session.adminId) {
        console.warn(`[Auth] Blocked: No adminId in session. URL: ${req.originalUrl}`);
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
    const allowedRoles = ['superadmin', 'admin', 'manager'];
    if (!allowedRoles.includes(req.session.role)) {
        console.warn(`[Auth] Permission Denied: Role '${req.session.role}' is not allowed for URL: ${req.originalUrl}`);
        return res.status(403).json({ message: "Access denied. Admin, Superadmin or Manager required.", success: false })
    }
    next()
}