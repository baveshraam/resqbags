export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  city: string;
  address: string;
  rating: number;
  reviewCount: number;
  verified: boolean;
  heroImage: string;
  ownerNote: string;
  description: string;
}

export interface RescueBag {
  id: string;
  restaurantId: string;
  restaurant: Restaurant;
  name: string;
  description: string;
  originalPrice: number;
  rescuePrice: number;
  stockLeft: number;
  pickupStart: string;
  pickupEnd: string;
  imageUrl: string;
  possibleContents: string[];
  allergenNote: string;
  isActive: boolean;
}

export interface CartItem {
  bag: RescueBag;
  quantity: number;
}

export interface Order {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  bagName: string;
  totalAmount: number;
  status: 'active' | 'upcoming' | 'past' | 'cancelled';
  pickupCode: string;
  pickupTimeStart: string;
  pickupTimeEnd: string;
  createdAt: string;
  items: CartItem[];
}

export interface CommunityPost {
  id: string;
  userName: string;
  userAvatar: string;
  imageUrl: string;
  caption: string;
  restaurantName: string;
  likes: number;
  timeAgo: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  progress?: number;
  total?: number;
}
