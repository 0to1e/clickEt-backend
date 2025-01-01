// src/controller/authController.js
import User from "../models/userModel.js";
import crypto from "crypto";
import { setTokenCookie } from "../utils/cookieUtil.js";
import {
  createResetUrl,
  getPasswordResetTemplate,
  sendEmail,
} from "../utils/emailUtils.js";
export async function initRegistration(request, response) {
  const registrationCredentials = request.body;

  try {
    const user = await User.create(registrationCredentials);

    const accessToken = await user.generateJWTToken();
    const refreshToken = await user.generateRefreshToken();
    setTokenCookie(response, "access_token", accessToken);
    setTokenCookie(response, "refresh_token", refreshToken);

    user.password = undefined;

    return response.status(201).json({
      message: "User created successfully",
      user: user,
    });
  } catch (error) {
    console.error(`Registration Error:${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function initAuthentication(request, response) {
  const { user_name, password } = request.body;

  try {
    const user = await User.findOne({
      $or: [{ user_name }, { email: user_name }],
    });

    if (user) {
      const authResult = await user.comparePassword(password);
      if (authResult) {
        const accessToken = await user.generateJWTToken();
        const refreshToken = await user.generateRefreshToken();

        setTokenCookie(response, "refresh_token", refreshToken);
        setTokenCookie(response, "access_token", accessToken);

        return response.status(200).json({ message: "Login Successful" });
      }
      return response.status(401).json({ message: "Invalid Password" });
    }
    return response
      .status(404)
      .json({ message: "Invalid Account credentials" });
  } catch (error) {
    console.error(`Authentication Error: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function initTokenRefresh(request, response) {
  const { refreshToken } = request.body;

  if (!refreshToken) {
    return response.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const user = await User.findOne({ refresh_token: refreshTokenHash });

    if (!user) {
      return response.status(404).json({ message: "Invalid refresh token" });
    }

    // Check if the refresh token is expired
    if (Date.now() > user.refresh_token_expiry) {
      return response
        .status(400)
        .json({ message: "Refresh token has expired" });
    }

    const newAccessToken = await user.generateJWTToken();
    const newRefreshToken = await user.generateRefreshToken();
    setTokenCookie(response, "access_token", newAccessToken);
    setTokenCookie(response, "refresh_token", newRefreshToken);

    return response.status(200).json({
      message: "Access and Refresh tokens refreshed.",
    });
  } catch (error) {
    console.error(`Refresh Token Error: ${error.message}`);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendResetEmail(request, response) {
  const { email } = request.body;

  const user = await User.findOne({ email });
  if (!user) {
    return response.status(200).json({
      success: true,
      message:
        "If your'e a registered user, please check your inbox for password reset instructions.",
    });
  }

  // 2. Generate reset token
  const resetToken = await user.generateRecoveryToken();
  await user.save({ validateBeforeSave: false });
  user.password = undefined;

  // 3. Create reset URL
  const resetUrl = createResetUrl(resetToken);
  const emailTemplate = getPasswordResetTemplate(
    resetUrl,
    process.env.APP_NAME,
    process.env.APP_LOGO_URL
  );
  try {
    // 5. Send reset email
    await sendEmail({
      receiverEmail: user.email,
      subject: "Password Reset Request",
      html: emailTemplate,
    });

    // 6. Send success response
    response.status(200).json({
      success: true,
      message:
        "If your email is registered, you'll receive password reset instructions.",
    });
  } catch (error) {
    // 7. Handle email sending failure
    user.password_reset_Token = null;
    user.password_reset_expiry = null;
    await user.save({ validateBeforeSave: false });

    console.error(500, "Email could not be sent");
  }
}

export async function resetPassword(request, response) {
  const { token, password } = request.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    password_reset_Token: hashedToken,
    password_reset_expiry: { $gt: Date.now() },
  });

  if (!user) {
    response.status(401).json({
      message: "Invalid or Expired reset link",
    });
  }

  user.password = password;
  user.password_reset_Token = null;
  user.password_reset_expiry = null;
  await user.save();

  response.status(200).json({
    success: true,
    message: "Password reset successful",
  });
}

export async function checkExistingAuthCredentials(request, response) {
  const { user_name, email } = request.body;

  try {
    const existingUsers = await User.find({
      $or: [{ user_name }, { email: user_name }],
    });

    const credentialConflicts = {
      user_name: false,
      email: false,
    };

    if (existingUsers.length > 0) {
      existingUsers.forEach((user) => {
        if (user.email === email) {
          credentialConflicts.email = true;
        }
        if (user.user_name === user_name) {
          credentialConflicts.user_name = true;
        }
      });

      return response.status(409).json({
        message: "Credentials already in use",
        usedCredentials: credentialConflicts,
      });
    }
  } catch (error) {
    console.error(`Credentials Validation Error: ${error.message}`);
    return response
      .status(500)
      .json({ message: "Internal Server Error. Check console for details" });
  }
}

export async function listAllUsers(request, response) {
  try {
    const users = await User.find({});
    return response.status(200).json({ users });
  } catch (error) {
    console.error("Error retrieving users:", error.message);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}
