export type AuthStackParamList = {
  Login: undefined;
  // Add other auth screens as needed (Register, ForgotPassword, etc.)
};

export type MainStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type TabStackParamList = {
  Home: undefined;
  Explore: undefined;
  Bookings: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Home: undefined;
  TripDetail: { id: string };
  ConfirmPay: {
    tripDetails: {
      title: string;
      image: any;
      rating: number;
      reviewCount: number;
      date: string;
      timeSlot: string;
      price: string;
      guestCount: number;
    };
  };
  // Add other screens as needed
};
