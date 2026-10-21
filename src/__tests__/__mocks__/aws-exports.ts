// Stand-in for the generated src/aws-exports.js so unit tests don't depend on `yarn predev:cognito`.
export default {
  Auth: {
    Cognito: {
      userPoolId: "us-east-1_TEST",
      userPoolClientId: "test-client-id",
    },
  },
};
