import { Field, Form, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";

const signUpSchema = object({
  email: string().email().required(),
});

export interface SignUpFormValues extends InferType<typeof signUpSchema> {}

interface FormProps {
  handleSubmit: (values: SignUpFormValues) => Promise<void>;
}

const SignUpInnerForm: React.FC<FormikProps<SignUpFormValues>> = ({
  touched,
  errors,
  isSubmitting,
}) => {
  return (
    <Form>
      <label htmlFor="email">Email</label>
      <Field id="email" type="email" name="email" placeholder="annie@mail.org" />
      {touched.email && errors.email && <div>{errors.email}</div>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  );
};

const SignUpForm = withFormik<FormProps, SignUpFormValues>({
  mapPropsToValues: () => {
    return {
      email: "",
    };
  },

  validationSchema: signUpSchema,

  handleSubmit: (values, { props: { handleSubmit } }) => handleSubmit(values),
})(SignUpInnerForm);

export default SignUpForm;
