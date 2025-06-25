export type AuthStackParamList = {
  Login: { 
    returnToScreen?: keyof RootStackParamList;
    returnParams?: any;
  } | undefined;
  LoginEmail: {
    email?: string;
    returnToScreen?: keyof RootStackParamList;
    returnParams?: any;
  } | undefined;
  Signup: { 
    email?: string;
    returnToScreen?: keyof RootStackParamList;
    returnParams?: any;
  } | undefined;
  SignupEmail: { 
    email?: string;
    returnToScreen?: keyof RootStackParamList;
    returnParams?: any;
  } | undefined;
  // Add other auth screens as needed (Register, ForgotPassword, etc.)
};

export type MainStackParamList = {
  Main: undefined;
  Auth: {
    screen?: keyof AuthStackParamList;
    params?: any;
  } | undefined;
};

export type TabStackParamList = {
  Home: undefined;
  Explore: {
    screen?: string;
    params?: any;
  } | undefined;
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
