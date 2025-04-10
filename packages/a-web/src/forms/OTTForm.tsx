import { Field, Form, FormikProps, withFormik } from "formik";
import { InferType, object, string } from "yup";

const ottSchema = object({
  email: string().email().required(),
  ott: string().required().min(6).max(6), // TODO: regex
});

export interface OTTFormValues extends InferType<typeof ottSchema> {}

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
    <Form>
      <label htmlFor="email">Email</label>
      <Field
        id="email"
        type="email"
        name="email"
        placeholder="annie@mail.org"
        disabled={existingEmail && !errors.email}
      />
      {touched.email && errors.email && <div>{errors.email}</div>}

      <label htmlFor="ott">Token</label>
      <Field id="ott" name="ott" type="ott" />
      {touched.ott && errors.ott && <div>{errors.ott}</div>}

      <button type="submit" disabled={isSubmitting}>
        Submit
      </button>
    </Form>
  );
};

const OTTForm = withFormik<FormProps, OTTFormValues>({
  mapPropsToValues: (props) => {
    console.log(props);

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
