-- CreateExtension
DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'timescaledb') THEN
      CREATE EXTENSION "timescaledb";
   END IF;
END
$$;
