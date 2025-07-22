
export const createProfilesTableSql = `
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NOT NULL,
  address text,
  profile_image text,
  birth_date date,
  user_type text CHECK (user_type IN ('customer', 'driver', 'admin')) NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
`;

export const createDriversTableSql = `
CREATE TABLE IF NOT EXISTS public.drivers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  national_id text NOT NULL,
  license_number text NOT NULL,
  license_image text,
  vehicle_info jsonb NOT NULL,
  status text CHECK (status IN ('pending', 'approved', 'rejected', 'frozen')) DEFAULT 'pending',
  rejection_reason text,
  rating numeric,
  is_available boolean DEFAULT false,
  location jsonb,
  documents jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
`;
