import { Form, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";
import Button from "../components/Button";
import FormField from "../components/FormField";

const ottSchema = object({
  email: string().email().required(),
  ott: string().required().min(6).max(6), // TODO: regex
});

export type OTTFormValues = InferType<typeof ottSchema>;

interface FormProps {
  existingEmail?: string;
  existingOTT?: string;
  handleSubmit: (values: OTTFormValues) => Promise<void>;
}

const OTTInnerForm: React.FC<FormProps & FormikProps<OTTFormValues>> = ({
  touched,
  errors,
  isSubmitting,
  existingEmail,
}) => {
  return (
    <Form className="flex w-3xs flex-col gap-4 p-4">
      <label htmlFor="email">Email</label>
      <FormField
        id="email"
        type="email"
        name="email"
        placeholder="annie@mail.org"
        disabled={existingEmail && !errors.email}
      />
      {touched.email && errors.email && <div>{errors.email}</div>}

      <label htmlFor="ott">Token</label>
      <FormField id="ott" name="ott" />
      {touched.ott && errors.ott && <div>{errors.ott}</div>}

      <Button type="submit" disabled={isSubmitting} loading={isSubmitting}>
        Submit
      </Button>
    </Form>
  );
};

const OTTForm = withFormik<FormProps, OTTFormValues>({
  mapPropsToValues: (props) => {
    return {
      email: props.existingEmail || "",
      ott: props.existingOTT || "",
    };
  },

  enableReinitialize: true,

  validationSchema: ottSchema,

  handleSubmit: (values, { props: { handleSubmit } }) => handleSubmit(values),
})(OTTInnerForm);

export default OTTForm;
