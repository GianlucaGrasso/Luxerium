import { defineCollection, z } from 'astro:content';
import propertyListings from './propertyListings';

const realEstate = defineCollection({
  type: 'data',
  schema: z.object({
    id: z.number(),
    slug: z.string(),
    price: z.string(),
    extra: z.string().optional(),
    location: z.object({
      country: z.string(),
      state: z.string(),
      city: z.string(),
      address: z.string(),
      zipcode: z.string(),
      pluscode: z.string().optional()
    }),
    status: z.number(),
    features: z.object({
      type: z.string(),
      area: z.string(),
      year: z.number(),
      bedrooms: z.number(),
      bathrooms: z.number(),
      slots: z.number()
    }),
    description: z.string(),
    tags: z.array(z.string()),
    amenities: z.array(z.string()),
    agency: z.string(),
    agentName: z.array(z.string()),
    media: z.array(z.string())
  })
});

export const collections = { realEstate };