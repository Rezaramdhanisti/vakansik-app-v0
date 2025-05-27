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
