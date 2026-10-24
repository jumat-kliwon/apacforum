-- The 10 images uploaded to R2 before uploads were converted to WebP. Their WebP copies sit next to them
-- under the same key with a .webp extension. Only these keys are touched, so other databases are unaffected.
UPDATE "partners" SET "logo_key" = regexp_replace("logo_key", '\.(png|jpg)$', '.webp') WHERE "logo_key" IN (
  'partners/01a145a5-7e2b-7a95-a628-3c28093dc9a1.png',
  'partners/01a145a6-a402-7c66-af9d-ce0834a7e440.png',
  'partners/01a14b00-3ed4-7233-a616-0f3406523cf6.png',
  'partners/01a14c9a-fbbb-7a1c-a9a2-0a978f299657.jpg',
  'partners/01a14c9b-4f45-71c9-9ba9-d8db2114c799.jpg',
  'partners/01a14c9b-7b1b-7775-a291-4f0f0e2846ed.jpg',
  'partners/01a14c9c-6ec8-7b9f-af77-6a0cf0f84d52.jpg',
  'partners/01a14c9c-a3d4-7339-ae6a-b4b08cf81a00.jpg',
  'partners/01a14c9d-28e2-725d-a2ee-7bd79d90093b.jpg'
);--> statement-breakpoint
UPDATE "speakers" SET "photo_key" = regexp_replace("photo_key", '\.(png|jpg)$', '.webp') WHERE "photo_key" IN (
  'speakers/01a145a8-5411-742c-996a-a11d717718aa.png'
);
