import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";

import react from "@astrojs/react";
import { propsToFilename } from 'astro/assets/utils';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()]
});

