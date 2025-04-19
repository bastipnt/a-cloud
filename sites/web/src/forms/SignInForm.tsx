import { Field, Form, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";

const signInSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export type SignInFormValues = InferType<typeof signInSchema>;

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
    <Form className="flex w-3xs flex-col gap-4 p-4">
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <Field
          className="border p-1"
          id="email"
          type="email"
          name="email"
          placeholder="annie@mail.org"
        />
        {touched.email && errors.email && <div>{errors.email}</div>}
      </div>

      <div className="flex flex-col">
        <label htmlFor="password">Password</label>
        <Field className="border p-1" id="password" name="password" type="password" />
        {touched.password && errors.password && <div>{errors.password}</div>}
      </div>

      <button className="cursor-pointer border p-1" type="submit" disabled={isSubmitting}>
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
