import argon2 from "argon2-browser";

export const hash = async (
  password: string,
  salt: string | Uint8Array<ArrayBufferLike>
) => {
  const hashed = await argon2.hash({
    pass: password,
    salt: salt,
    type: argon2.ArgonType.Argon2id,
    time: 3,
    mem: 65536,
    hashLen: 32,
  });

  return hashed.encoded;
};
