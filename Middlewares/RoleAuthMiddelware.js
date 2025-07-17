import { RolesModel } from "../Models/RolesModel.js";

export const RoleAuthMiddleware = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({
        message: "Access denied: user not found",
      });
    }

    try {
      // Fetch the role document using the ID
      const userRoleDoc = await RolesModel.findById(req.user.roleId);
      if (!userRoleDoc) {
        return res.status(403).json({ message: "Access denied: role not found" });
      }

      // Case-insensitive role match
      const allowedRoles = roles.map(r => r.toUpperCase());
      const userRoleName = userRoleDoc.name.toUpperCase();

      if (!allowedRoles.includes(userRoleName)) {
        return res.status(403).json({ message: "Access denied" });
      }

      next();
    } catch (err) {
      console.error("Role auth error:", err);
      return res.status(500).json({ message: "Internal server error while authenticating role" });
    }
  };
};
