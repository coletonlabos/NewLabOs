-- Users table (if you haven't set up auth already)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Objects table
CREATE TABLE IF NOT EXISTS objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Properties table
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  object_id UUID REFERENCES objects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  value JSONB,
  color_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Relations table
CREATE TABLE IF NOT EXISTS relations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_object_id UUID REFERENCES objects(id) ON DELETE CASCADE,
  to_object_id UUID REFERENCES objects(id) ON DELETE CASCADE,
  relation_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS objects_user_id_idx ON objects(user_id);
CREATE INDEX IF NOT EXISTS properties_object_id_idx ON properties(object_id);
CREATE INDEX IF NOT EXISTS relations_from_object_id_idx ON relations(from_object_id);
CREATE INDEX IF NOT EXISTS relations_to_object_id_idx ON relations(to_object_id);

-- Row Level Security (RLS) policies
-- Enable RLS on all tables
ALTER TABLE objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE relations ENABLE ROW LEVEL SECURITY;

-- Create policies for objects table
CREATE POLICY "Users can view their own objects" ON objects
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own objects" ON objects
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own objects" ON objects
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own objects" ON objects
  FOR DELETE USING (user_id = auth.uid());

-- Create policies for properties table (based on object ownership)
CREATE POLICY "Users can view properties of their own objects" ON properties
  FOR SELECT USING (object_id IN (SELECT id FROM objects WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert properties to their own objects" ON properties
  FOR INSERT WITH CHECK (object_id IN (SELECT id FROM objects WHERE user_id = auth.uid()));

CREATE POLICY "Users can update properties of their own objects" ON properties
  FOR UPDATE USING (object_id IN (SELECT id FROM objects WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete properties of their own objects" ON properties
  FOR DELETE USING (object_id IN (SELECT id FROM objects WHERE user_id = auth.uid()));

-- Create policies for relations table (based on object ownership)
CREATE POLICY "Users can view relations involving their own objects" ON relations
  FOR SELECT USING (
    from_object_id IN (SELECT id FROM objects WHERE user_id = auth.uid()) OR
    to_object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create relations involving their own objects" ON relations
  FOR INSERT WITH CHECK (
    from_object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update relations involving their own objects" ON relations
  FOR UPDATE USING (
    from_object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete relations involving their own objects" ON relations
  FOR DELETE USING (
    from_object_id IN (SELECT id FROM objects WHERE user_id = auth.uid())
  ); 