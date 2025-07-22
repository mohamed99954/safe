import { createClient } from "@supabase/supabase-js";
import type { Database } from "./custom-types"; // use the detailed Database type with tables

const SUPABASE_URL = "https://lawatugvcjmrbxzgjfqm.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxhd2F0dWd2Y2ptcmJ4emdqZnFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUxNjY3ODAsImV4cCI6MjA2MDc0Mjc4MH0.aSOXbVciLS9m541wjHipe7JXiPWJfEhSBv8O3dC80mc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);
