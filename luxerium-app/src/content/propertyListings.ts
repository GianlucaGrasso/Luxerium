// src/content/propertyListings.ts

const basePrice = Math.round(Math.random() * 500000 + 500000);
const price = `$${basePrice.toLocaleString()}`;
const extra = `$${Math.round(basePrice / 48).toLocaleString()} per month`;


export default [
  {
    id: 1,
    slug: "modern-apartment-lomas-de-zamora-1",
    price: `$${Math.round(Math.random() * 500000 + 500000).toLocaleString()}`,
    extra: `$${Math.round((Math.round(Math.random() * 500000 + 500000)) / 48)} per month`,
    location: {
      country: "Argentina",
      state: "Buenos Aires",
      city: "Lomas de Zamora",
      address: "249 Avenida Hipólito Yrigoyen",
      zipcode: "B1832",
      pluscode: "8QC7+22"
    },
    status: 2,
    features: {
      type: "House",
      area: "150 m²",
      year: 2020,
      bedrooms: 1,
      bathrooms: 2.5,
      slots: 2
    },
    description: "Modern apartment in the heart of Lomas de Zamora, featuring spacious living areas and a balcony with city views.",
    tags: ["modern", "city view", "balcony"],
    amenities: ["gym", "pool", "parking"],
    agency: "Realtor Sur",
    agentName: ["Sebastian", "Banfield"],
    media: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
    ]
  },
  {
    id: 2,
    slug: "modern-apartment-villa-general-belgrano",
    price: "$1,200,000",
    extra: "$12,500 per month",
    location: {
      country: "Argentina",
      state: "Cordoba",
      city: "Villa General Belgrano",
      address: "Calle San Martin n° 1234",
      zipcode: "5194",
      pluscode: "8QF5+34"
    },
    status: 2,
    features: {
      type: "Apartment",
      area: "150 m²",
      year: 2020,
      bedrooms: 3,
      bathrooms: 2.5,
      slots: 2
    },
    description: "Modern apartment in the heart of Villa General Belgrano, featuring spacious living areas and a balcony with city views.",
    tags: ["modern", "city view", "balcony"],
    amenities: ["gym", "pool", "parking"],
    agency: "Luxerium Realty",
    agentName: ["Lucia", "Fernandez"],
    media: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
    ]
  }
];