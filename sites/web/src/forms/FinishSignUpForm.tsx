import { Form, FormikErrors, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";
import Button from "../components/Button";
import FormField from "../components/FormField";

const finishSignUpSchema = object({
  email: string().email().required(),
  password: string().required().min(8), // TODO: regex
  passwordRepeat: string().required(),
});

export type FinishSignUpFormValues = InferType<typeof finishSignUpSchema>;

interface FormProps {
  existingEmail: string;
  handleSubmit: (values: FinishSignUpFormValues) => Promise<void>;
}

const FinishSignUpInnerForm: React.FC<FormikProps<FinishSignUpFormValues>> = ({
  touched,
  errors,
  isSubmitting,
}) => {
  return (
    <Form className="flex w-3xs flex-col gap-4 p-4">
      <label htmlFor="email">Email</label>
      <FormField id="email" type="email" name="email" placeholder="annie@mail.org" disabled />

      <label htmlFor="password">Password</label>
      <FormField id="password" name="password" type="password" />
      {touched.password && errors.password && <div>{errors.password}</div>}

      <label htmlFor="passwordRepeat">Repeat Password</label>
      <FormField id="passwordRepeat" name="passwordRepeat" type="password" />
      {touched.passwordRepeat && errors.passwordRepeat && <div>{errors.passwordRepeat}</div>}

      <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
        Submit
      </Button>
    </Form>
  );
};

const FinishSignUpForm = withFormik<FormProps, FinishSignUpFormValues>({
  mapPropsToValues: (props) => {
    return {
      email: props.existingEmail,
      password: "",
      passwordRepeat: "",
    };
  },

  enableReinitialize: true,

  validationSchema: finishSignUpSchema,

  validate: (values: FinishSignUpFormValues) => {
    const errors: FormikErrors<FinishSignUpFormValues> = {};

    if (
      values.password.length > 0 &&
      values.passwordRepeat.length > 0 &&
      values.password !== values.passwordRepeat
    ) {
      errors.passwordRepeat = "Passwords not equal";
    }

    return errors;
  },

  handleSubmit: (values, { props: { handleSubmit } }) => handleSubmit(values),
})(FinishSignUpInnerForm);

export default FinishSignUpForm;
