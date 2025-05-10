import {
  createUser,
  verifyLogin,
  generateVerificationCode as generateCode,
  sendVerificationEmail as sendEmail,
  getUserInfo,
} from "./auth-service"

// Re-export functions with the old names to maintain compatibility
export const createStackUser = createUser
export const loginWithStack = verifyLogin
export const verifyStackToken = validateSession
export const getStackUserInfo = getUserInfo

// Re-export functions with the same names
export const generateSecret = generateSecret
export const generateQRCode = generateQRCode
export const verifyTOTP = verifyTOTP
export const generateBackupCodes = generateBackupCodes
export const generateVerificationCode = generateCode
export const sendVerificationEmail = sendEmail
export const createSession = createSession
export const validateSession = validateSession
export const deleteSession = deleteSession
export const deleteAllUserSessions = deleteAllUserSessions
