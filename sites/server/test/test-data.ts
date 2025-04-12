import { genNewUserKeys, genSrpAttributes } from "@acloud/crypto";

export const validJWT =
  "auth=eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiI0ZTZlZjNiMC1mZWUxLTQ1NTEtODVmZC1mMWUyOWIxMGUzYmEiLCJzcnBTZXJ2ZXJTZXNzaW9uS2V5IjoiNTYwY2MzYmU2NDFjYWFkMjc0MjMyZjliNDYzZmFiNzFiNmIyYjkxYWQwNWI3MGJhZTE1YWU2OWNmODYwZjNlOCIsImV4cCI6MTc0NDk2Mjc5M30.HXv5J6-xYmJBOIqOLS1BDWfIaOYeuhAVVar9kkeoJvw";

export const validUserId = "4e6ef3b0-fee1-4551-85fd-f1e29b10e3ba";

export const genValidSignUpParams = async (password: string) => {
  const srpParams = await genSrpAttributes(password);
  const keyParams = await genNewUserKeys(password);

  return { srpParams, keyParams };
};

/**
 * generated with:
 * > bun run test:genTestData
 */
export const validSignUpParams = {
  srpParams: {
    srpSalt: "e9c04894721e2a98cf29c16ebfe10dd6b103462616dc82b43488588f7663d798",
    srpVerifier:
      "58717944288907ed372133f18814ddbfe6f13ec79a05951c67d4b03538d0883ab2d0bc3b68d347c40d0587278e37d4e12edaaf83512cf46d91ece45b42138d95de16fe6cd3c807e86b5cf2a26b69c8175c294783ef060d54e37371942c023ad07b421fd485f8c3bf9baad3e628af5af4baf35d91ef8a3d687ffbcd984206bf29504c42414438a54f6fd0bbf7186f33f1222c7c2303832a881f1d26d8fe06ae9fc2ebdd3127731df601db618d75e487196b4b6b8ab929e31894d872eb93ac576b322b01beffbf94720155d4fa68a90f888d181f73a77eceac289102056b4817de6174b70b0176be89cf3ae6169215d1d7fec63b47e926677b61a918709612185c",
  },
  keyParams: {
    keyEncryptionKeySalt: "DEFhmeFgppDQcHZMqicFKg==",
    encryptedMainKey: "hXEBXwI0EmxXEkGOgKyJhRWAtHGon4I83fTlrSGimgtyKoBwpWC4nnETZGd56Sfm",
    mainKeyNonce: "zSaD7qlCkiL3T/sOevn0cEGmYiscI3nn",
    encryptedMainKeyWithRecoveryKey:
      "7JPpJndo2DITVFmJehqYbsjqdBN2s12+0vFN2JFaVX3/otaKoNAD5vwQy0zogHey",
    mainKeyWithRecoveryKeyNonce: "0XSemTx362nl8bUbiZ3UguukCpZrYfBB",
    encryptedRecoveryKey: "E3i/4Y71/3pcXMPgLLqSqOq2VaJozlrEkfi3Tvce5ebEJ0iN+oW0R0xrEX3syzPd",
    recoveryKeyNonce: "zfjcPouP7s3GdGRaxIS1b7NjC/mLZIVt",
    publicKey: "roJWYvAhRDcTaD+B7b3Uvm16ZLUykJCYsFiVcSUBaSw=",
    encryptedPrivateKey: "NqxC86JnShzQ/2IfkzohXiC9eflaun2j0PMoo1Izqaz1OQ1HqoPZdh5LMW9KEfr+",
    privateKeyNonce: "VnyjEH+bP6hj/VVZNH6HLqdEplUws+82",
    opsLimit: 16,
    memLimit: 268435456,
  },
};

export const validSignUpPassword = "test-password";
