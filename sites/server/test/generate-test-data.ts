import { genValidSignUpParams, validSignUpPassword } from "./test-data";

const signUpParameters = await genValidSignUpParams(validSignUpPassword);

console.log(signUpParameters);
