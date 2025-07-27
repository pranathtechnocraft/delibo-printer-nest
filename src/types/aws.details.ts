export const AWSDETAILS = {
  region: 'ap-south-1',

  cognito: {
    UserPoolId: 'ap-south-1_5Us6OH0Xr',
    ClientId: '7l7deqmnn53h5m4e600l3s58e7',
    IdentityPoolId: 'ap-south-1:70d9a236-daf1-4b16-a3ba-f041b3dcb9bd',
  },

  iot: {
    HOST: 'a1jeezsyjov2le-ats.iot.ap-south-1.amazonaws.com',
  },

  systemManager: {
    privateKey: '/delibo/devs/privateKey',
    certificatePem: '/delibo/devs/certificate.pem.crt',
    AmazonRootCA1: '/delibo/devs/AmazonRootCA1.pem',
  },
} as const;
