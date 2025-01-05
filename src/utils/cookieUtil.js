// src/utils/cookieUtil.js
import crypto from "crypto";
export const setTokenCookie = (response, cookie_name, tokenValue) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    maxAge: process.env.JWT_REFRESH_EXPIRY * 24 * 60 * 60 * 1000,
    path: "/",
  };

  response.cookie(cookie_name, tokenValue, cookieOptions);
};

export const hashCrypto = (refreshToken) =>
  crypto.createHash("sha256").update(refreshToken).digest("hex");


export const verifyAccessToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    return decoded;
  } catch (error) {
    throw new Error(`Invalid or expired token: ${error.message}`);
  }
};

export const getUserIdFromToken = (token) => {
  const decoded = verifyAccessToken(token);
  return decoded.id;
};