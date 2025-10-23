import { FormikProvider, useFormik } from "formik";
import React from "react";
import { InferType, object, string } from "yup";
import Button from "../components/Button";
import FormField from "../components/FormField";

const signInSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export type SignInFormValues = InferType<typeof signInSchema>;

interface FormProps {
  existingEmail: string;
  handleSubmit: (values: SignInFormValues) => Promise<void>;
}

const SignInForm: React.FC<FormProps> = ({ existingEmail, handleSubmit }) => {
  const formik = useFormik<SignInFormValues>({
    initialValues: {
      email: existingEmail || "",
      password: "",
    },
    enableReinitialize: true, // keeps behavior from your HOC version
    validationSchema: signInSchema,
    onSubmit: async (values, formikHelpers) => {
      try {
        await handleSubmit(values);
      } finally {
        formikHelpers.setSubmitting(false);
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="flex w-3xs flex-col gap-4 p-4" noValidate>
        <FormField type="email" name="email" label="Email" placeholder="annie@mail.org" required />

        <FormField name="password" type="password" label="Password" required />

        <Button type="submit" disabled={formik.isSubmitting} loading={formik.isSubmitting}>
          Submit
        </Button>
      </form>
    </FormikProvider>
  );
};

export default SignInForm;
