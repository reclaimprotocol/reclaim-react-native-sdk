export const providers: { [key: string]: { title: string; imagePath: string; provider?: string } } =
  {
    'google-login': {
      title: 'Google',
      imagePath: '@app/assets/google.png',
    },
    'github-repo': {
      title: 'Github',
      imagePath: '@app/assets/github.png',
    },
    'amazon-order-history': {
      provider: 'amazon-order-history',
      imagePath: '@app/assets/amazon-order-history.png',
      title: 'Amazon Order History',
    },
    'mock-login': {
      title: 'Mock',
      imagePath: '@app/assets/mock.png',
    },
  }
