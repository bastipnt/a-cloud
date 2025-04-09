import { Field, Form, FormikProps, withFormik } from "formik";
import { object, string, InferType } from "yup";

const signInSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export interface SignInFormValues extends InferType<typeof signInSchema> {}

interface FormProps {
  existingEmail: string;
  handleSubmit: (values: SignInFormValues) => Promise<void>;
}

const SignInInnerForm: React.FC<FormikProps<SignInFormValues>> = ({
  touched,
  errors,
  isSubmitting,
}) => {
  return (
    <Form>
      <label htmlFor="email">Email</label>
      <Field
        id="email"
        type="email"
        name="email"
        placeholder="annie@mail.org"
      />
      {touched.email && errors.email && <div>{errors.email}</div>}

      <label htmlFor="password">Password</label>
      <Field id="password" name="password" type="password" />
      {touched.password && errors.password && <div>{errors.password}</div>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  );
};

const SignInForm = withFormik<FormProps, SignInFormValues>({
  mapPropsToValues: (props) => {
    return {
      email: props.existingEmail || "",
      password: "",
    };
  },

  enableReinitialize: true,

  validationSchema: signInSchema,

  handleSubmit: (values, { props: { handleSubmit } }) => handleSubmit(values),
})(SignInInnerForm);

export default SignInForm;
