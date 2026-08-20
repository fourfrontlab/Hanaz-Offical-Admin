ALTER TABLE products
  ALTER COLUMN ingredients SET DATA TYPE jsonb USING
  CASE 
    WHEN ingredients IS NULL THEN NULL
    WHEN ingredients = '' THEN '[]'::jsonb
    ELSE jsonb_build_array(jsonb_build_object('name', 'Ingredients', 'description', ingredients))
  END;
