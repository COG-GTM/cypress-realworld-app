import React, { useEffect, useRef, useState } from "react";
import { styled } from "@mui/material/styles";
import NumberFormat from "react-number-format";
import { Formik, Form, Field, FieldProps, useFormikContext } from "formik";
import { string, object, number, mixed } from "yup";
import {
  Paper,
  Typography,
  Button,
  Grid,
  Container,
  Avatar,
  Box,
  TextField,
  MenuItem,
} from "@mui/material";
import { User, ScheduledPaymentFrequency } from "../models";
import { dollarsToCents, tomorrowIsoDate } from "../utils/transactionUtils";
import { ScheduledTransactionCreatePayload } from "../machines/createTransactionMachine";

const PREFIX = "TransactionCreateStepTwo";

const classes = {
  paper: `${PREFIX}-paper`,
  form: `${PREFIX}-form`,
  submit: `${PREFIX}-submit`,
};

const StyledPaper = styled(Paper)(({ theme }) => ({
  [`&.${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  [`& .${classes.form}`]: {
    width: "100%",
    marginTop: theme.spacing(1),
  },

  [`& .${classes.submit}`]: {
    margin: theme.spacing(3, 0, 2),
  },
}));

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

const baseSchema = {
  amount: number().required("Please enter a valid amount"),
  description: string().required("Please enter a note"),
  senderId: string(),
  receiverId: string(),
};

const validationSchema = object(baseSchema);

// Mirrors the POST /scheduledPayments validator
const scheduleValidationSchema = () =>
  object({
    ...baseSchema,
    amount: baseSchema.amount
      .positive("Please enter a valid amount")
      .test("whole-cents", "Amount can have at most 2 decimal places", (value) =>
        value === undefined ? true : Math.abs(dollarsToCents(value) - value * 100) < 1e-6
      ),
    description: baseSchema.description.trim(),
    startDate: string()
      .required("Please pick a start date")
      .matches(isoDate, "Please pick a valid date")
      .test("from-tomorrow", "Start date must be tomorrow or later", (value) =>
        value === undefined ? true : value >= tomorrowIsoDate()
      ),
    frequency: mixed<ScheduledPaymentFrequency>()
      .oneOf(Object.values(ScheduledPaymentFrequency))
      .required(),
    endDate: string()
      .matches(isoDate, "Please pick a valid date")
      .test("after-start", "End date must be on or after the start date", function (value) {
        return !value || !this.parent.startDate || value >= this.parent.startDate;
      }),
  });

interface NumberFormatCustomProps {
  inputRef: (el: HTMLInputElement) => void;
  onChange: (event: { target: { value: string } }) => void;
}

function NumberFormatCustom(props: NumberFormatCustomProps) {
  const { inputRef, onChange, ...other } = props;

  return (
    <NumberFormat
      {...other}
      getInputRef={inputRef}
      onValueChange={(values) => {
        onChange({
          target: {
            ...other,
            value: values.value,
          },
        });
      }}
      thousandSeparator
      isNumericString
      prefix="$"
    />
  );
}

// Formik only revalidates on field changes, so rerun it when the schema switches
const RevalidateOnChange: React.FC<{ trigger: unknown }> = ({ trigger }) => {
  const { validateForm } = useFormikContext();
  useEffect(() => {
    validateForm();
  }, [trigger, validateForm]);
  return null;
};

export interface TransactionCreateStepTwoProps {
  receiver: User;
  sender: User;
  createTransaction: Function;
  scheduleTransaction: (payload: ScheduledTransactionCreatePayload) => Promise<void>;
  showSnackbar: Function;
}

interface FormValues {
  amount: number | "";
  description: string;
  senderId: string;
  receiverId: string;
  startDate: string;
  frequency: ScheduledPaymentFrequency;
  endDate: string;
}

const frequencyOptions = [
  { value: ScheduledPaymentFrequency.once, label: "One time" },
  { value: ScheduledPaymentFrequency.weekly, label: "Weekly" },
  { value: ScheduledPaymentFrequency.monthly, label: "Monthly" },
];

const TransactionCreateStepTwo: React.FC<TransactionCreateStepTwoProps> = ({
  receiver,
  sender,
  createTransaction,
  scheduleTransaction,
  showSnackbar,
}) => {
  const [transactionType, setTransactionType] = useState<string>();
  const [scheduling, setScheduling] = useState(false);
  // Set synchronously on click so Formik validates the action being submitted
  const immediateAction = useRef(false);
  const initialValues: FormValues = {
    amount: "",
    description: "",
    senderId: sender.id,
    receiverId: receiver.id,
    startDate: tomorrowIsoDate(),
    frequency: ScheduledPaymentFrequency.once,
    endDate: "",
  };

  return (
    <StyledPaper className={classes.paper} elevation={0}>
      <Box display="flex" height={200} alignItems="center" justifyContent="center">
        <Grid container direction="column" justifyContent="flex-start" alignItems="center">
          <Grid item>
            <Avatar src={receiver.avatar} />
          </Grid>
          <Grid item>
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              {receiver.firstName} {receiver.lastName}
              {transactionType}
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Container maxWidth="xs">
        <Formik
          initialValues={initialValues}
          validationSchema={() =>
            scheduling && !immediateAction.current ? scheduleValidationSchema() : validationSchema
          }
          validateOnMount={true}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);

            // reset transactionType
            setTransactionType(undefined);

            const { startDate, frequency, endDate, ...transactionValues } = values;

            if (transactionType === "schedule") {
              try {
                await scheduleTransaction({
                  transactionType,
                  receiverId: values.receiverId,
                  amount: dollarsToCents(values.amount),
                  description: values.description.trim(),
                  frequency,
                  startDate,
                  ...(frequency !== ScheduledPaymentFrequency.once && endDate ? { endDate } : {}),
                });
              } catch (error: any) {
                const reason = error?.response?.data?.errors?.[0];
                showSnackbar({
                  severity: "error",
                  message: reason
                    ? `Payment not scheduled: ${reason.path ?? reason.param} ${reason.msg}`
                    : "Payment not scheduled. Please try again.",
                });
                setSubmitting(false);
                return;
              }
              showSnackbar({
                severity: "success",
                message: "Payment Scheduled!",
              });
              return;
            }

            createTransaction({ transactionType, ...transactionValues });
            showSnackbar({
              severity: "success",
              message: "Transaction Submitted!",
            });
          }}
        >
          {({ isValid, isSubmitting, errors, values, setFieldValue }) => (
            <Form className={classes.form} data-test="transaction-create-form" noValidate>
              <RevalidateOnChange trigger={scheduling} />
              <Field name="amount">
                {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    autoFocus
                    id={"transaction-create-amount-input"}
                    type="text"
                    placeholder="Amount"
                    data-test={"transaction-create-amount-input"}
                    error={(touched || value !== initialValue) && Boolean(error)}
                    helperText={touched || value !== initialValue ? error : ""}
                    InputProps={{
                      inputComponent: NumberFormatCustom as any,
                      inputProps: { id: "amount" },
                    }}
                    {...field}
                  />
                )}
              </Field>
              <Field name="description">
                {({ field, meta: { error, value, initialValue, touched } }: FieldProps) => (
                  <TextField
                    variant="outlined"
                    margin="dense"
                    fullWidth
                    required
                    id={"transaction-create-description-input"}
                    type="text"
                    placeholder="Add a note"
                    data-test={"transaction-create-description-input"}
                    error={(touched || value !== initialValue) && Boolean(error)}
                    helperText={touched || value !== initialValue ? error : ""}
                    {...field}
                  />
                )}
              </Field>
              {scheduling && (
                <Box data-test="transaction-create-schedule-fields">
                  <Field name="startDate">
                    {({ field, meta: { error } }: FieldProps) => (
                      <TextField
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        required
                        id="transaction-create-start-date-input"
                        type="date"
                        label="Start date"
                        InputLabelProps={{ shrink: true }}
                        inputProps={{
                          min: tomorrowIsoDate(),
                          "data-test": "transaction-create-start-date-input",
                        }}
                        error={Boolean(error)}
                        helperText={error}
                        {...field}
                      />
                    )}
                  </Field>
                  <Field name="frequency">
                    {({ field }: FieldProps) => (
                      <TextField
                        select
                        variant="outlined"
                        margin="dense"
                        fullWidth
                        id="transaction-create-frequency-select"
                        label="Frequency"
                        data-test="transaction-create-frequency-select"
                        {...field}
                        onChange={(event) => {
                          field.onChange(event);
                          if (event.target.value === ScheduledPaymentFrequency.once) {
                            setFieldValue("endDate", "");
                          }
                        }}
                      >
                        {frequencyOptions.map(({ value, label }) => (
                          <MenuItem
                            key={value}
                            value={value}
                            data-test={`transaction-create-frequency-${value}`}
                          >
                            {label}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  </Field>
                  {values.frequency !== ScheduledPaymentFrequency.once && (
                    <Field name="endDate">
                      {({ field, meta: { error } }: FieldProps) => (
                        <TextField
                          variant="outlined"
                          margin="dense"
                          fullWidth
                          id="transaction-create-end-date-input"
                          type="date"
                          label="End date (optional)"
                          InputLabelProps={{ shrink: true }}
                          inputProps={{
                            min: values.startDate || tomorrowIsoDate(),
                            "data-test": "transaction-create-end-date-input",
                          }}
                          error={Boolean(error)}
                          helperText={error}
                          {...field}
                        />
                      )}
                    </Field>
                  )}
                </Box>
              )}
              <Grid
                container
                spacing={2}
                direction="row"
                justifyContent="center"
                alignItems="center"
              >
                <Grid item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    data-test="transaction-create-submit-request"
                    disabled={!!errors.amount || !!errors.description || isSubmitting}
                    onClick={() => {
                      // Immediate actions ignore the schedule fields
                      immediateAction.current = true;
                      setScheduling(false);
                      setTransactionType("request");
                    }}
                  >
                    Request
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.submit}
                    data-test="transaction-create-submit-payment"
                    disabled={!!errors.amount || !!errors.description || isSubmitting}
                    onClick={() => {
                      immediateAction.current = true;
                      setScheduling(false);
                      setTransactionType("payment");
                    }}
                  >
                    Pay
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    type="submit"
                    fullWidth
                    variant={scheduling ? "contained" : "outlined"}
                    color="primary"
                    className={classes.submit}
                    data-test="transaction-create-submit-schedule"
                    disabled={scheduling && (!isValid || isSubmitting)}
                    onClick={(event) => {
                      immediateAction.current = false;
                      if (scheduling) {
                        setTransactionType("schedule");
                      } else {
                        // First click only reveals the schedule fields
                        event.preventDefault();
                        setScheduling(true);
                      }
                    }}
                  >
                    Schedule
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Container>
    </StyledPaper>
  );
};

export default TransactionCreateStepTwo;
