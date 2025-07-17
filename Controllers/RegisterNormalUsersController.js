import { UsersModel } from "../Models/UsersModel.js";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";
import { emailRegex, phoneRegex, SALT } from "../config.js";
import { RolesModel } from "../Models/RolesModel.js";
dotenv.config();

const RegisterNormalUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, phoneNumber, role} = req.body;
    if (!email || !password || !firstName || !lastName || !role) {
      return res.status(400).json({
        message: "bad request check data again",
        data: req.body,
      });
    }
    const isEmailValidationTrue = emailRegex.test(email);
    if (!isEmailValidationTrue) {
      return res.status(401).json({
        message: "email is not valid",
        data: req.body,
      });
    }

    const isPhoneNumberValidationTrue = phoneRegex.test(phoneNumber);
        if (!isPhoneNumberValidationTrue) {
            return res.status(401).json({
                message: 'phone number is not valid',
                data: req.body
            })
    }

    const roleData = await RolesModel.findById(role)

    const hashedPassword = await bcrypt.hash(password, SALT);
    const newUser = {
      email: email,
      password: hashedPassword,
      firstName: firstName,
      lastName: lastName,
      phoneNumber: phoneNumber,
      role: roleData._id,
      createdByUserId: "68163015624b09de23e942ad",
      updatedByUserId: "68163015624b09de23e942ad",
      published: true,
    };
    const user = await UsersModel.create(newUser);
    user.password = "";
    return res.status(200).json({
      message: "user added successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      message: "internal server error",
      error: error.message,
    });
  }
};
export {
    RegisterNormalUser
}
