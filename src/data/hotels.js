// Mock hotel inventory for TripNest. In a real site this comes from an API.

export const hotels = [
  {
    id: 'HTL-001',
    name: 'The Taj Palace',
    city: 'New Delhi',
    country: 'India',
    rating: 4.8,
    reviews: 2140,
    pricePerNight: 220,
    stars: 5,
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Restaurant', 'Gym', 'Bar'],
    roomTypes: ['Deluxe Room', 'Executive Suite', 'Presidential Suite'],
    description:
      'A landmark of luxury in the heart of the capital, blending timeless elegance with modern comfort.',
  },
  {
    id: 'HTL-002',
    name: 'Marina Bay Retreat',
    city: 'Singapore',
    country: 'Singapore',
    rating: 4.7,
    reviews: 3890,
    pricePerNight: 310,
    stars: 5,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&q=80',
    amenities: ['Free WiFi', 'Infinity Pool', 'Spa', 'Restaurant', 'Gym', 'Airport Shuttle'],
    roomTypes: ['City View Room', 'Bay View Suite', 'Sky Villa'],
    description:
      'Iconic skyline views and a rooftop infinity pool overlooking Marina Bay.',
  },
  {
    id: 'HTL-003',
    name: 'Alpine Lodge Zermatt',
    city: 'Zermatt',
    country: 'Switzerland',
    rating: 4.9,
    reviews: 1520,
    pricePerNight: 480,
    stars: 5,
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
    amenities: ['Free WiFi', 'Ski Storage', 'Spa', 'Fireplace', 'Restaurant', 'Sauna'],
    roomTypes: ['Cozy Room', 'Matterhorn View Suite', 'Chalet'],
    description:
      'A warm alpine escape with uninterrupted views of the Matterhorn.',
  },
  {
    id: 'HTL-004',
    name: 'Santorini Blue Villas',
    city: 'Santorini',
    country: 'Greece',
    rating: 4.9,
    reviews: 2760,
    pricePerNight: 395,
    stars: 5,
    image: 'https://images.unsplash.com/photo-1570213489059-0aac6626cade?w=800&q=80',
    amenities: ['Free WiFi', 'Private Pool', 'Sea View', 'Breakfast', 'Bar'],
    roomTypes: ['Caldera Suite', 'Honeymoon Villa', 'Infinity Villa'],
    description:
      'Whitewashed villas perched over the caldera with legendary sunsets.',
  },
  {
    id: 'HTL-005',
    name: 'Manhattan Grand',
    city: 'New York',
    country: 'USA',
    rating: 4.5,
    reviews: 5210,
    pricePerNight: 350,
    stars: 4,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80',
    amenities: ['Free WiFi', 'Gym', 'Restaurant', 'Bar', 'Business Center'],
    roomTypes: ['Standard Room', 'Deluxe Room', 'Skyline Suite'],
    description:
      'A sophisticated base in Midtown, steps from Times Square and Central Park.',
  },
  {
    id: 'HTL-006',
    name: 'Kyoto Zen Ryokan',
    city: 'Kyoto',
    country: 'Japan',
    rating: 4.8,
    reviews: 1340,
    pricePerNight: 275,
    stars: 4,
    image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
    amenities: ['Free WiFi', 'Onsen', 'Tea House', 'Garden', 'Breakfast'],
    roomTypes: ['Tatami Room', 'Garden Suite', 'Private Onsen Room'],
    description:
      'A traditional ryokan experience with tranquil gardens and hot springs.',
  },
  {
    id: 'HTL-007',
    name: 'Dubai Desert Oasis',
    city: 'Dubai',
    country: 'UAE',
    rating: 4.6,
    reviews: 4120,
    pricePerNight: 290,
    stars: 5,
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=80',
    amenities: ['Free WiFi', 'Pool', 'Spa', 'Desert Safari', 'Restaurant', 'Valet'],
    roomTypes: ['Desert View Room', 'Oasis Suite', 'Royal Tent'],
    description:
      'Modern luxury on the edge of the dunes with world-class dining.',
  },
  {
    id: 'HTL-008',
    name: 'Bali Jungle Resort',
    city: 'Ubud',
    country: 'Indonesia',
    rating: 4.7,
    reviews: 2980,
    pricePerNight: 180,
    stars: 4,
    image: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=800&q=80',
    amenities: ['Free WiFi', 'Infinity Pool', 'Spa', 'Yoga', 'Restaurant'],
    roomTypes: ['Jungle Villa', 'Riverside Suite', 'Pool Villa'],
    description:
      'A serene rainforest hideaway with private pools and daily yoga.',
  },
]

export const destinations = [
  'New Delhi',
  'Singapore',
  'Zermatt',
  'Santorini',
  'New York',
  'Kyoto',
  'Dubai',
  'Ubud',
]

export function findHotel(id) {
  return hotels.find((h) => h.id === id)
}
