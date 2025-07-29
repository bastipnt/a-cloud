import { Form, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";
import Button from "../components/Button";
import FormField from "../components/FormField";

const signUpSchema = object({
  email: string().email().required(),
});

export type SignUpFormValues = InferType<typeof signUpSchema>;

interface FormProps {
  handleSubmit: (values: SignUpFormValues) => Promise<void>;
}

const SignUpInnerForm: React.FC<FormikProps<SignUpFormValues>> = ({
  touched,
  errors,
  isSubmitting,
}) => {
  return (
    <Form className="flex w-3xs flex-col gap-4 p-4">
      <div className="flex flex-col">
        <label htmlFor="email">Email</label>
        <FormField id="email" type="email" name="email" placeholder="annie@mail.org" />
        {touched.email && errors.email && <div>{errors.email}</div>}
      </div>

      <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
        Submit
      </Button>
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
