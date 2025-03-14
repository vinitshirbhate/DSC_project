import scrypt from "scrypt-js";

export const hash = async (password: string) => {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const passwordBuffer = new TextEncoder().encode(password);

  const derivedKey = await scrypt.scrypt(passwordBuffer, salt, 16384, 8, 1, 32);

  return `${Buffer.from(salt).toString("hex")}:${Buffer.from(derivedKey).toString("hex")}`;
};

export const verifyPassword = async (password: string, storedHash: string) => {
  const [saltHex, hashHex] = storedHash.split(":");
  const salt = new Uint8Array(Buffer.from(saltHex, "hex"));
  const storedKey = new Uint8Array(Buffer.from(hashHex, "hex"));

  const passwordBuffer = new TextEncoder().encode(password);
  const derivedKey = await scrypt.scrypt(passwordBuffer, salt, 16384, 8, 1, 32);

  return derivedKey.every((byte, i) => byte === storedKey[i]);
};
