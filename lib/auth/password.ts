import { createHash, pbkdf2, randomBytes, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"

const pbkdf2Async = promisify(pbkdf2)

const PASSWORD_SCHEME = "pbkdf2_sha512_v1"
const PASSWORD_ITERATIONS = 210_000
const PASSWORD_KEY_LENGTH = 32
const PASSWORD_SALT_LENGTH = 16

type PasswordVerificationResult = {
  valid: boolean
  needsRehash: boolean
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PASSWORD_SALT_LENGTH)
  const derivedKey = await pbkdf2Async(password, salt, PASSWORD_ITERATIONS, PASSWORD_KEY_LENGTH, "sha512")

  return `${PASSWORD_SCHEME}$${PASSWORD_ITERATIONS}$${salt.toString("hex")}$${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string): Promise<PasswordVerificationResult> {
  const parsedHash = parsePasswordHash(storedHash)

  if (!parsedHash) {
    return verifyLegacySha256Password(password, storedHash)
  }

  const derivedKey = await pbkdf2Async(
    password,
    Buffer.from(parsedHash.saltHex, "hex"),
    parsedHash.iterations,
    PASSWORD_KEY_LENGTH,
    "sha512",
  )

  const expectedKey = Buffer.from(parsedHash.hashHex, "hex")
  const valid =
    derivedKey.length === expectedKey.length && timingSafeEqual(Buffer.from(derivedKey), Buffer.from(expectedKey))

  return {
    valid,
    needsRehash: valid && parsedHash.iterations < PASSWORD_ITERATIONS,
  }
}

function parsePasswordHash(storedHash: string) {
  const [scheme, iterations, saltHex, hashHex] = storedHash.split("$")

  if (!scheme || !iterations || !saltHex || !hashHex) {
    return null
  }

  if (scheme !== PASSWORD_SCHEME || !/^\d+$/.test(iterations) || !isHexString(saltHex) || !isHexString(hashHex)) {
    return null
  }

  return {
    iterations: Number(iterations),
    saltHex,
    hashHex,
  }
}

function isHexString(value: string) {
  return value.length > 0 && /^[a-f0-9]+$/i.test(value)
}

function verifyLegacySha256Password(password: string, storedHash: string): PasswordVerificationResult {
  if (!/^[a-f0-9]{64}$/i.test(storedHash)) {
    return { valid: false, needsRehash: false }
  }

  const candidateHash = createHash("sha256").update(password, "utf8").digest()
  const storedBuffer = Buffer.from(storedHash, "hex")

  if (candidateHash.length !== storedBuffer.length) {
    return { valid: false, needsRehash: false }
  }

  const valid = timingSafeEqual(candidateHash, storedBuffer)

  return {
    valid,
    needsRehash: valid,
  }
}
