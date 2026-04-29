import { create } from 'zustand';

interface MerchantState {
  restaurant: {
    restaurantId?: string;
    name: string;
    cuisine: string;
    ownerName: string;
    phone: string;
    address: string;
  };
  bag: {
    priceRange: string;
    title: string;
    description: string;
    contents: string;
    pickupStart: string;
    pickupEnd: string;
    quantity: string;
  };
  setRestaurantId: (id: string) => void;
  setRestaurantDetails: (details: Partial<MerchantState['restaurant']>) => void;
  setLocation: (address: string) => void;
  setPriceRange: (priceRange: string) => void;
  setBagDetails: (details: Partial<MerchantState['bag']>) => void;
  setPickupDetails: (details: Partial<MerchantState['bag']>) => void;
  resetBag: () => void;
  resetAll: () => void;
}

const initialState = {
  restaurant: {
    restaurantId: undefined,
    name: '',
    cuisine: '',
    ownerName: '',
    phone: '',
    address: '',
  },
  bag: {
    priceRange: '',
    title: '',
    description: '',
    contents: '',
    pickupStart: '',
    pickupEnd: '',
    quantity: '',
  },
};

export const useMerchantStore = create<MerchantState>((set) => ({
  ...initialState,
  
  setRestaurantId: (id) =>
    set((state) => ({
      restaurant: { ...state.restaurant, restaurantId: id },
    })),

  setRestaurantDetails: (details) =>
    set((state) => ({
      restaurant: { ...state.restaurant, ...details },
    })),
    
  setLocation: (address) =>
    set((state) => ({
      restaurant: { ...state.restaurant, address },
    })),
    
  setPriceRange: (priceRange) =>
    set((state) => ({
      bag: { ...state.bag, priceRange },
    })),
    
  setBagDetails: (details) =>
    set((state) => ({
      bag: { ...state.bag, ...details },
    })),
    
  setPickupDetails: (details) =>
    set((state) => ({
      bag: { ...state.bag, ...details },
    })),
    
  resetBag: () =>
    set((state) => ({
      bag: initialState.bag,
    })),

  resetAll: () => set(initialState),
}));
